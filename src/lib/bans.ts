import { supabase } from "@/integrations/supabase/client";

export interface VisitorBan {
  id: string;
  visitor_id: string;
  reason: string;
  banned_by: string | null;
  banned_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  created_at: string;
}

export interface ConfessionWithVisitor {
  id: string;
  confession_number: number;
  text: string;
  likes: number;
  created_at: string;
  visitor_id: string | null;
  hidden: boolean;
  visitor_name?: string;
  visitor_ip?: string;
}

/** Get all confessions with visitor info (admin only) */
export async function getConfessionsWithVisitors(): Promise<ConfessionWithVisitor[]> {
  const { data: confessions, error } = await supabase
    .from("confessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Get unique visitor IDs
  const visitorIds = [...new Set((confessions ?? []).map((c: any) => c.visitor_id).filter(Boolean))];

  // We can't SELECT from visitors table (RLS blocks it), so we'll use the edge function
  // Instead, fetch via a new edge function or show visitor_id initials
  return (confessions ?? []).map((c: any) => ({
    ...c,
    visitor_name: c.visitor_id ? c.visitor_id.substring(0, 8) : "anonymous",
  }));
}

/** Get all active bans */
export async function getActiveBans(): Promise<(VisitorBan & { visitor_name?: string })[]> {
  const { data, error } = await supabase
    .from("visitor_bans")
    .select("*")
    .order("banned_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

/** Ban a visitor */
export async function banVisitor(
  visitorId: string,
  reason: string,
  bannedBy: string,
  durationMinutes?: number,
  isPermanent = false
): Promise<void> {
  const expiresAt = isPermanent || !durationMinutes
    ? null
    : new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("visitor_bans")
    .insert({
      visitor_id: visitorId,
      reason,
      banned_by: bannedBy,
      expires_at: expiresAt,
      is_permanent: isPermanent,
    });

  if (error) throw error;
}

/** Unban a visitor (delete ban record) */
export async function unbanVisitor(banId: string): Promise<void> {
  const { error } = await supabase
    .from("visitor_bans")
    .delete()
    .eq("id", banId);
  if (error) throw error;
}

/** Check if a visitor is currently banned */
export async function isVisitorBanned(visitorId: string): Promise<{ banned: boolean; reason?: string; expires_at?: string }> {
  const { data, error } = await supabase
    .from("visitor_bans")
    .select("*")
    .eq("visitor_id", visitorId);

  if (error || !data || data.length === 0) return { banned: false };

  // Check for active bans
  const now = new Date();
  const activeBan = data.find((b: any) =>
    b.is_permanent || !b.expires_at || new Date(b.expires_at) > now
  );

  if (activeBan) {
    return { banned: true, reason: activeBan.reason, expires_at: activeBan.expires_at };
  }

  return { banned: false };
}
