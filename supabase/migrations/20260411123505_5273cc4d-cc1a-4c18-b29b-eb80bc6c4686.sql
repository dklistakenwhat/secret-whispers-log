
-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one display_name per IP
ALTER TABLE public.visitors ADD CONSTRAINT visitors_name_ip_unique UNIQUE (display_name, ip_address);

-- Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert visitors
CREATE POLICY "Anyone can insert visitors"
ON public.visitors FOR INSERT
TO public
WITH CHECK (true);

-- Anyone can read visitors (needed for login lookup)
CREATE POLICY "Anyone can read visitors"
ON public.visitors FOR SELECT
TO public
USING (true);

-- Add visitor_id to confessions (nullable for existing rows)
ALTER TABLE public.confessions
ADD COLUMN visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL;

-- Update confessions RLS: keep existing open policies, no change needed
