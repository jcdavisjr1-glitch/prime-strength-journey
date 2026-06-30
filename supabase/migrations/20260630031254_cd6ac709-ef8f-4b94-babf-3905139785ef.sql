CREATE TABLE public.exercise_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_name text NOT NULL UNIQUE,
  video_url_front text,
  video_url_side text,
  instructions text,
  muscle_group text,
  equipment text,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.exercise_media TO anon, authenticated;
GRANT ALL ON public.exercise_media TO service_role;

ALTER TABLE public.exercise_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exercise media is publicly readable"
  ON public.exercise_media
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX exercise_media_name_idx ON public.exercise_media (lower(exercise_name));