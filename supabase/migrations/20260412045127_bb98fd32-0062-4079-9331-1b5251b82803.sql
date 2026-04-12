
CREATE TABLE public.guideline_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guideline_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agreements" ON public.guideline_agreements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert agreements" ON public.guideline_agreements FOR INSERT WITH CHECK (true);
