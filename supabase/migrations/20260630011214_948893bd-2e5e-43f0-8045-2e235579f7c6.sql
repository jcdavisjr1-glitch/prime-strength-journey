
CREATE TABLE public.walking_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.walking_logs TO authenticated;
GRANT ALL ON public.walking_logs TO service_role;

ALTER TABLE public.walking_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own walks" ON public.walking_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own walks" ON public.walking_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own walks" ON public.walking_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own walks" ON public.walking_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX walking_logs_user_date_idx ON public.walking_logs (user_id, logged_date DESC);

ALTER TABLE public.profiles
  ADD COLUMN weekly_walking_goal_minutes integer NOT NULL DEFAULT 60;
