
CREATE TABLE public.confession_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (confession_id, visitor_id)
);

ALTER TABLE public.confession_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes" ON public.confession_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert likes" ON public.confession_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete likes" ON public.confession_likes FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.toggle_like(p_confession_id UUID, p_visitor_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_liked boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM confession_likes WHERE confession_id = p_confession_id AND visitor_id = p_visitor_id
  ) INTO already_liked;

  IF already_liked THEN
    DELETE FROM confession_likes WHERE confession_id = p_confession_id AND visitor_id = p_visitor_id;
    UPDATE confessions SET likes = GREATEST(likes - 1, 0) WHERE id = p_confession_id;
    RETURN false;
  ELSE
    INSERT INTO confession_likes (confession_id, visitor_id) VALUES (p_confession_id, p_visitor_id);
    UPDATE confessions SET likes = likes + 1 WHERE id = p_confession_id;
    RETURN true;
  END IF;
END;
$$;
