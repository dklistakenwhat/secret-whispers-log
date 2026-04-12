import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { encode as hexEncode } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const _corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new TextDecoder().decode(hexEncode(new Uint8Array(hashBuffer)));
}

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

    const { display_name, password } = await req.json();

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

    if (!password || typeof password !== "string" || password.length < 4) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 4 characters" }),
        { status: 400, headers: { ..._corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = display_name.trim();
    const isAdmin = name === "D.L.L.Mconfessionable";

    // Check if this IP is banned
    if (!isAdmin) {
      const { data: visitorsWithIp } = await supabase
        .from("visitors")
        .select("id")
        .eq("ip_address", ip);

      if (visitorsWithIp && visitorsWithIp.length > 0) {
        const visitorIds = visitorsWithIp.map((v: any) => v.id);

        const { data: bans } = await supabase
          .from("visitor_bans")
          .select("*")
          .in("visitor_id", visitorIds);

        if (bans && bans.length > 0) {
          const now = new Date();
          const activeBan = bans.find(
            (b: any) => b.is_permanent || !b.expires_at || new Date(b.expires_at) > now
          );

          if (activeBan) {
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
    }

    const pwHash = await hashPassword(password);

    // Check if a visitor with this name already exists (any IP)
    const { data: existingByName } = await supabase
      .from("visitors")
      .select("*")
      .eq("display_name", name)
      .limit(1)
      .maybeSingle();

    if (existingByName) {
      // Verify password
      if (existingByName.password_hash && existingByName.password_hash !== pwHash) {
        return new Response(
          JSON.stringify({ error: "Wrong password for this name." }),
          { status: 401, headers: { ..._corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // If old account has no password, set it now
      if (!existingByName.password_hash) {
        await supabase
          .from("visitors")
          .update({ password_hash: pwHash, ip_address: ip })
          .eq("id", existingByName.id);
      } else {
        // Update IP on successful login
        await supabase
          .from("visitors")
          .update({ ip_address: ip })
          .eq("id", existingByName.id);
      }
      return new Response(JSON.stringify({ visitor: existingByName }), {
        headers: { ..._corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new visitor with password
    const { data: newVisitor, error } = await supabase
      .from("visitors")
      .insert({ display_name: name, ip_address: ip, password_hash: pwHash })
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
