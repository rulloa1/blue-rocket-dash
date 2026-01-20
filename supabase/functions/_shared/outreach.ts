import { Lead } from "./types.ts";
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decrypt } from "./crypto.ts";

// SMTP settings interface
interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
}

export class OutreachService {
  private resendApiKey?: string;
  private senderEmail: string;
  private signature: string;
  private supabase: SupabaseClient;
  private smtpSettings?: SmtpSettings;
  private useSmtp: boolean = false;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    this.resendApiKey = Deno.env.get("RESEND_API_KEY");
    this.senderEmail = Deno.env.get("SENDER_EMAIL") || "onboarding@yourdomain.com";
    this.signature = "Best,\nRoy";
  }

  async initialize() {
    // Fetch user settings to override defaults
    const { data: settings } = await this.supabase
      .from('user_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settings) {
      if (settings.smtp_host && settings.smtp_username && settings.smtp_password) {
        this.useSmtp = true;
        const password = await decrypt(settings.smtp_password);
        
        this.smtpSettings = {
          host: settings.smtp_host,
          port: settings.smtp_port || 587,
          username: settings.smtp_username,
          password: password,
          from_email: settings.smtp_from_email || settings.smtp_username,
        };
        this.senderEmail = this.smtpSettings.from_email;
        console.log("OutreachService initialized with SMTP settings");
      }

      if (settings.email_signature) {
        this.signature = settings.email_signature;
      }
    }
  }

  async sendEmail(lead: Lead, templateName: 'initial' | 'follow_up_1' | 'follow_up_2' | 'final'): Promise<string> {
    const { subject, html } = this.getTemplate(templateName, lead);

    // Always use Resend API for simplicity (SMTP would require a different approach in Deno)
    // If SMTP is needed, consider using an email API service that supports HTTP
    if (!this.resendApiKey) {
      console.warn(`[WARNING] RESEND_API_KEY missing. Cannot send email to ${lead.email}.`);
      throw new Error("Missing Email Configuration (RESEND_API_KEY required)");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Roy <${this.senderEmail}>`,
        to: [lead.email],
        subject: subject,
        html: html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API Error:", errorText);
      throw new Error(`Email failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.id;
  }

  private getTemplate(name: string, lead: Lead) {
    const firstName = lead.agent_name.split(" ")[0];
    const siteUrl = lead.website_url || "#";
    // Hardcoded Stripe link for now - replace with dynamic one if needed
    const checkoutLink = "https://buy.stripe.com/5kA8y8c0g2q4dUY5kk"; 
    
    // Convert newlines in signature to <br>
    const formattedSignature = this.signature.replace(/\n/g, '<br>');

    let content = "";

    switch (name) {
      case 'initial':
        content = `
            <p>Hi ${firstName},</p>
            <p>I noticed you could use an upgraded online presence, so I went ahead and built a custom website for you.</p>
            <p><strong>Check it out here: <a href="${siteUrl}">${siteUrl}</a></strong></p>
            <p>It features:</p>
            <ul>
              <li>Mobile-optimized design</li>
              <li>Lead capture forms</li>
              <li>Your branding colors</li>
            </ul>
            <p>I'm offering this for just $500 setup + $99/mo (normally $2,000+). Reply to claim it or secure it instantly below:</p>
            <p><a href="${checkoutLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get This Website Now</a></p>
          `;
        break;
      case 'follow_up_1': // Day 3
        content = `
            <p>Hi ${firstName},</p>
            <p>Just wanted to float this to the top of your inbox. Did you get a chance to see the site I built?</p>
            <p><a href="${siteUrl}">View Your Site</a></p>
            <p>If you love it, you can secure it here: <a href="${checkoutLink}">Secure My Site</a></p>
            <p>Let me know what you think!</p>
          `;
        break;
      case 'follow_up_2': // Day 7
        content = `
            <p>Hi ${firstName},</p>
            <p>I haven't heard back, so I assume you're busy. I can only hold this design for another 48 hours before I archive it.</p>
            <p>Link: <a href="${siteUrl}">${siteUrl}</a></p>
            <p><a href="${checkoutLink}">Purchase Now</a></p>
          `;
        break;
      default:
        return { subject: "Hello", html: "Test" };
    }

    return {
      subject: this.getSubject(name, lead),
      html: `${content}<br><p>${formattedSignature}</p>`
    };
  }

  private getSubject(name: string, lead: Lead): string {
    switch(name) {
      case 'initial': return `${lead.agent_name} - I Built You a Professional Website`;
      case 'follow_up_1': return `Quick reminder about your site`;
      case 'follow_up_2': return `Last chance for this design`;
      default: return "Update";
    }
  }

  shouldSendFollowUp(lead: Lead): 'follow_up_1' | 'follow_up_2' | 'final' | null {
    if (!lead.last_contacted_at) return null;
    
    const lastContact = new Date(lead.last_contacted_at);
    const now = new Date();
    const daysSince = (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);

    if (lead.outreach_stage === 1 && daysSince >= 3) return 'follow_up_1';
    if (lead.outreach_stage === 2 && daysSince >= 4) return 'follow_up_2'; // 3+4=7 days total
    if (lead.outreach_stage === 3 && daysSince >= 3) return 'final'; // 7+3=10 days total
    
    return null;
  }
}
