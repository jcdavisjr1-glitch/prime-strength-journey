
-- Progression recommendations table
CREATE TABLE public.progression_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name text NOT NULL,
  recommended_weight numeric,
  recommendation_reason text NOT NULL,
  based_on_session_date timestamptz NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  applied boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, exercise_name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progression_recommendations TO authenticated;
GRANT ALL ON public.progression_recommendations TO service_role;

ALTER TABLE public.progression_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own recommendations"
  ON public.progression_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Categorize exercise by name keywords
CREATE OR REPLACE FUNCTION public.exercise_category(_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN lower(_name) ~ '(plank|dead bug|farmer carry|ab wheel|bird dog)' THEN 'core'
    WHEN lower(_name) ~ '(squat|deadlift|leg press|lunge|split squat|leg curl|leg extension|calf raise|glute bridge|hip hinge|\mrdl\M)' THEN 'lower'
    WHEN lower(_name) ~ '(bench press|shoulder press|curl|row|pulldown|pushdown|lateral raise|chest press|overhead press|\mdip\M)' THEN 'upper'
    ELSE 'upper'
  END
$$;

-- Calculate progression and upsert recommendation
CREATE OR REPLACE FUNCTION public.calculate_progression(_user_id uuid, _exercise_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last1 record;
  last2 record;
  category text;
  target_reps int;
  new_weight numeric;
  reason text;
  base_weight numeric;
BEGIN
  SELECT * INTO last1 FROM public.workout_logs
    WHERE user_id = _user_id AND exercise_name = _exercise_name
    ORDER BY logged_at DESC LIMIT 1;

  IF last1 IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO last2 FROM public.workout_logs
    WHERE user_id = _user_id AND exercise_name = _exercise_name
    ORDER BY logged_at DESC OFFSET 1 LIMIT 1;

  category := public.exercise_category(_exercise_name);
  target_reps := COALESCE(last1.reps, 0);
  base_weight := COALESCE(last1.weight, 0);
  new_weight := base_weight;

  IF last1.difficulty = 'too_easy' AND last1.reps_completed IS NOT NULL AND target_reps > 0 AND last1.reps_completed >= target_reps THEN
    IF category = 'lower' THEN
      new_weight := base_weight + 10;
    ELSIF category = 'core' THEN
      new_weight := base_weight + 2.5;
    ELSE
      new_weight := base_weight + 5;
    END IF;
    reason := 'You crushed last session — time to go heavier.';

  ELSIF last1.difficulty = 'too_easy' THEN
    new_weight := base_weight;
    reason := 'Hit your target reps first, then we''ll go heavier.';

  ELSIF last1.difficulty = 'too_hard'
        OR (target_reps > 0 AND last1.reps_completed IS NOT NULL AND last1.reps_completed < (target_reps - 2)) THEN
    IF category = 'lower' THEN
      new_weight := GREATEST(base_weight - 10, 5);
    ELSE
      new_weight := GREATEST(base_weight - 5, 5);
    END IF;
    reason := 'Let''s dial it back and nail the form first.';

  ELSIF last1.difficulty = 'just_right' THEN
    IF last2.difficulty IS NOT NULL
       AND target_reps > 0
       AND last1.reps_completed IS NOT NULL AND last1.reps_completed >= target_reps
       AND last2.reps_completed IS NOT NULL AND COALESCE(last2.reps, 0) > 0 AND last2.reps_completed >= last2.reps
    THEN
      IF category = 'lower' THEN
        new_weight := base_weight + 5;
      ELSE
        new_weight := base_weight + 2.5;
      END IF;
      reason := 'Consistent progress — small step up.';
    ELSE
      new_weight := base_weight;
      reason := 'Right in the zone — keep building.';
    END IF;
  ELSE
    new_weight := base_weight;
    reason := 'Keep building on last session.';
  END IF;

  INSERT INTO public.progression_recommendations
    (user_id, exercise_name, recommended_weight, recommendation_reason, based_on_session_date, generated_at, applied)
  VALUES
    (_user_id, _exercise_name, new_weight, reason, last1.logged_at, now(), false)
  ON CONFLICT (user_id, exercise_name) DO UPDATE
    SET recommended_weight = EXCLUDED.recommended_weight,
        recommendation_reason = EXCLUDED.recommendation_reason,
        based_on_session_date = EXCLUDED.based_on_session_date,
        generated_at = now(),
        applied = false;
END;
$$;

-- Trigger
CREATE OR REPLACE FUNCTION public.workout_logs_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.calculate_progression(NEW.user_id, NEW.exercise_name);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_workout_logs_progression
AFTER INSERT ON public.workout_logs
FOR EACH ROW
EXECUTE FUNCTION public.workout_logs_after_insert();
