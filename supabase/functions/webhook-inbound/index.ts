import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

interface InboundLeadPayload {
  business_name: string;
  email?: string;
  phone?: string;
  industry?: string;
  website?: string;
  notes?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const webhookToken = req.headers.get("x-webhook-token");

    if (!webhookToken) {
      return new Response(
        JSON.stringify({ error: "Missing webhook token. Include x-webhook-token header." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by webhook token
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("inbound_webhook_token", webhookToken)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const payload: InboundLeadPayload = await req.json();

    // Validate required fields
    if (!payload.business_name) {
      return new Response(
        JSON.stringify({ error: "business_name is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create the lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        user_id: settings.user_id,
        business_name: payload.business_name,
        email: payload.email || null,
        phone: payload.phone || null,
        industry: payload.industry || null,
        website: payload.website || null,
        notes: payload.notes || null,
        status: "new",
      })
      .select()
      .single();

    if (leadError) {
      console.error("Error creating lead:", leadError);
      return new Response(
        JSON.stringify({ error: "Failed to create lead", details: leadError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Log activity
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      user_id: settings.user_id,
      action: "created",
      description: "Lead created via webhook",
    });

    console.log("Lead created via webhook:", lead.id);

    return new Response(
      JSON.stringify({
        success: true,
        lead: {
          id: lead.id,
          business_name: lead.business_name,
          status: lead.status,
          created_at: lead.created_at,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
