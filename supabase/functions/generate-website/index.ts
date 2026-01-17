import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM5kC0sQ2DwbCl6Kx1Jm00';

const TEMPLATE_STYLES = {
  modern: {
    description: 'Clean lines, bold typography, contemporary feel',
    colors: 'Use a modern color palette with primary blue (#3B82F6), white backgrounds, dark text. Sans-serif fonts like Inter or system fonts.',
    layout: 'Minimalist layout with lots of whitespace, subtle shadows, rounded corners, smooth animations',
  },
  classic: {
    description: 'Timeless elegance with refined traditional aesthetics',
    colors: 'Warm, sophisticated palette with deep navy (#1e3a5f), cream (#f5f0e6), gold accents (#c9a227). Serif fonts for headings.',
    layout: 'Balanced, symmetrical layout with elegant borders, refined spacing, traditional structure',
  },
  minimal: {
    description: 'Less is more — focused on content and whitespace',
    colors: 'Monochromatic palette, lots of white space, black text (#111), subtle gray accents. Clean sans-serif fonts.',
    layout: 'Maximum whitespace, only essential elements, ultra-clean typography, no decorative elements',
  },
  bold: {
    description: 'Eye-catching design with vibrant colors and strong presence',
    colors: 'Vibrant gradient backgrounds, bold primary color (#FF6B35 or #7C3AED), high contrast, dynamic accents.',
    layout: 'Large headlines, dramatic sections, bold CTAs, dynamic geometric shapes, energetic feel',
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, industry, templateId, email, phone, website } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const templateStyle = TEMPLATE_STYLES[templateId as keyof typeof TEMPLATE_STYLES] || TEMPLATE_STYLES.modern;

    const systemPrompt = `You are an expert web designer that creates beautiful, professional single-page websites. 
Generate complete, valid HTML for a landing page. The HTML should be self-contained with inline CSS styles.
Include the Stripe payment link as the main CTA button: ${STRIPE_PAYMENT_LINK}

Design Style: ${templateStyle.description}
Color Guidelines: ${templateStyle.colors}
Layout Guidelines: ${templateStyle.layout}

Requirements:
- Create a complete HTML document with <!DOCTYPE html>, <html>, <head>, and <body> tags
- Include all CSS as inline styles or in a <style> tag in the head
- Make it mobile-responsive using CSS
- Include these sections: Hero, About/Services, Features (3 items), Call-to-Action with the payment button, Footer
- The design must look professional and polished
- Use real placeholder content relevant to the business
- Include the payment link (${STRIPE_PAYMENT_LINK}) as "Get Started Now" or "Start Today" button`;

    const userPrompt = `Create a ${templateId} style landing page for:
Business Name: ${businessName}
Industry: ${industry || 'General Business'}
${email ? `Contact Email: ${email}` : ''}
${phone ? `Phone: ${phone}` : ''}
${website ? `Website: ${website}` : ''}

Generate a complete, beautiful HTML page that represents this business professionally.`;

    console.log('Generating website for:', businessName, 'with template:', templateId);

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
    const generatedHtml = data.choices?.[0]?.message?.content || '';

    // Extract HTML from markdown code blocks if present
    let cleanHtml = generatedHtml;
    const htmlMatch = generatedHtml.match(/```html\n?([\s\S]*?)```/);
    if (htmlMatch) {
      cleanHtml = htmlMatch[1].trim();
    } else {
      // Try without language specifier
      const codeMatch = generatedHtml.match(/```\n?([\s\S]*?)```/);
      if (codeMatch) {
        cleanHtml = codeMatch[1].trim();
      }
    }

    console.log('Website generated successfully');

    return new Response(
      JSON.stringify({ success: true, html: cleanHtml }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating website:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate website" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
