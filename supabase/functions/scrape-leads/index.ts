import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { city, userId } = await req.json();

    if (!city || !userId) {
      throw new Error("City and User ID are required");
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // MOCK DATA GENERATION
    // In a real scenario, this would call Serper.dev, Google Places API, or a scraping service.
    const mockLeads = [
      {
        business_name: `${city} Premier Realty`,
        industry: "Real Estate",
        phone: "(555) 123-4567",
        email: `contact@${city.toLowerCase().replace(/\s/g, "")}realty.com`,
        website: null, // Good lead! No website.
        ai_score: 8,
        status: "new",
        notes: `Found via search for agents in ${city}. High potential.`,
        user_id: userId,
      },
      {
        business_name: `The ${city} Home Team`,
        industry: "Real Estate",
        phone: "(555) 987-6543",
        email: `sales@${city.toLowerCase().replace(/\s/g, "")}hometeam.com`,
        website: `http://old-site-${city.toLowerCase().replace(/\s/g, "")}.com`, // Old website?
        ai_score: 6,
        status: "new",
        notes: `Has a website but it looks outdated.`,
        user_id: userId,
      },
      {
        business_name: `${city} Luxury Estates`,
        industry: "Real Estate",
        phone: "(555) 456-7890",
        email: `info@${city.toLowerCase().replace(/\s/g, "")}luxury.com`,
        website: null,
        ai_score: 9,
        status: "new",
        notes: `Luxury segment in ${city}. No website found.`,
        user_id: userId,
      }
    ];

    // Insert into database
    const { data, error } = await supabase
      .from("leads")
      .insert(mockLeads)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped ${data.length} leads from ${city}`,
        leads: data,
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
