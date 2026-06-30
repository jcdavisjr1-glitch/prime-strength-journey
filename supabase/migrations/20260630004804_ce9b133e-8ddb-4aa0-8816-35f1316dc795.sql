
-- Training blocks
CREATE TABLE public.training_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  block_number integer NOT NULL DEFAULT 1,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  fitness_level text NOT NULL,
  equipment_type text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deload', 'complete')),
  review_score numeric,
  outcome text CHECK (outcome IN ('stay', 'level_up', 'level_down', 'swap_exercises')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_blocks TO authenticated;
GRANT ALL ON public.training_blocks TO service_role;
ALTER TABLE public.training_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own training blocks" ON public.training_blocks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Exercise swaps
CREATE TABLE public.exercise_swaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  block_id uuid REFERENCES public.training_blocks(id) ON DELETE CASCADE NOT NULL,
  original_exercise text NOT NULL,
  replacement_exercise text NOT NULL,
  swap_reason text NOT NULL,
  swapped_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_swaps TO authenticated;
GRANT ALL ON public.exercise_swaps TO service_role;
ALTER TABLE public.exercise_swaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own exercise swaps" ON public.exercise_swaps
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_training_blocks_user_status ON public.training_blocks(user_id, status);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);

-- Helper: get next fitness level
CREATE OR REPLACE FUNCTION public.next_fitness_level(_level text, _direction text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _direction = 'up' AND _level = 'beginner' THEN 'intermediate'
    WHEN _direction = 'up' AND _level = 'intermediate' THEN 'advanced'
    WHEN _direction = 'up' AND _level = 'advanced' THEN 'advanced'
    WHEN _direction = 'down' AND _level = 'advanced' THEN 'intermediate'
    WHEN _direction = 'down' AND _level = 'intermediate' THEN 'beginner'
    WHEN _direction = 'down' AND _level = 'beginner' THEN 'beginner'
    ELSE _level
  END
$$;

-- Three-week review function
CREATE OR REPLACE FUNCTION public.run_three_week_review(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  block_row public.training_blocks;
  prof_row public.profiles;
  sessions_completed int;
  sessions_scheduled int := 6; -- 2 days/week * 3 weeks
  attendance numeric;
  attendance_pts int := 0;
  difficulty_pts int := 0;
  reps_pts int := 0;
  block_score int;
  outcome_val text;
  new_level text;
  msg text;
  ex record;
  too_easy_count int;
  too_hard_count int;
  exceeded_count int;
  met_count int;
  missed_count int;
  total_logs int;
  avg_easy int := 0;
  avg_right int := 0;
  avg_hard int := 0;
  total_diff int := 0;
BEGIN
  SELECT * INTO block_row FROM public.training_blocks
    WHERE user_id = _user_id AND status = 'active'
    ORDER BY start_date DESC LIMIT 1;
  IF block_row IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO prof_row FROM public.profiles WHERE id = _user_id;

  -- Attendance
  SELECT COUNT(DISTINCT date_trunc('day', logged_at)) INTO sessions_completed
    FROM public.workout_logs
    WHERE user_id = _user_id AND logged_at >= block_row.start_date;
  attendance := CASE WHEN sessions_scheduled > 0 THEN sessions_completed::numeric / sessions_scheduled ELSE 0 END;

  IF attendance >= 0.80 THEN attendance_pts := 30;
  ELSIF attendance >= 0.60 THEN attendance_pts := 15;
  ELSE attendance_pts := 0;
  END IF;

  -- Aggregate difficulty + rep performance across last 3 sessions per exercise
  FOR ex IN
    SELECT exercise_name FROM public.workout_logs
      WHERE user_id = _user_id AND logged_at >= block_row.start_date
      GROUP BY exercise_name
  LOOP
    SELECT
      COUNT(*) FILTER (WHERE difficulty = 'too_easy'),
      COUNT(*) FILTER (WHERE difficulty = 'too_hard'),
      COUNT(*) FILTER (WHERE difficulty = 'just_right'),
      COUNT(*) FILTER (WHERE reps_completed IS NOT NULL AND reps IS NOT NULL AND reps_completed >= reps + 2),
      COUNT(*) FILTER (WHERE reps_completed IS NOT NULL AND reps IS NOT NULL AND reps_completed >= reps AND reps_completed < reps + 2),
      COUNT(*) FILTER (WHERE reps_completed IS NOT NULL AND reps IS NOT NULL AND reps_completed < reps),
      COUNT(*)
    INTO too_easy_count, too_hard_count, met_count, exceeded_count, met_count, missed_count, total_logs
    FROM (
      SELECT * FROM public.workout_logs
        WHERE user_id = _user_id AND exercise_name = ex.exercise_name
        ORDER BY logged_at DESC LIMIT 3
    ) sub;
    avg_easy := avg_easy + too_easy_count;
    avg_hard := avg_hard + too_hard_count;
    avg_right := avg_right + met_count;
    total_diff := total_diff + total_logs;
  END LOOP;

  IF total_diff = 0 THEN
    difficulty_pts := 5;
    reps_pts := 5;
  ELSE
    IF avg_easy >= avg_right AND avg_easy >= avg_hard THEN difficulty_pts := 35;
    ELSIF avg_right >= avg_hard THEN difficulty_pts := 20;
    ELSE difficulty_pts := 5;
    END IF;

    -- Reps points using overall aggregates
    SELECT
      COUNT(*) FILTER (WHERE reps_completed IS NOT NULL AND reps IS NOT NULL AND reps_completed >= reps + 2),
      COUNT(*) FILTER (WHERE reps_completed IS NOT NULL AND reps IS NOT NULL AND reps_completed >= reps),
      COUNT(*) FILTER (WHERE reps_completed IS NOT NULL AND reps IS NOT NULL AND reps_completed < reps)
    INTO exceeded_count, met_count, missed_count
    FROM public.workout_logs
      WHERE user_id = _user_id AND logged_at >= block_row.start_date;
    IF exceeded_count > met_count AND exceeded_count > missed_count THEN reps_pts := 35;
    ELSIF met_count >= missed_count THEN reps_pts := 20;
    ELSE reps_pts := 5;
    END IF;
  END IF;

  block_score := attendance_pts + difficulty_pts + reps_pts;

  -- Decide outcome
  IF block_score >= 75 THEN
    outcome_val := 'level_up';
  ELSIF block_score >= 45 THEN
    outcome_val := 'stay';
  ELSE
    IF attendance < 0.60 AND avg_hard >= avg_easy AND prof_row.fitness_level <> 'beginner' THEN
      outcome_val := 'level_down';
    ELSE
      outcome_val := 'stay';
    END IF;
  END IF;

  -- Apply outcome
  IF outcome_val = 'level_up' AND prof_row.fitness_level <> 'advanced' THEN
    new_level := public.next_fitness_level(prof_row.fitness_level, 'up');
    UPDATE public.profiles SET fitness_level = new_level, updated_at = now() WHERE id = _user_id;
    UPDATE public.training_blocks
      SET status = 'complete', end_date = now(), outcome = 'level_up', review_score = block_score
      WHERE id = block_row.id;
    INSERT INTO public.training_blocks (user_id, block_number, fitness_level, equipment_type, status)
      VALUES (_user_id, block_row.block_number + 1, new_level, block_row.equipment_type, 'active');
    msg := 'Three weeks of serious work. You''ve earned a promotion — we''re moving you to ' || new_level || '. Here''s what changes.';
    INSERT INTO public.notifications (user_id, type, message) VALUES (_user_id, 'level_up', msg);

  ELSIF outcome_val = 'level_down' THEN
    new_level := public.next_fitness_level(prof_row.fitness_level, 'down');
    UPDATE public.profiles SET fitness_level = new_level, updated_at = now() WHERE id = _user_id;
    UPDATE public.training_blocks
      SET status = 'complete', end_date = now(), outcome = 'level_down', review_score = block_score
      WHERE id = block_row.id;
    INSERT INTO public.training_blocks (user_id, block_number, fitness_level, equipment_type, status)
      VALUES (_user_id, block_row.block_number + 1, new_level, block_row.equipment_type, 'active');
    msg := 'Life gets busy. We''ve adjusted your plan to set you up for success — consistency always beats intensity.';
    INSERT INTO public.notifications (user_id, type, message) VALUES (_user_id, 'level_down', msg);

  ELSE
    -- stay (swaps are recorded client-side via swap function with the progression ladder)
    UPDATE public.training_blocks
      SET status = 'deload', outcome = 'stay', review_score = block_score
      WHERE id = block_row.id;
    msg := 'You''re making great progress. We''ve upgraded a few exercises to keep challenging you.';
    INSERT INTO public.notifications (user_id, type, message) VALUES (_user_id, 'stay', msg);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.run_three_week_review(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_fitness_level(text, text) FROM PUBLIC, authenticated;

-- Auto-create initial training block for new profiles
CREATE OR REPLACE FUNCTION public.handle_new_profile_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.fitness_level IS NOT NULL AND NEW.equipment_type IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.training_blocks WHERE user_id = NEW.id AND status IN ('active','deload')) THEN
      INSERT INTO public.training_blocks (user_id, block_number, fitness_level, equipment_type, status)
      VALUES (NEW.id, 1, NEW.fitness_level, NEW.equipment_type, 'active');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_create_block ON public.profiles;
CREATE TRIGGER profiles_create_block
AFTER INSERT OR UPDATE OF fitness_level, equipment_type ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_block();

-- Daily cron: review users whose active block started >= 21 days ago
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.daily_review_check()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u record;
BEGIN
  FOR u IN
    SELECT user_id FROM public.training_blocks
      WHERE status = 'active' AND start_date <= now() - interval '21 days'
  LOOP
    PERFORM public.run_three_week_review(u.user_id);
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.daily_review_check() FROM PUBLIC, authenticated;

SELECT cron.schedule(
  'daily-three-week-review',
  '0 6 * * *',
  $$ SELECT public.daily_review_check(); $$
);
