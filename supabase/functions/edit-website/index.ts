import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteId, editRequest, currentHtml } = await req.json();

    if (!editRequest || !currentHtml) {
      throw new Error("Edit request and current HTML are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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

    console.log('Editing website with request:', editRequest.substring(0, 100));

    const systemPrompt = `You are an expert web developer and designer. Your task is to modify an existing HTML website based on the user's edit request.

## IMPORTANT RULES:

1. Return ONLY the complete modified HTML document - no explanations, no markdown
2. Preserve the overall structure and functionality of the website
3. Only modify what the user specifically requests
4. Maintain responsive design and all existing styles
5. Keep all existing links and functionality intact
6. If the user asks for color changes, update the relevant CSS
7. If the user asks for text changes, update the content
8. If the user asks for layout changes, modify the CSS/structure accordingly
9. Ensure the result is valid, complete HTML that works standalone

## COMMON EDIT TYPES:

- **Colors**: Update CSS color values (hex, rgb, hsl)
- **Text/Content**: Change headings, paragraphs, button text
- **Layout**: Modify flexbox/grid, spacing, alignment
- **Fonts**: Update font-family, font-size, font-weight
- **Images**: Change background images or img src attributes
- **Sections**: Add, remove, or reorder sections
- **Buttons**: Modify button styles, text, or links
- **Animations**: Add or modify CSS transitions/animations

Return the complete modified HTML document.`;

    const userPrompt = `Here is the current website HTML:

\`\`\`html
${currentHtml}
\`\`\`

User's edit request: "${editRequest}"

Apply the requested changes and return the complete modified HTML. Only return the HTML, no explanations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const modifiedHtml = data.choices?.[0]?.message?.content || '';

    // Extract HTML from markdown code blocks if present
    let cleanHtml = modifiedHtml;
    const htmlMatch = modifiedHtml.match(/```html\n?([\s\S]*?)```/);
    if (htmlMatch) {
      cleanHtml = htmlMatch[1].trim();
    } else {
      const codeMatch = modifiedHtml.match(/```\n?([\s\S]*?)```/);
      if (codeMatch) {
        cleanHtml = codeMatch[1].trim();
      }
    }

    // Ensure the HTML starts with DOCTYPE
    if (!cleanHtml.toLowerCase().startsWith('<!doctype')) {
      if (cleanHtml.toLowerCase().startsWith('<html')) {
        cleanHtml = '<!DOCTYPE html>\n' + cleanHtml;
      }
    }

    // Update the website in the database if websiteId is provided
    if (websiteId) {
      const { error: updateError } = await supabase
        .from('generated_websites')
        .update({ 
          html_content: cleanHtml,
          updated_at: new Date().toISOString()
        })
        .eq('public_id', websiteId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating website:', updateError);
        // Continue anyway - we can still return the modified HTML
      } else {
        console.log('Website updated successfully:', websiteId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        html: cleanHtml,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error editing website:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to edit website" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
