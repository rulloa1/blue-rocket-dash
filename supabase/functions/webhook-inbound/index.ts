import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-token, x-webhook-key",
};

interface InboundLeadPayload {
  business_name: string;
  email?: string;
  phone?: string;
  industry?: string;
  website?: string;
  notes?: string;
  source?: string;
}

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
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
    // Get webhook token from header OR query param (for Make.com/n8n/Zapier compatibility)
    const url = new URL(req.url);
    const webhookToken = 
      req.headers.get("x-webhook-token") || 
      req.headers.get("x-webhook-key") || 
      url.searchParams.get("key") ||
      url.searchParams.get("token");

    if (!webhookToken) {
      return new Response(
        JSON.stringify({ 
          error: "Missing webhook token. Include x-webhook-token header or ?key= query param." 
        }),
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
      console.error("Invalid webhook token:", settingsError);
      return new Response(
        JSON.stringify({ error: "Invalid webhook token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userId = settings.user_id;
    const payload: InboundLeadPayload = await req.json();
    console.log("Received lead payload:", JSON.stringify(payload));

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

    // Create the lead with source field
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        user_id: userId,
        business_name: payload.business_name,
        email: payload.email || null,
        phone: payload.phone || null,
        industry: payload.industry || null,
        website: payload.website || null,
        notes: payload.notes || null,
        source: payload.source || "webhook",
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

    console.log("Lead created via webhook:", lead.id);

    // Log activity
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      user_id: userId,
      action: "created",
      description: `Lead created via ${payload.source || "webhook"}`,
    });

    // TRIGGER ENRICHMENT
    try {
        console.log("Triggering enrichment for inbound webhook lead...");
        const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
        const N8N_TOKEN = Deno.env.get("N8N_BEARER_TOKEN");
        
        if (N8N_WEBHOOK_URL) {
             await fetch(N8N_WEBHOOK_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": N8N_TOKEN ? `Bearer ${N8N_TOKEN}` : ""
                },
                body: JSON.stringify({ 
                    action: "enrich_and_create_marketing",
                    leads: [lead] 
                })
            });
        }
    } catch (err) {
        console.error("Failed to trigger enrichment webhook:", err);
    }

    // Trigger outbound webhooks for "new_lead" event
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", userId)
      .eq("trigger_event", "new_lead")
      .eq("is_active", true);

    if (webhooks && webhooks.length > 0) {
      console.log(`Triggering ${webhooks.length} outbound webhook(s)`);

      const webhookPayload: WebhookPayload = {
        event: "new_lead",
        data: {
          id: lead.id,
          business_name: lead.business_name,
          industry: lead.industry,
          phone: lead.phone,
          email: lead.email,
          website: lead.website,
          source: lead.source,
          status: lead.status,
          created_at: lead.created_at,
        },
        timestamp: new Date().toISOString(),
      };

      // Fire webhooks (fire-and-forget pattern for speed)
      for (const webhook of webhooks) {
        (async () => {
          try {
            const response = await fetch(webhook.url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(webhookPayload),
            });

            await supabase
              .from("webhooks")
              .update({
                last_triggered_at: new Date().toISOString(),
                last_status_code: response.status,
              })
              .eq("id", webhook.id);

            console.log(`Webhook ${webhook.name} triggered: ${response.status}`);
          } catch (err) {
            console.error(`Webhook ${webhook.name} failed:`, err);
            await supabase
              .from("webhooks")
              .update({
                last_triggered_at: new Date().toISOString(),
                last_status_code: 0,
              })
              .eq("id", webhook.id);
          }
        })();
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        lead: {
          id: lead.id,
          business_name: lead.business_name,
          status: lead.status,
          source: lead.source,
          created_at: lead.created_at,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
