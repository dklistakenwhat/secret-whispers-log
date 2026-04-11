
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Anyone can update reports" ON public.reports FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete reports" ON public.reports FOR DELETE USING (true);
