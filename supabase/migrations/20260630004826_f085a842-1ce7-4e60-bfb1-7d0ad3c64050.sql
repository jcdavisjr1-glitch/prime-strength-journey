
REVOKE EXECUTE ON FUNCTION public.handle_new_profile_block() FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.run_three_week_review(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.daily_review_check() FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_fitness_level(text, text) FROM PUBLIC, authenticated;
