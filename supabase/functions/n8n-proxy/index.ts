import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URLS = {
  'call-lead': Deno.env.get('N8N_WEBHOOK_CALL_LEAD'),
  'message-lead': Deno.env.get('N8N_WEBHOOK_MESSAGE_LEAD'),
  'activate-site': Deno.env.get('N8N_WEBHOOK_ACTIVATE_SITE'),
  'run-batch': 'http://localhost:5680/webhook/run-batch',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();

    console.log(`Proxying request to n8n: action=${action}`, data);

    const webhookUrl = WEBHOOK_URLS[action as keyof typeof WEBHOOK_URLS];

    if (!webhookUrl) {
      console.error(`Invalid action or missing webhook URL for: ${action}`);
      return new Response(
        JSON.stringify({ error: 'Invalid or unconfigured action', validActions: Object.keys(WEBHOOK_URLS) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const N8N_TOKEN = Deno.env.get('N8N_TOKEN');

    console.log(`Calling n8n webhook: ${webhookUrl}`);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (N8N_TOKEN) {
      headers['Authorization'] = `Bearer ${N8N_TOKEN}`; // or 'X-N8N-API-KEY' depending on setup, usually Bearer for JWT
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    console.log(`n8n response status: ${response.status}, body: ${responseText}`);

    // Try to parse as JSON, otherwise return as text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText || 'Request processed' };
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error proxying to Make.com:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
