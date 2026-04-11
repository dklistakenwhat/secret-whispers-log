
CREATE TABLE public.confessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_number SERIAL NOT NULL UNIQUE,
  text TEXT NOT NULL CHECK (char_length(text) <= 500),
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read confessions"
  ON public.confessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert confessions"
  ON public.confessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update likes"
  ON public.confessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_confessions_created_at ON public.confessions (created_at DESC);
