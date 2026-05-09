
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('super_admin', 'moderator', 'user');
CREATE TYPE public.mod_permission AS ENUM ('manage_news', 'manage_events', 'manage_members', 'approve_registrations');
CREATE TYPE public.member_status AS ENUM ('pending', 'approved', 'rejected');

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ===== MODERATOR PERMISSIONS =====
CREATE TABLE public.moderator_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission mod_permission NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);
ALTER TABLE public.moderator_permissions ENABLE ROW LEVEL SECURITY;

-- ===== SECURITY DEFINER HELPERS =====
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _perm mod_permission)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'super_admin')
    OR EXISTS (SELECT 1 FROM public.moderator_permissions WHERE user_id = _user_id AND permission = _perm);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin') OR public.has_role(_user_id, 'moderator');
$$;

-- ===== HANDLE NEW USER (auto profile + first user becomes super admin) =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== MEMBERS =====
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  district TEXT NOT NULL,
  thana TEXT NOT NULL,
  profession TEXT NOT NULL,
  education TEXT,
  nid TEXT,
  statement TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  status member_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- ===== NEWS =====
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- ===== EVENTS =====
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ===== POLLS =====
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  voter_fingerprint TEXT,
  option_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- ===== CONTACT MESSAGES =====
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- profiles
CREATE POLICY "profiles_select_self_or_staff" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- user_roles
CREATE POLICY "roles_select_self_or_admin" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- moderator_permissions
CREATE POLICY "perms_select_self_or_admin" ON public.moderator_permissions FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "perms_admin_all" ON public.moderator_permissions FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- members
CREATE POLICY "members_insert_anyone" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "members_select_staff_or_self" ON public.members FOR SELECT
  USING (public.has_permission(auth.uid(), 'manage_members')
         OR public.has_permission(auth.uid(), 'approve_registrations')
         OR (auth.uid() IS NOT NULL AND auth.uid() = user_id));
CREATE POLICY "members_update_staff" ON public.members FOR UPDATE
  USING (public.has_permission(auth.uid(), 'manage_members')
         OR public.has_permission(auth.uid(), 'approve_registrations'));
CREATE POLICY "members_delete_admin" ON public.members FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- news
CREATE POLICY "news_select_published_or_staff" ON public.news FOR SELECT
  USING (published = true OR public.has_permission(auth.uid(), 'manage_news'));
CREATE POLICY "news_write_staff" ON public.news FOR ALL
  USING (public.has_permission(auth.uid(), 'manage_news'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_news'));

-- events
CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_write_staff" ON public.events FOR ALL
  USING (public.has_permission(auth.uid(), 'manage_events'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_events'));

-- polls
CREATE POLICY "polls_select_all" ON public.polls FOR SELECT USING (true);
CREATE POLICY "polls_admin_all" ON public.polls FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- poll_votes
CREATE POLICY "votes_select_all" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_anyone" ON public.poll_votes FOR INSERT WITH CHECK (true);

-- contact_messages
CREATE POLICY "contact_insert_anyone" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_select_staff" ON public.contact_messages FOR SELECT
  USING (public.is_staff(auth.uid()));
CREATE POLICY "contact_update_staff" ON public.contact_messages FOR UPDATE
  USING (public.is_staff(auth.uid()));
