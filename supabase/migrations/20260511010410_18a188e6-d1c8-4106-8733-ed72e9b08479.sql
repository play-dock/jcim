
-- Background music tracks table
CREATE TABLE public.background_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  audio_url text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.background_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracks_select_all" ON public.background_tracks
  FOR SELECT USING (true);

CREATE POLICY "tracks_write_staff" ON public.background_tracks
  FOR ALL
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER trg_background_tracks_updated_at
BEFORE UPDATE ON public.background_tracks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "music_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'music');

CREATE POLICY "music_staff_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'music' AND public.is_staff(auth.uid()));

CREATE POLICY "music_staff_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'music' AND public.is_staff(auth.uid()));

CREATE POLICY "music_staff_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'music' AND public.is_staff(auth.uid()));
