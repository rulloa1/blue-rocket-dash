import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
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
    // REAL DATA GENERATION via Firecrawl
    console.log(`Scraping real estate agents in ${city}...`);
    
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is missing. Cannot perform real scraping.");
    }

    // 1. Search for agents using Firecrawl Map/Search
    // We search for "real estate agents in [City]" to get a list of profiles/websites
    // SIMPLIFIED: Using basic search first to ensure connectivity.
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `real estate agents in ${city}`,
        limit: 10
      })
    });

    if (!searchResponse.ok) {
        const errText = await searchResponse.text();
        console.error(`Firecrawl API Error: ${searchResponse.status} ${errText}`);
        throw new Error(`Firecrawl Search Failed: ${errText}`);
    }

    const searchResult = await searchResponse.json();
    console.log("Firecrawl Search Result:", JSON.stringify(searchResult, null, 2));

    if (!searchResult.success || !searchResult.data) {
        throw new Error("No results found from Firecrawl search.");
    }

    // 2. Map Firecrawl results to our Lead schema
    const leadsToInsert = searchResult.data.map((item: any) => {
        // Basic search returns: title, url, description, etc.
        return {
            business_name: item.title || "Unknown Agent",
            industry: "Real Estate",
            phone: null, // Will be enriched later
            email: null, // Will be enriched later
            website_url: item.url || null, // Mapped to website_url column
            ai_score: 5, 
            status: "new",
            notes: `Scraped via Firecrawl (Basic): ${item.description || ''}`.slice(0, 500),
            user_id: userId,
            city: city
        };
    });

    if (leadsToInsert.length === 0) {
        throw new Error(`No valid leads found for ${city}`);
    }

    // Insert into database
    const { data, error } = await supabase
      .from("leads")
      .insert(leadsToInsert)
      .select();
    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    // TRIGGER ENRICHMENT AND MARKETING MATERIAL CREATION
    try {
      console.log("Triggering enrichment for new leads...");
      const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
      const N8N_TOKEN = Deno.env.get("N8N_BEARER_TOKEN");
      if (N8N_WEBHOOK_URL) {
        await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": N8N_TOKEN ? `Bearer ${N8N_TOKEN}` : ""
          },
          body: JSON.stringify({
            action: "enrich_and_create_marketing",
            leads: data
          })
        });
      }
    } catch (err) {
      console.error("Failed to trigger enrichment webhook:", err);
    // Don't fail the main request if webhook fails
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully scraped ${data.length} leads from ${city}`,
      leads: data
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
