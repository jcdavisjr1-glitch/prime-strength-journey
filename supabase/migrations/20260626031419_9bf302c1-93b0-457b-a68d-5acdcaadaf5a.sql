
CREATE TABLE public.workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name text NOT NULL,
  weight numeric,
  sets integer,
  reps integer,
  logged_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.workout_logs TO authenticated;
GRANT ALL ON public.workout_logs TO service_role;

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own workout logs" ON public.workout_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own workout logs" ON public.workout_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX workout_logs_user_exercise_idx ON public.workout_logs (user_id, exercise_name, logged_at DESC);
