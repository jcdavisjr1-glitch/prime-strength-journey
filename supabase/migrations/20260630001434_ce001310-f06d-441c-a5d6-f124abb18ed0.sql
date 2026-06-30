ALTER TABLE public.workout_logs
  ADD COLUMN IF NOT EXISTS reps_completed integer,
  ADD COLUMN IF NOT EXISTS difficulty text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workout_logs_difficulty_check'
  ) THEN
    ALTER TABLE public.workout_logs
      ADD CONSTRAINT workout_logs_difficulty_check
      CHECK (difficulty IS NULL OR difficulty IN ('too_easy', 'just_right', 'too_hard'));
  END IF;
END $$;