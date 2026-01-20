import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OutreachService } from '../_shared/outreach.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Outreach Service
    // Note: We create a service client to access user_settings if RLS blocks us, 
    // but here we want to use the user's context. 
    // However, OutreachService uses `limit(1)` on user_settings. 
    // If we are authenticated, we should be able to read our own settings.
    const outreachService = new OutreachService(supabaseClient)
    await outreachService.initialize()

    // Create a mock lead for the test
    const mockLead: any = {
      agent_name: "Test User",
      email: email,
      website_url: "https://example.com",
      outreach_stage: 1
    }

    // Send the email
    const messageId = await outreachService.sendEmail(mockLead, 'initial')

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
