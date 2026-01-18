import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM8wOeqfec58K5fbS7kc00';
const ACTIVATE_BASE_URL = 'https://royscompany.lovable.app/activate';

serve(async (req) => {
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
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Your Custom Website Preview</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles for email clients */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    /* iOS BLUE LINKS */
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    /* MOBILE STYLES */
    @media screen and (max-width: 600px) {
      .mobile-padding { padding: 20px 15px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-btn { padding: 14px 30px !important; font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!-- Preheader Text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    Your custom website preview for ${businessName} is ready! View it now and see your business shine online.
  </div>
  
  <!-- Main Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0f0f0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;" class="mobile-padding">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 0 0 30px;">
              <img src="${logoUrl}" alt="RoysCompany.com" width="280" style="display: block; width: 280px; max-width: 100%; height: auto;" />
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
                
                <!-- Gold Accent Bar -->
                <tr>
                  <td style="background: linear-gradient(90deg, #b8860b 0%, #daa520 50%, #b8860b 100%); height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
                
                <!-- Header Section -->
                <tr>
                  <td style="padding: 45px 40px 30px; text-align: center;" class="mobile-padding">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">
                      Your Website is Ready
                    </h1>
                    <p style="margin: 15px 0 0; color: #b8860b; font-size: 18px; font-weight: 500;">
                      ${businessName}
                    </p>
                  </td>
                </tr>
                
                <!-- Body Content -->
                <tr>
                  <td style="padding: 0 40px 35px;" class="mobile-padding">
                    <p style="margin: 0 0 20px; color: #e5e5e5; font-size: 16px; line-height: 1.7;">
                      Hi ${recipientName},
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #a3a3a3; font-size: 16px; line-height: 1.7;">
                      We've crafted a <span style="color: #daa520; font-weight: 600;">custom website preview</span> exclusively for your business. See how your online presence can elevate your brand and attract more customers.
                    </p>
                    
                    <!-- Preview Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 5px 0 35px;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${websitePreviewUrl}" style="height:54px;v-text-anchor:middle;width:280px;" arcsize="8%" strokecolor="#daa520" strokeweight="2px" fillcolor="#1a1a1a">
                            <w:anchorlock/>
                            <center style="color:#daa520;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">View Your Website Preview</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${websitePreviewUrl}" target="_blank" style="display: inline-block; background-color: #1a1a1a; border: 2px solid #daa520; color: #daa520; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; mso-padding-alt: 0; text-align: center;" class="mobile-btn">
                            View Your Website Preview
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Features Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #252525; border-radius: 12px; border: 1px solid #333333;">
                      <tr>
                        <td style="padding: 25px 30px;">
                          <p style="margin: 0 0 18px; color: #ffffff; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            What's Included
                          </p>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                                <span style="color: #daa520; margin-right: 10px;">✓</span> Professional, mobile-responsive design
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                                <span style="color: #daa520; margin-right: 10px;">✓</span> Customized content for your industry
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                                <span style="color: #daa520; margin-right: 10px;">✓</span> Payment integration ready
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                                <span style="color: #daa520; margin-right: 10px;">✓</span> SEO-optimized structure
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- CTA Section -->
                <tr>
                  <td style="padding: 0 40px 40px;" class="mobile-padding">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%); border-radius: 12px;">
                      <tr>
                        <td style="padding: 35px 30px; text-align: center;">
                          <p style="margin: 0 0 6px; color: rgba(255,255,255,0.85); font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 500;">
                            Limited Time Offer
                          </p>
                          <p style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.3;">
                            Ready to Go Live?
                          </p>
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${STRIPE_PAYMENT_LINK}" style="height:54px;v-text-anchor:middle;width:220px;" arcsize="50%" strokecolor="#ffffff" strokeweight="0" fillcolor="#ffffff">
                            <w:anchorlock/>
                            <center style="color:#8b6914;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Activate Now</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${STRIPE_PAYMENT_LINK}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #8b6914; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 16px; font-weight: 700; mso-padding-alt: 0;" class="mobile-btn">
                            Activate Now
                          </a>
                          <!--<![endif]-->
                          <p style="margin: 20px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">
                            Secure payment • Instant activation • Full support
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Contact -->
                <tr>
                  <td style="padding: 0 40px 35px;" class="mobile-padding">
                    <p style="margin: 0; color: #737373; font-size: 14px; line-height: 1.6; text-align: center;">
                      Have questions? Simply reply to this email — we're here to help.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 8px; color: #737373; font-size: 13px;">
                ${fromName}
              </p>
              <p style="margin: 0; color: #525252; font-size: 12px;">
                © ${new Date().getFullYear()} <a href="https://RoysCompany.com" style="color: #b8860b; text-decoration: none;">RoysCompany.com</a> • All rights reserved
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
