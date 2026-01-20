import { EnrichedData, Lead } from "./types.ts";

export class SiteBuilderService {
  private webflowToken?: string;
  private collectionId?: string;

  constructor() {
    this.webflowToken = Deno.env.get("WEBFLOW_API_TOKEN");
    this.collectionId = Deno.env.get("WEBFLOW_AGENTS_COLLECTION_ID");
  }

  async generateWebsite(lead: Lead, enrichedData: EnrichedData): Promise<{ url: string; deployId?: string }> {
    console.log(`Generating website for ${lead.agent_name}...`);

    // Option 1: Webflow CMS Item Creation (Preferred for "Real" sites)
    if (this.webflowToken && this.collectionId) {
      return this.createWebflowItem(lead, enrichedData);
    }

    // Option 2: Fallback to Dynamic URL Parameter generation (Client-side rendering)
    // This matches the user's previous n8n workflow style but with enriched data
    return this.generateDynamicUrl(lead, enrichedData);
  }

  private async createWebflowItem(lead: Lead, data: EnrichedData) {
    try {
      const slug = this.generateSlug(lead.agent_name);
      
      const response = await fetch(`https://api.webflow.com/v2/collections/${this.collectionId}/items`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.webflowToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fieldData: {
            name: lead.agent_name,
            slug: slug,
            "agent-bio": data.bio,
            "agent-email": lead.email,
            "agent-phone": lead.phone,
            "headshot-image": data.headshot_url, // Webflow requires image upload usually, this might need a helper
            "brand-color-primary": data.brand_colors?.primary,
            "brand-color-secondary": data.brand_colors?.secondary,
            // Add other fields mapping
          },
          isArchived: false,
          isDraft: false
        })
      });

      if (!response.ok) {
        throw new Error(`Webflow API error: ${response.statusText}`);
      }

      const result = await response.json();
      // Assuming the site is published at a standard domain
      const baseUrl = Deno.env.get("WEBFLOW_SITE_DOMAIN") || "https://your-agency-site.webflow.io";
      
      return {
        url: `${baseUrl}/agents/${slug}`,
        deployId: result.id
      };

    } catch (error) {
      console.error("Webflow creation failed:", error);
      throw error;
    }
  }

  private generateDynamicUrl(lead: Lead, data: EnrichedData): { url: string } {
    // Map of template names to their IDs/URLs
    const templates: Record<string, string> = {
      'luxury': 'luxury-template-id', // You can replace these with actual Lovable/Webflow IDs later
      'modern': 'modern-template-id',
      'minimal': 'minimal-template-id',
      'default': 'default-template'
    };

    const templateKey = (lead.preferred_template?.toLowerCase() || 'default');
    // Currently we append it as a query param, or use it to select base URL if different
    
    const baseUrl = "https://royal-ascend-site.lovable.app/template";
    
    const params = new URLSearchParams();
    params.set("business_name", lead.agent_name);
    params.set("template_mode", templateKey); // Pass the template choice to the frontend

    if (lead.phone) params.set("phone", lead.phone);
    if (lead.email) params.set("email", lead.email);
    if (lead.city) params.set("address", lead.city); // Mapping city to address for now
    
    // Add enriched data if available
    if (data.bio) params.set("bio", data.bio.substring(0, 200)); // Truncate for URL safety
    if (data.brand_colors?.primary) params.set("primary_color", data.brand_colors.primary);
    
    return {
      url: `${baseUrl}?${params.toString()}`
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
