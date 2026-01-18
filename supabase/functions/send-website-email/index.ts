import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM8wOeqfec58K5fbS7kc00';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadEmail, leadName, businessName, websitePreviewUrl, senderName, senderEmail, senderCompany } = await req.json();

    if (!leadEmail || !businessName || !websitePreviewUrl) {
      throw new Error("Missing required fields: leadEmail, businessName, websitePreviewUrl");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured. Please add it in your settings.");
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication token");
    }

    const recipientName = leadName || businessName;
    const fromName = senderName || senderCompany || 'RoysCompany';
    // Use Resend's test sender for unverified domains
    // To use your own domain, verify it at https://resend.com/domains
    const fromEmail = 'onboarding@resend.dev';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Custom Website Preview</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 Your Website is Ready!
              </h1>
              <p style="margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                We've created a custom website preview for ${businessName}
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${recipientName},
              </p>
              
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! We've put together a <strong>personalized website preview</strong> just for ${businessName}. Take a look and see how your online presence could transform.
              </p>
              
              <!-- Preview Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 10px 0 30px;">
                    <a href="${websitePreviewUrl}" target="_blank" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                      color: #ffffff;
                      text-decoration: none;
                      padding: 16px 40px;
                      border-radius: 8px;
                      font-size: 16px;
                      font-weight: 600;
                      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
                    ">
                      👀 View Your Website Preview
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Features Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8FAFC; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 15px; color: #1E293B; font-size: 15px; font-weight: 600;">
                      ✨ What's included:
                    </p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                      <li>Professional, mobile-responsive design</li>
                      <li>Customized content for your industry</li>
                      <li>Easy payment integration ready to go</li>
                      <li>SEO-optimized structure</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-radius: 8px; border: 1px solid #86EFAC;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 15px; color: #166534; font-size: 16px; font-weight: 600;">
                      Ready to make it yours?
                    </p>
                    <a href="${STRIPE_PAYMENT_LINK}" target="_blank" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
                      color: #ffffff;
                      text-decoration: none;
                      padding: 14px 32px;
                      border-radius: 8px;
                      font-size: 15px;
                      font-weight: 600;
                      box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);
                    ">
                      💳 Get Your Full Website Now
                    </a>
                    <p style="margin: 12px 0 0; color: #166534; font-size: 13px; opacity: 0.8;">
                      Secure checkout powered by Stripe
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 25px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                Have questions? Just reply to this email — we're here to help!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 25px 40px; border-top: 1px solid #E5E7EB;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: 600;">
                      ${fromName}
                    </p>
                    <p style="margin: 0; color: #6B7280; font-size: 13px;">
                      Powered by <a href="https://RoysCompany.com" style="color: #3B82F6; text-decoration: none;">RoysCompany.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    console.log('Sending email to:', leadEmail);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [leadEmail],
        subject: `🎨 ${businessName} - Your Custom Website Preview is Ready!`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    // Log the activity
    if (req.headers.get('x-lead-id')) {
      await supabase.from('lead_activities').insert({
        lead_id: req.headers.get('x-lead-id'),
        user_id: user.id,
        action: 'email_sent',
        description: `Website preview email sent to ${leadEmail}`,
      });
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
