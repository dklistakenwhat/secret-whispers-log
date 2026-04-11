
-- Create visitor_bans table
CREATE TABLE public.visitor_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  banned_by UUID,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_bans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read bans" ON public.visitor_bans FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bans" ON public.visitor_bans FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bans" ON public.visitor_bans FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete bans" ON public.visitor_bans FOR DELETE USING (true);
