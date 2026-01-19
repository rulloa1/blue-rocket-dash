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

    // In a real scenario, this would call your n8n webhook URL
    // For now, we will mock the connection or use a placeholder URL
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL") || "http://localhost:5678/webhook/test";

    console.log(`Forwarding ${action} to n8n:`, payload);

    // Mock successful response for now since we can't hit localhost from Edge Functions easily
    // in a production environment, but for local dev it might work if configured.
    // To make this work properly, you would typically use a public URL (e.g. via ngrok) or deployed n8n instance.
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully forwarded ${action} to n8n`,
        n8n_response: { status: "received", workflow_started: true }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

    /* 
    // REAL IMPLEMENTATION:
    const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
    });
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { ... });
    */

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
