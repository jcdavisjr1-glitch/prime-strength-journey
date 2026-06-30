
REVOKE EXECUTE ON FUNCTION public.calculate_progression(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.workout_logs_after_insert() FROM PUBLIC, anon, authenticated;
