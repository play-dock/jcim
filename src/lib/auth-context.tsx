import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "moderator" | "user";
export type ModPermission =
  | "manage_news"
  | "manage_events"
  | "manage_members"
  | "approve_registrations";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  permissions: ModPermission[];
  isSuperAdmin: boolean;
  isModerator: boolean;
  isStaff: boolean;
  hasPermission: (p: ModPermission) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<ModPermission[]>([]);

  const loadRoles = async (uid: string | null) => {
    if (!uid) {
      setRoles([]);
      setPermissions([]);
      return;
    }
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("moderator_permissions").select("permission").eq("user_id", uid),
    ]);
    setRoles((r ?? []).map((x: any) => x.role as AppRole));
    setPermissions((p ?? []).map((x: any) => x.permission as ModPermission));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      // defer to avoid recursive supabase calls
      setTimeout(() => loadRoles(sess?.user?.id ?? null), 0);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      loadRoles(sess?.user?.id ?? null).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { full_name: fullName },
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refresh = async () => {
    await loadRoles(user?.id ?? null);
  };

  const isSuperAdmin = roles.includes("super_admin");
  const isModerator = roles.includes("moderator");
  const isStaff = isSuperAdmin || isModerator;

  const hasPermission = (p: ModPermission) =>
    isSuperAdmin || permissions.includes(p);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        permissions,
        isSuperAdmin,
        isModerator,
        isStaff,
        hasPermission,
        signIn,
        signUp,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
