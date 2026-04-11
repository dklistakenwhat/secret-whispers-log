import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://deno.land/x/cors@v1.2.2/mod.ts";

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
      display_name.trim().length > 20
    ) {
      return new Response(
        JSON.stringify({ error: "Name must be 1-20 characters" }),
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

    if (existing) {
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
