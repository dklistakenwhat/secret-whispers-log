-- Add mood_tag to confessions
ALTER TABLE public.confessions ADD COLUMN mood_tag text;

-- Create comments table
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete comments" ON public.comments FOR DELETE USING (true);

-- Create confession_reactions table
CREATE TABLE public.confession_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(confession_id, visitor_id, emoji)
);

ALTER TABLE public.confession_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reactions" ON public.confession_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reactions" ON public.confession_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete reactions" ON public.confession_reactions FOR DELETE USING (true);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;