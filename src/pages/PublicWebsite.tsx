import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const WATERMARK_HTML = `
<div id="preview-watermark" style="
  position: fixed;
  bottom: 16px;
  right: 16px;
  color: rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  z-index: 99999;
  pointer-events: none;
  user-select: none;
  text-shadow: 0 0 1px rgba(255,255,255,0.5);
">
  Preview by RoysCompany.com
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
        // Use RPC function to access website by public_id
        // This prevents exposing user_id through direct table access
        const { data, error: fetchError } = await supabase
          .rpc('get_website_by_public_id', { p_public_id: publicId });

        if (fetchError) {
          console.error('Error fetching website:', fetchError);
          setError('Website not found');
          return;
        }

        if (!data || data.length === 0) {
          setError('Website not found');
          return;
        }

        setHtml(data[0].html_content);
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
