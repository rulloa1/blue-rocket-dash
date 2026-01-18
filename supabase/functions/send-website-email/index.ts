import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM8wOeqfec58K5fbS7kc00';
const ACTIVATE_BASE_URL = 'https://royscompany.lovable.app/activate';

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadEmail, leadName, businessName, websitePreviewUrl, senderName, senderEmail, senderCompany } = await req.json();

    if (!leadEmail || !businessName || !websitePreviewUrl) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields: leadEmail, businessName, websitePreviewUrl" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured. Please add it in your settings.");
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Authorization header is required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid authentication token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const recipientName = leadName || businessName;
    const fromName = senderName || senderCompany || 'RoysCompany';
    // Verified domain - can send to any recipient
    const fromEmail = 'noreply@royscompany.com';
    
    // Create activate URL with business name for post-payment redirect
    const activateUrl = `${ACTIVATE_BASE_URL}?business=${encodeURIComponent(businessName)}`;

    // Logo URL hosted on the published domain
    const logoUrl = 'https://royscompany.lovable.app/images/royscompany-logo.jpeg';

    const emailHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Custom Website Preview</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0f172a; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .mobile-padding { padding: 20px 15px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-btn { padding: 14px 30px !important; font-size: 16px !important; width: 100% !important; box-sizing: border-box !important; }
      .desktop-hidden { display: block !important; max-height: none !important; }
      .mobile-hidden { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0f172a;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(to right, #b45309, #d97706, #fbbf24); height: 6px;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;" class="mobile-padding">
              
              <!-- Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                     <img src="${logoUrl}" alt="RoysCompany" width="280" style="display: block; width: 280px; max-width: 100%; height: auto; border-radius: 8px;" />
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <h1 style="margin: 0 0 16px; color: #f8fafc; font-size: 28px; font-weight: 700; text-align: center; letter-spacing: -0.5px;">
                Your Website is Ready
              </h1>
              <p style="margin: 0 0 32px; color: #94a3b8; font-size: 16px; line-height: 1.6; text-align: center;">
                Hi ${recipientName}, we've designed a stunning, high-performance website specifically for <strong>${businessName}</strong>.
              </p>

              <!-- Thumbnail Preview (Browser Mockup) -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <tr>
                  <td style="background-color: #334155; border-radius: 12px 12px 0 0; padding: 12px 16px; border-bottom: 1px solid #475569;">
                    <!-- Browser Chrome -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="60">
                          <span style="display: inline-block; width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%; margin-right: 6px;"></span>
                          <span style="display: inline-block; width: 10px; height: 10px; background-color: #f59e0b; border-radius: 50%; margin-right: 6px;"></span>
                          <span style="display: inline-block; width: 10px; height: 10px; background-color: #22c55e; border-radius: 50%;"></span>
                        </td>
                        <td align="center">
                          <div style="background-color: #1e293b; border-radius: 6px; padding: 6px 16px; color: #94a3b8; font-size: 11px; font-family: monospace;">
                            ${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
                          </div>
                        </td>
                        <td width="60" align="right">
                          <!-- Spacer -->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #0f172a; padding: 0; border-radius: 0 0 12px 12px; overflow: hidden; border: 1px solid #334155; border-top: none;">
                    <!-- Website Content Simulation -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <!-- Navbar Placeholder -->
                      <tr>
                        <td style="padding: 20px 24px; border-bottom: 1px solid #1e293b;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td align="left">
                                <span style="color: #f8fafc; font-weight: 700; font-size: 14px;">${businessName}</span>
                              </td>
                              <td align="right">
                                <span style="display: inline-block; width: 40px; height: 6px; background-color: #334155; border-radius: 3px; margin-left: 8px;"></span>
                                <span style="display: inline-block; width: 40px; height: 6px; background-color: #334155; border-radius: 3px; margin-left: 8px;"></span>
                                <span style="display: inline-block; width: 40px; height: 6px; background-color: #334155; border-radius: 3px; margin-left: 8px;"></span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Hero Section Placeholder -->
                      <tr>
                        <td style="padding: 60px 24px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: center;">
                          <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                            Professional Services for<br/>Your Needs
                          </h2>
                          <p style="margin: 0 auto 24px; color: #94a3b8; font-size: 13px; max-width: 300px; line-height: 1.5;">
                            Experience the best in class solutions tailored specifically for your unique requirements.
                          </p>
                          <!-- Button Simulation -->
                          <div style="display: inline-block; padding: 10px 24px; background: linear-gradient(to right, #d97706, #b45309); border-radius: 6px; color: white; font-size: 12px; font-weight: 600;">
                            Get Started
                          </div>
                        </td>
                      </tr>
                      <!-- Features Grid Placeholder -->
                      <tr>
                        <td style="padding: 24px; background-color: #0f172a;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="33%" style="padding-right: 8px;">
                                <div style="background-color: #1e293b; height: 80px; border-radius: 6px;"></div>
                              </td>
                              <td width="33%" style="padding: 0 4px;">
                                <div style="background-color: #1e293b; height: 80px; border-radius: 6px;"></div>
                              </td>
                              <td width="33%" style="padding-left: 8px;">
                                <div style="background-color: #1e293b; height: 80px; border-radius: 6px;"></div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${websitePreviewUrl}" target="_blank" style="display: inline-block; background: linear-gradient(to right, #d97706, #b45309); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.3);">
                      View Live Interactive Preview
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <p style="margin: 0; color: #64748b; font-size: 13px;">
                      Or <a href="${STRIPE_PAYMENT_LINK}" style="color: #d97706; text-decoration: none; font-weight: 500;">activate your site now</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Features List -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 48px; border-top: 1px solid #334155; padding-top: 32px;">
                <tr>
                  <td valign="top" width="50%" class="mobile-stack" style="padding-right: 10px; padding-bottom: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="color: #f8fafc; font-weight: 600; font-size: 14px;">Mobile Responsive</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                          Looks perfect on all devices, from phones to desktops.
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" width="50%" class="mobile-stack" style="padding-left: 10px; padding-bottom: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="color: #f8fafc; font-weight: 600; font-size: 14px;">SEO Optimized</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                          Built to help customers find you on Google easily.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                © ${new Date().getFullYear()} ${fromName}. All rights reserved.
              </p>
              <p style="margin: 0; color: #475569; font-size: 12px;">
                <a href="#" style="color: #64748b; text-decoration: none;">Unsubscribe</a> • <a href="#" style="color: #64748b; text-decoration: none;">Privacy Policy</a>
              </p>
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

    const resendResponse = await fetch('https://api.resend.com/emails', {
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

    const resendText = await resendResponse.text();
    let resendJson: any = null;
    try { resendJson = JSON.parse(resendText); } catch { /* ignore */ }

    if (!resendResponse.ok) {
      const resendMessage = resendJson?.message || resendJson?.error || resendText || 'Failed to send email';
      const match = String(resendMessage).match(/own email address \(([^)]+)\)/i);
      const allowedEmail = match?.[1] ?? null;
      console.error('Resend API error:', resendJson ?? resendText);
      return new Response(JSON.stringify({ success: false, error: resendMessage, errorCode: allowedEmail ? 'RESEND_TESTING_ONLY' : 'RESEND_ERROR', allowedEmail }), { status: resendResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = resendJson || {};
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
