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
  bottom: 24px;
  right: 24px;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 500;
  z-index: 99999;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
">
  <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #22c55e;"></span>
  <span>Live Preview Mode</span>
  <div style="height: 16px; width: 1px; background: rgba(255,255,255,0.2); margin: 0 4px;"></div>
  <a href="https://RoysCompany.com" target="_blank" style="
    color: #60A5FA;
    text-decoration: none;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.5px;
  ">ROYS COMPANY</a>
</div>
<style>
  #preview-watermark:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    background: rgba(15, 23, 42, 0.95);
  }
</style>
`;

const TEMPLATE_STYLES = {
  modern: {
    name: 'Modern',
    description: 'Award-winning contemporary design with clean lines, bold typography, and sophisticated use of negative space.',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF', 
      accent: '#06B6D4',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#0F172A',
      textMuted: '#64748B',
    },
    fonts: "font-family: 'Inter', system-ui, -apple-system, sans-serif;",
    heroStyle: 'immersive gradient background with glassmorphism elements and floating geometric shapes',
    features: ['Glassmorphism effects', 'Smooth scroll reveal', 'Modern grid layouts', 'Micro-interactions'],
  },
  classic: {
    name: 'Classic',
    description: 'Timeless luxury and elegance with refined serif typography and a sophisticated gold-accented palette.',
    colors: {
      primary: '#1A202C',
      secondary: '#2D3748',
      accent: '#D69E2E',
      background: '#FFFEF8',
      surface: '#FDFBF7',
      text: '#2D3748',
      textMuted: '#718096',
    },
    fonts: "font-family: 'Playfair Display', 'Georgia', serif;",
    heroStyle: 'luxurious minimal layout with elegant serif typography and gold accents',
    features: ['Premium serif fonts', 'Gold foil effects', 'Generous whitespace', 'Traditional elegance'],
  },
  minimal: {
    name: 'Minimal',
    description: 'Ultra-clean, content-focused design with maximum whitespace and Swiss-style typography.',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#000000',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#171717',
      textMuted: '#737373',
    },
    fonts: "font-family: 'Helvetica Neue', 'Arial', sans-serif;",
    heroStyle: 'bold typography-driven hero with absolute minimalism',
    features: ['Radical whitespace', 'Grid systems', 'Swiss typography', 'High contrast'],
  },
  bold: {
    name: 'Bold',
    description: 'High-impact, vibrant design with dark mode aesthetic and dynamic gradients.',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#F59E0B',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
    },
    fonts: "font-family: 'Space Grotesk', 'Poppins', sans-serif;",
    heroStyle: 'deep dark background with vibrant glowing gradients and 3D elements',
    features: ['Dark mode aesthetic', 'Neon glows', 'Bento grid layout', 'Dynamic animations'],
  },
  nature: {
    name: 'Nature',
    description: 'Organic, serene design inspired by natural elements with soft textures and earthy tones.',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#D97706',
      background: '#FDFCF8',
      surface: '#F0FDF4',
      text: '#1C1917',
      textMuted: '#57534E',
    },
    fonts: "font-family: 'Outfit', 'Nunito', sans-serif;",
    heroStyle: 'soft organic shapes with natural imagery and calming colors',
    features: ['Organic border radius', 'Natural textures', 'Soft shadows', 'Floating elements'],
  },
  tech: {
    name: 'Tech',
    description: 'Futuristic, cutting-edge design for technology leaders with cyber aesthetics.',
    colors: {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#6366F1',
      background: '#0B1120',
      surface: '#151F32',
      text: '#F1F5F9',
      textMuted: '#94A3B8',
    },
    fonts: "font-family: 'JetBrains Mono', 'Inter', sans-serif;",
    heroStyle: 'technical grid background with cybernetic accents and glowing lines',
    features: ['Cybernetic effects', 'Grid backgrounds', 'Monospace details', 'Tech-focused layout'],
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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, industry, templateId, email, phone, website, leadId } = await req.json();

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

    const template = TEMPLATE_STYLES[templateId as keyof typeof TEMPLATE_STYLES] || TEMPLATE_STYLES.modern;
    const industryContent = generateIndustryContent(industry, businessName);

    const systemPrompt = `You are a world-class web designer creating stunning, conversion-optimized landing pages.
Your task is to generate a complete, production-ready HTML landing page.

## DESIGN SPECIFICATIONS

**Template: ${template.name}**
${template.description}

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