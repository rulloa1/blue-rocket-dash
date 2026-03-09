import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { decrypt } from '../_shared/crypto.ts'

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

    const { recipientEmail } = await req.json()
    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'Recipient email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch SMTP settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('smtp_host, smtp_port, smtp_username, smtp_password, smtp_from_email, email_signature')
      .limit(1)
      .maybeSingle()

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: 'Could not load email settings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password) {
      return new Response(
        JSON.stringify({ error: 'SMTP settings are incomplete. Please configure host, username, and password first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decrypt the stored password
    const smtpPassword = await decrypt(settings.smtp_password)
    const fromEmail = settings.smtp_from_email || settings.smtp_username
    const signature = settings.email_signature
      ? settings.email_signature.replace(/\n/g, '<br>')
      : 'Best,<br>RoysCompany'

    // Connect and send via SMTP
    const client = new SMTPClient({
      connection: {
        hostname: settings.smtp_host,
        port: settings.smtp_port || 587,
        tls: true,
        auth: {
          username: settings.smtp_username,
          password: smtpPassword,
        },
      },
    })

    await client.send({
      from: fromEmail,
      to: recipientEmail,
      subject: '✅ RoysCompany — Test Email Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; border-left: 4px solid #22c55e;">
            <h2 style="margin: 0 0 12px 0; color: #111;">🎉 Your SMTP is working!</h2>
            <p style="color: #555; margin: 0 0 8px 0;">This test email was sent successfully using your configured SMTP settings:</p>
            <ul style="color: #555; margin: 8px 0;">
              <li><strong>Host:</strong> ${settings.smtp_host}</li>
              <li><strong>Port:</strong> ${settings.smtp_port || 587}</li>
              <li><strong>From:</strong> ${fromEmail}</li>
            </ul>
            <p style="color: #555; margin: 12px 0 0 0;">Your email outreach is ready to go.</p>
          </div>
          <br>
          <p>${signature}</p>
        </div>
      `,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Send test email error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send test email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
