import { supabase } from "@/integrations/supabase/client";

export interface Confession {
  id: string;
  confession_number: number;
  text: string;
  likes: number;
  created_at: string;
  visitor_id?: string | null;
}

export async function getConfessions(): Promise<Confession[]> {
  const { data, error } = await supabase
    .from("confessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Confession[]) ?? [];
}

export async function addConfession(text: string, visitorId?: string): Promise<Confession> {
  const { data, error } = await supabase
    .from("confessions")
    .insert({ text, visitor_id: visitorId ?? null })
    .select()
    .single();

  if (error) throw error;
  return data as Confession;
}

export async function likeConfession(id: string): Promise<void> {
  // Fetch current likes then increment
  const { data: current, error: fetchErr } = await supabase
    .from("confessions")
    .select("likes")
    .eq("id", id)
    .single();

  if (fetchErr) throw fetchErr;

  const { error } = await supabase
    .from("confessions")
    .update({ likes: (current?.likes ?? 0) + 1 })
    .eq("id", id);

  if (error) throw error;
}
