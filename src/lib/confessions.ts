import { supabase } from "@/integrations/supabase/client";

export type MoodTag = "😭" | "😂" | "😤" | "🌙" | "💀";

export interface Confession {
  id: string;
  confession_number: number;
  text: string;
  likes: number;
  created_at: string;
  visitor_id?: string | null;
  hidden?: boolean;
  mood_tag?: MoodTag | null;
}

export interface Comment {
  id: string;
  confession_id: string;
  visitor_id: string;
  text: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  confession_id: string;
  visitor_id: string;
  emoji: string;
  created_at: string;
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

export async function addConfession(text: string, visitorId?: string, moodTag?: MoodTag): Promise<Confession> {
  const { data, error } = await supabase
    .from("confessions")
    .insert({ text, visitor_id: visitorId ?? null, mood_tag: moodTag ?? null })
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

export async function toggleLikeConfession(confessionId: string, visitorId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("toggle_like", {
    p_confession_id: confessionId,
    p_visitor_id: visitorId,
  });
  if (error) throw error;
  return data as boolean;
}

export async function getMyLikes(visitorId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("confession_likes")
    .select("confession_id")
    .eq("visitor_id", visitorId);
  if (error) throw error;
  return new Set((data ?? []).map((r: any) => r.confession_id));
}

// Comments
export async function getComments(confessionId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("confession_id", confessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Comment[];
}

export async function addComment(confessionId: string, visitorId: string, text: string): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ confession_id: confessionId, visitor_id: visitorId, text })
    .select()
    .single();
  if (error) throw error;
  return data as Comment;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

// Reactions
export async function getReactions(confessionId: string): Promise<Reaction[]> {
  const { data, error } = await supabase
    .from("confession_reactions")
    .select("*")
    .eq("confession_id", confessionId);
  if (error) throw error;
  return (data ?? []) as Reaction[];
}

export async function toggleReaction(confessionId: string, visitorId: string, emoji: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("confession_reactions")
    .select("id")
    .eq("confession_id", confessionId)
    .eq("visitor_id", visitorId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("confession_reactions").delete().eq("id", existing.id);
    return false;
  } else {
    await supabase.from("confession_reactions").insert({ confession_id: confessionId, visitor_id: visitorId, emoji });
    return true;
  }
}

export async function getAllReactions(confessionIds: string[]): Promise<Map<string, Reaction[]>> {
  if (confessionIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("confession_reactions")
    .select("*")
    .in("confession_id", confessionIds);
  if (error) throw error;
  const map = new Map<string, Reaction[]>();
  (data ?? []).forEach((r: any) => {
    const arr = map.get(r.confession_id) || [];
    arr.push(r as Reaction);
    map.set(r.confession_id, arr);
  });
  return map;
}

export async function getAllCommentCounts(confessionIds: string[]): Promise<Map<string, number>> {
  if (confessionIds.length === 0) return new Map();
  const map = new Map<string, number>();
  // Batch count by fetching all comments for these confessions
  const { data, error } = await supabase
    .from("comments")
    .select("confession_id")
    .in("confession_id", confessionIds);
  if (error) throw error;
  (data ?? []).forEach((r: any) => {
    map.set(r.confession_id, (map.get(r.confession_id) || 0) + 1);
  });
  return map;
}
