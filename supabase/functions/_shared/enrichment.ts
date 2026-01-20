import { EnrichedData } from "./types.ts";

export class EnrichmentService {
  private firecrawlApiKey?: string;

  constructor() {
    this.firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
  }

  async enrichAgent(profileUrl: string): Promise<EnrichedData> {
    console.log(`Enriching data for: ${profileUrl}`);

    // If no API key, fail loudly so we don't use fake data
    if (!this.firecrawlApiKey) {
      throw new Error("Missing FIRECRAWL_API_KEY. Cannot enrich data.");
    }

    try {
      console.log("Calling Firecrawl API...");
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.firecrawlApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: profileUrl,
          formats: ["markdown", "extract"],
          extract: {
            prompt: "Extract the following details about the real estate agent: bio (summary), headshot URL, years of experience (number), specialties (list of strings), and brand colors (primary and secondary hex codes).",
            schema: {
                type: "object",
                properties: {
                    bio: { type: "string" },
                    headshot_url: { type: "string" },
                    years_experience: { type: "number" },
                    specialties: { type: "array", items: { type: "string" } },
                    brand_colors: {
                        type: "object",
                        properties: {
                            primary: { type: "string" },
                            secondary: { type: "string" }
                        }
                    }
                }
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Scraping failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
         throw new Error(`Firecrawl job failed: ${JSON.stringify(result)}`);
      }

      return this.parseScrapedData(result);

    } catch (error) {
      console.error("Enrichment error:", error);
      throw error; // Re-throw to fail the pipeline instead of returning mock data
    }
  }

  private parseScrapedData(scrapedResult: any): EnrichedData {
    // Firecrawl v1 'extract' format returns data in scrapedResult.data.extract
    const extracted = scrapedResult.data?.extract;
    const metadata = scrapedResult.data?.metadata;

    // Use default values ONLY if data is missing, but do not use "fake" persona data
    return {
      bio: extracted?.bio || scrapedResult.data?.markdown?.slice(0, 500) || "",
      headshot_url: extracted?.headshot_url || metadata?.ogImage || "",
      years_experience: extracted?.years_experience || 0,
      specialties: extracted?.specialties || [],
      brand_colors: {
        primary: extracted?.brand_colors?.primary || "#1a1a1a",
        secondary: extracted?.brand_colors?.secondary || "#c0a062"
      }
    };
  }
}
