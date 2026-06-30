
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_progression(uuid, text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.workout_logs_after_insert() FROM PUBLIC, authenticated;
