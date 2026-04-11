import { supabase } from "@/integrations/supabase/client";

export interface Confession {
  id: string;
  confession_number: number;
  text: string;
  likes: number;
  created_at: string;
  visitor_id?: string | null;
  hidden?: boolean;
}

/** Public feed: only non-hidden confessions */
export async function getConfessions(): Promise<Confession[]> {
  const { data, error } = await supabase
    .from("confessions")
    .select("*")
    .eq("hidden", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Confession[]) ?? [];
}

/** Dashboard: all confessions by a specific visitor (including hidden) */
export async function getMyConfessions(visitorId: string): Promise<Confession[]> {
  const { data, error } = await supabase
    .from("confessions")
    .select("*")
    .eq("visitor_id", visitorId)
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

export async function editConfession(id: string, text: string): Promise<void> {
  const { error } = await supabase
    .from("confessions")
    .update({ text })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteConfession(id: string): Promise<void> {
  const { error } = await supabase
    .from("confessions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function toggleHideConfession(id: string, hidden: boolean): Promise<void> {
  const { error } = await supabase
    .from("confessions")
    .update({ hidden })
    .eq("id", id);
  if (error) throw error;
}

export async function likeConfession(id: string): Promise<void> {
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
