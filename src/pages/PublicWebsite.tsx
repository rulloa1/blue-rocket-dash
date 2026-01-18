import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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

export default function PublicWebsite() {
  const { publicId } = useParams<{ publicId: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWebsite() {
      if (!publicId) {
        setError('Invalid website link');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('generated_websites')
          .select('html_content')
          .eq('public_id', publicId)
          .single();

        if (fetchError || !data) {
          console.error('Error fetching website:', fetchError);
          setError('Website not found');
          return;
        }

        setHtml(data.html_content);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load website');
      } finally {
        setLoading(false);
      }
    }

    fetchWebsite();
  }, [publicId]);

  // Inject watermark if not already present
  const htmlWithWatermark = useMemo(() => {
    if (!html) return '';
    if (html.includes('id="preview-watermark"')) return html;
    
    if (html.toLowerCase().includes('</body>')) {
      return html.replace(/<\/body>/i, `${WATERMARK_HTML}\n</body>`);
    }
    return html + WATERMARK_HTML;
  }, [html]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-semibold mb-2">Oops!</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Render the full HTML page
  return (
    <iframe
      srcDoc={htmlWithWatermark}
      className="w-full h-screen border-0"
      title="Website"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
