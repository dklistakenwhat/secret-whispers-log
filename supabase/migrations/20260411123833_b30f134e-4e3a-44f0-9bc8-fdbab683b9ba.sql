
CREATE POLICY "Anyone can delete confessions"
ON public.confessions FOR DELETE
TO public
USING (true);
