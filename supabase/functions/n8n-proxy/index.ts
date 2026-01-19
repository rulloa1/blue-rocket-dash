import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    // Use the configured URL and Token
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
    const N8N_TOKEN = Deno.env.get("N8N_BEARER_TOKEN");

    if (!N8N_WEBHOOK_URL) {
        throw new Error("N8N_WEBHOOK_URL is not set");
    }

    console.log(`Forwarding ${action} to n8n at ${N8N_WEBHOOK_URL}`);

    const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": N8N_TOKEN ? `Bearer ${N8N_TOKEN}` : ""
        },
        body: JSON.stringify({ action, ...payload })
    });
    
    // Check if the request was successful
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully forwarded to n8n`,
        n8n_response: data
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
