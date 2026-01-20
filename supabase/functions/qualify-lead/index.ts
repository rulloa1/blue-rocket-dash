import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();

    if (!leadId) {
      throw new Error("Lead ID is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the lead
    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (fetchError || !lead) {
      throw new Error("Lead not found");
    }

    // Calculate Score
    let score = 1; // Base score

    if (lead.phone) score += 2;
    if (lead.email) score += 3;
    if (!lead.website) {
        score += 4; // High potential!
    } else {
        // Check if website looks generic or cheap (mock logic)
        if (lead.website.includes(".wordpress.com") || lead.website.includes(".wix.com")) {
            score += 2; // Needs an upgrade
        }
    }

    if (lead.industry && lead.industry.toLowerCase().includes("real estate")) {
        score += 1;
    }

    // Cap at 10
    score = Math.min(score, 10);

    // Update the lead
    const { error: updateError } = await supabase
      .from("leads")
      .update({ ai_score: score })
      .eq("id", leadId);

    if (updateError) {
      throw updateError;
    }

    // --- TELEGRAM NOTIFICATION (Merged from lead-qualifier) ---
    // If score is high (>= 7), send a notification
    if (score >= 7) {
        const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
        const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

        if (BOT_TOKEN && CHAT_ID) {
            try {
                // Construct a helpful message
                const message = `🚀 *High Quality Lead Detected!*\n\n` +
                                `*Score:* ${score}/10\n` +
                                `*Name:* ${lead.agent_name || "Unknown"}\n` +
                                `*Email:* ${lead.email || "N/A"}\n` +
                                `*Phone:* ${lead.phone || "N/A"}\n` +
                                `*Website:* ${lead.website || lead.website_url || "N/A"}\n\n` +
                                `_Log in to dashboard to view details._`;

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: message,
                        parse_mode: "Markdown"
                    }),
                });
                console.log("Telegram notification sent.");
            } catch (err) {
                console.error("Failed to send Telegram notification:", err);
                // Don't fail the whole request just because notification failed
            }
        }
    }
    // ----------------------------------------------------------

    return new Response(
      JSON.stringify({
        success: true,
        score: score,
        message: `Lead scored: ${score}/10`
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
