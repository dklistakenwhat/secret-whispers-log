import { supabase } from "@/integrations/supabase/client";

export interface Report {
  id: string;
  confession_id: string;
  visitor_id: string;
  reason: string;
  created_at: string;
  resolved: boolean;
}

export async function submitReport(confessionId: string, visitorId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .insert({ confession_id: confessionId, visitor_id: visitorId, reason });
  if (error) throw error;
}

export async function getReports(): Promise<(Report & { confession_text?: string; confession_number?: number })[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("resolved", false)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Fetch confession details for each report
  const confessionIds = [...new Set((data ?? []).map((r: any) => r.confession_id))];
  const { data: confessions } = await supabase
    .from("confessions")
    .select("id, text, confession_number")
    .in("id", confessionIds);

  const confMap = new Map((confessions ?? []).map((c: any) => [c.id, c]));

  return (data ?? []).map((r: any) => ({
    ...r,
    confession_text: confMap.get(r.confession_id)?.text,
    confession_number: confMap.get(r.confession_id)?.confession_number,
  }));
}

export async function resolveReport(id: string): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .update({ resolved: true })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteConfessionByReport(confessionId: string, reportId: string): Promise<void> {
  await supabase.from("confessions").delete().eq("id", confessionId);
  await supabase.from("reports").update({ resolved: true }).eq("id", reportId);
}
