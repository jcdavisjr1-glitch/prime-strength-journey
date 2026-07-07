
CREATE POLICY "Public read exercise videos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'exercise-videos');
