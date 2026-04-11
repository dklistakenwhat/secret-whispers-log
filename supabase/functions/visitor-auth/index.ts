import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const _corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: _corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const { display_name } = await req.json();

    if (
      !display_name ||
      typeof display_name !== "string" ||
      display_name.trim().length < 1 ||
      display_name.trim().length > 40
    ) {
      return new Response(
        JSON.stringify({ error: "Name must be 1-40 characters" }),
        { status: 400, headers: { ..._corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = display_name.trim();

    // Try to find existing visitor with this name + IP
    const { data: existing } = await supabase
      .from("visitors")
      .select("*")
      .eq("display_name", name)
      .eq("ip_address", ip)
      .maybeSingle();

    const visitorId = existing?.id;

    // Check if this visitor is banned (if they exist)
    if (visitorId) {
      const { data: bans } = await supabase
        .from("visitor_bans")
        .select("*")
        .eq("visitor_id", visitorId);

      if (bans && bans.length > 0) {
        const now = new Date();
        const activeBan = bans.find(
          (b: any) => b.is_permanent || !b.expires_at || new Date(b.expires_at) > now
        );

        if (activeBan) {
          // Admin bypass: allow admin name even if banned
          if (name !== "D.L.L.Mconfessionable") {
            return new Response(
              JSON.stringify({
                error: "You are banned",
                reason: activeBan.reason,
                expires_at: activeBan.expires_at,
                is_permanent: activeBan.is_permanent,
              }),
              { status: 403, headers: { ..._corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }

      return new Response(JSON.stringify({ visitor: existing }), {
        headers: { ..._corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new visitor
    const { data: newVisitor, error } = await supabase
      .from("visitors")
      .insert({ display_name: name, ip_address: ip })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ..._corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ visitor: newVisitor }), {
      headers: { ..._corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ..._corsHeaders, "Content-Type": "application/json" },
    });
  }
});
