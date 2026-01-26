import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM8wOeqfec58K5fbS7kc00';

// Watermark HTML to inject into generated websites
const WATERMARK_HTML = `
<div id="preview-watermark" style="
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(30,30,30,0.9) 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 500;
  z-index: 99999;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 8px;
">
  <span style="opacity: 0.7;">Preview by</span>
  <a href="https://RoysCompany.com" target="_blank" style="
    color: #60A5FA;
    text-decoration: none;
    font-weight: 600;
  ">RoysCompany.com</a>
</div>
`;

const TEMPLATE_STYLES = {
  modern: {
    name: 'Modern',
    description: 'Clean, contemporary design with bold typography and smooth gradients',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF', 
      accent: '#06B6D4',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#0F172A',
      textMuted: '#64748B',
    },
    fonts: "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
    heroStyle: 'gradient background with floating geometric shapes',
    features: ['Smooth hover animations', 'Gradient CTAs', 'Card-based layouts', 'Subtle shadows'],
  },
  classic: {
    name: 'Classic',
    description: 'Timeless elegance with refined typography and sophisticated color palette',
    colors: {
      primary: '#1E3A5F',
      secondary: '#2C5282',
      accent: '#C9A227',
      background: '#FFFEF8',
      surface: '#F5F0E6',
      text: '#1A202C',
      textMuted: '#4A5568',
    },
    fonts: "font-family: 'Georgia', 'Times New Roman', serif;",
    heroStyle: 'elegant overlay with refined borders and gold accents',
    features: ['Serif typography for headings', 'Elegant gold accents', 'Refined spacing', 'Classic borders'],
  },
  minimal: {
    name: 'Minimal',
    description: 'Ultra-clean design focused on content with maximum whitespace',
    colors: {
      primary: '#18181B',
      secondary: '#3F3F46',
      accent: '#18181B',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#09090B',
      textMuted: '#71717A',
    },
    fonts: "font-family: 'Helvetica Neue', Arial, sans-serif;",
    heroStyle: 'clean typography-focused hero with minimal elements',
    features: ['Maximum whitespace', 'No decorative elements', 'Pure typography', 'Monochromatic palette'],
  },
  bold: {
    name: 'Bold',
    description: 'High-impact design with vibrant gradients and dynamic elements',
    colors: {
      primary: '#7C3AED',
      secondary: '#DB2777',
      accent: '#F59E0B',
      background: '#0F0F23',
      surface: '#1A1A2E',
      text: '#FFFFFF',
      textMuted: '#A1A1AA',
    },
    fonts: "font-family: 'Poppins', 'Montserrat', sans-serif;",
    heroStyle: 'dark theme with vibrant gradient accents and animated elements',
    features: ['Dark mode by default', 'Vibrant gradient buttons', 'Dynamic geometric shapes', 'High contrast'],
  },
  nature: {
    name: 'Nature',
    description: 'Organic, earthy design inspired by natural elements',
    colors: {
      primary: '#166534',
      secondary: '#15803D',
      accent: '#CA8A04',
      background: '#FEFEF8',
      surface: '#F0FDF4',
      text: '#14532D',
      textMuted: '#4D7C0F',
    },
    fonts: "font-family: 'Nunito', 'Quicksand', sans-serif;",
    heroStyle: 'organic shapes with natural textures and earthy tones',
    features: ['Organic border radius', 'Natural color palette', 'Leaf/nature icons', 'Soft transitions'],
  },
  tech: {
    name: 'Tech',
    description: 'Futuristic, cutting-edge design for technology-focused businesses',
    colors: {
      primary: '#00D9FF',
      secondary: '#0099FF',
      accent: '#FF00FF',
      background: '#0A0A0F',
      surface: '#12121A',
      text: '#E4E4E7',
      textMuted: '#71717A',
    },
    fonts: "font-family: 'JetBrains Mono', 'Fira Code', monospace;",
    heroStyle: 'dark cyber aesthetic with neon accents and grid patterns',
    features: ['Neon glow effects', 'Grid background patterns', 'Monospace fonts', 'Futuristic animations'],
  },
};

const generateIndustryContent = (industry: string, businessName: string) => {
  const industryLower = (industry || 'general').toLowerCase();
  
  const industryContent: Record<string, { tagline: string; services: string[]; benefits: string[] }> = {
    restaurant: {
      tagline: 'Authentic flavors, memorable experiences',
      services: ['Dine-In Experience', 'Private Events', 'Catering Services'],
      benefits: ['Farm-to-table ingredients', 'Award-winning chefs', 'Cozy atmosphere'],
    },
    healthcare: {
      tagline: 'Your health, our priority',
      services: ['Primary Care', 'Specialized Treatment', 'Preventive Care'],
      benefits: ['Board-certified doctors', 'State-of-the-art facilities', 'Compassionate care'],
    },
    fitness: {
      tagline: 'Transform your body, elevate your life',
      services: ['Personal Training', 'Group Classes', 'Nutrition Coaching'],
      benefits: ['Expert certified trainers', 'Modern equipment', 'Flexible schedules'],
    },
    technology: {
      tagline: 'Innovation that drives results',
      services: ['Custom Development', 'Cloud Solutions', 'Digital Transformation'],
      benefits: ['Cutting-edge technology', 'Scalable solutions', '24/7 support'],
    },
    realestate: {
      tagline: 'Find your dream property',
      services: ['Property Sales', 'Rentals', 'Property Management'],
      benefits: ['Expert market knowledge', 'Personalized service', 'Extensive listings'],
    },
    legal: {
      tagline: 'Trusted legal expertise',
      services: ['Consultation', 'Representation', 'Document Preparation'],
      benefits: ['Experienced attorneys', 'Confidential service', 'Results-driven approach'],
    },
    education: {
      tagline: 'Empowering minds, shaping futures',
      services: ['Tutoring', 'Test Preparation', 'Skill Development'],
      benefits: ['Expert instructors', 'Personalized learning', 'Proven results'],
    },
    beauty: {
      tagline: 'Where beauty meets artistry',
      services: ['Hair Styling', 'Skincare', 'Wellness Treatments'],
      benefits: ['Licensed professionals', 'Premium products', 'Relaxing ambiance'],
    },
    default: {
      tagline: 'Excellence in every detail',
      services: ['Professional Services', 'Custom Solutions', 'Expert Consultation'],
      benefits: ['Industry expertise', 'Quality assurance', 'Customer-focused approach'],
    },
  };

  for (const key of Object.keys(industryContent)) {
    if (industryLower.includes(key)) {
      return industryContent[key];
    }
  }
  
  return industryContent.default;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, industry, templateId, email, phone, website, leadId, customColor, tone } = await req.json();

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

    const templateConfig = TEMPLATE_STYLES[templateId as keyof typeof TEMPLATE_STYLES];
    const template = templateConfig ? { ...templateConfig } : { ...TEMPLATE_STYLES.modern };
    
    // Override primary color if provided
    if (customColor) {
      template.colors = { ...template.colors, primary: customColor };
    }

    const industryContent = generateIndustryContent(industry, businessName);

    const systemPrompt = `You are a world-class web designer creating stunning, conversion-optimized landing pages.
Your task is to generate a complete, production-ready HTML landing page.

## DESIGN SPECIFICATIONS

**Template: ${template.name}**
${template.description}

**Tone of Voice:** ${tone || 'Professional and trustworthy'}

**Color Palette:**
- Primary: ${template.colors.primary}
- Secondary: ${template.colors.secondary}
- Accent: ${template.colors.accent}
- Background: ${template.colors.background}
- Surface: ${template.colors.surface}
- Text: ${template.colors.text}
- Text Muted: ${template.colors.textMuted}

**Typography:** ${template.fonts}

**Hero Style:** ${template.heroStyle}

**Design Features to Include:**
${template.features.map(f => `- ${f}`).join('\n')}

## CONTENT REQUIREMENTS

**Business:** ${businessName}
**Industry:** ${industry || 'General Business'}
**Tagline suggestion:** "${industryContent.tagline}"

**Suggested Services:**
${industryContent.services.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Key Benefits:**
${industryContent.benefits.map((b, i) => `${i + 1}. ${b}`).join('\n')}

## TECHNICAL REQUIREMENTS

1. Complete valid HTML5 document with DOCTYPE
2. ALL styles must be in a <style> tag in the <head> - no external stylesheets
3. Fully responsive design using CSS media queries
4. Include Google Fonts import for typography
5. Smooth scroll behavior and hover transitions
6. The main CTA button MUST link to: ${STRIPE_PAYMENT_LINK}
7. Include subtle animations (fade-in, hover effects)

## REQUIRED SECTIONS (in order)

1. **Navigation** - Sticky/fixed nav with logo (business name) and links
2. **Hero Section** - Compelling headline, subheadline, and prominent CTA button
3. **About/Introduction** - Brief company description with value proposition
4. **Services/Features** - 3 service cards with icons (use Unicode/emoji icons)
5. **Benefits/Why Choose Us** - 3-4 key benefits with icons
6. **Testimonial** - One customer quote (create realistic placeholder)
7. **Call-to-Action** - Final conversion section with payment button
8. **Footer** - Contact info, links, copyright

## IMPORTANT NOTES

- Make the design look PROFESSIONAL and POLISHED - not generic
- Use realistic, industry-appropriate content
- Ensure excellent contrast and readability
- CTA buttons should stand out prominently
- Add loading="lazy" to any images
- Contact info should include: ${email ? `Email: ${email}` : ''}${phone ? ` | Phone: ${phone}` : ''}
${website ? `- Include link to: ${website}` : ''}

Generate the complete HTML now. Do not include any markdown formatting or explanations - just the raw HTML.`;

    const userPrompt = `Generate a beautiful ${template.name} style landing page for "${businessName}" in the ${industry || 'General Business'} industry. Make it look professional and conversion-focused with the Stripe payment button prominently featured.`;

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
      const codeMatch = generatedHtml.match(/```\n?([\s\S]*?)```/);
      if (codeMatch) {
        cleanHtml = codeMatch[1].trim();
      }
    }

    // Ensure the HTML starts with DOCTYPE if it was stripped
    if (!cleanHtml.toLowerCase().startsWith('<!doctype')) {
      if (cleanHtml.toLowerCase().startsWith('<html')) {
        cleanHtml = '<!DOCTYPE html>\n' + cleanHtml;
      }
    }

    // Inject the watermark before the closing body tag
    if (cleanHtml.toLowerCase().includes('</body>')) {
      cleanHtml = cleanHtml.replace(/<\/body>/i, `${WATERMARK_HTML}\n</body>`);
    } else {
      // If no body tag, append to the end
      cleanHtml += WATERMARK_HTML;
    }

    console.log('Website generated successfully, saving to database...');

    const { data: websiteData, error: insertError } = await supabase
      .from('generated_websites')
      .insert({
        user_id: user.id,
        lead_id: leadId || null,
        business_name: businessName,
        template_id: templateId,
        html_content: cleanHtml,
      })
      .select('public_id')
      .single();

    if (insertError) {
      console.error('Error saving website:', insertError);
      throw new Error('Failed to save website');
    }

    console.log('Website saved with public_id:', websiteData.public_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        html: cleanHtml,
        publicId: websiteData.public_id,
      }),
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