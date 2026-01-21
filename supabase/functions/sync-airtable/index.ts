import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid authentication token");
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('airtable_api_key, airtable_base_id, airtable_table_name')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.airtable_api_key || !settings?.airtable_base_id || !settings?.airtable_table_name) {
      throw new Error("Airtable settings not configured");
    }

    // Get all leads for the user
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id);

    if (leadsError) throw leadsError;

    // Sync to Airtable
    const results = {
      created: 0,
      updated: 0,
      errors: 0,
    };

    for (const lead of leads) {
      try {
        // Check if lead exists in Airtable (this is a simplified check, ideally we'd store the Airtable Record ID in Supabase)
        // For now, let's just create new records for demonstration
        
        const airtableUrl = `https://api.airtable.com/v0/${settings.airtable_base_id}/${encodeURIComponent(settings.airtable_table_name)}`;
        
        const response = await fetch(airtableUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.airtable_api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              "Business Name": lead.business_name,
              "Email": lead.email,
              "Phone": lead.phone,
              "Status": lead.status,
              "Industry": lead.industry,
              "Source": lead.source || 'Manual',
            }
          })
        });

        if (response.ok) {
          results.created++;
        } else {
          console.error(`Failed to sync lead ${lead.id}:`, await response.text());
          results.errors++;
        }
      } catch (err) {
        console.error(`Error syncing lead ${lead.id}:`, err);
        results.errors++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error syncing with Airtable:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
