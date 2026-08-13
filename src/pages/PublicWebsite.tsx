import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const WATERMARK_HTML = `
<div id="preview-watermark" style="
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 99999;
  overflow: hidden;
">
  <div style="
    transform: rotate(-45deg);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 120px;
    font-weight: 900;
    letter-spacing: 20px;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.06);
    white-space: nowrap;
    user-select: none;
  ">PREVIEW</div>
</div>
`;

interface WebsiteData {
  html_content: string;
  business_name: string;
  activated_at: string | null;
}

export default function PublicWebsite() {
  const { publicId } = useParams<{ publicId: string }>();
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActivated = websiteData?.activated_at != null;

  useEffect(() => {
    async function fetchWebsite() {
      if (!publicId) {
        setError('Invalid website link');
        setLoading(false);
        return;
      }

      try {
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

        setWebsiteData({
          html_content: data[0].html_content,
          business_name: data[0].business_name,
          activated_at: data[0].activated_at,
        });
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load website');
      } finally {
        setLoading(false);
      }
    }

    fetchWebsite();
  }, [publicId]);

  // Inject watermark only if NOT activated
  const finalHtml = useMemo(() => {
    if (!websiteData?.html_content) return '';
    
    // If activated, return original HTML without watermark
    if (isActivated) {
      return websiteData.html_content;
    }
    
    // If not activated, add watermark
    const html = websiteData.html_content;
    if (html.includes('id="preview-watermark"')) return html;
    
    if (html.toLowerCase().includes('</body>')) {
      return html.replace(/<\/body>/i, `${WATERMARK_HTML}\n</body>`);
    }
    return html + WATERMARK_HTML;
  }, [websiteData, isActivated]);

  const handleActivate = async () => {
    if (!publicId) return;
    
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-website-checkout', {
        body: {
          publicId,
          businessName: websiteData?.business_name || '',
          origin: window.location.origin,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast.error('Failed to start checkout');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Something went wrong');
    } finally {
      setCheckoutLoading(false);
    }
  };

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

  return (
    <div className="relative w-full h-screen">
      {/* Activate Banner - only show if NOT activated */}
      {!isActivated && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 flex items-center justify-center gap-4 shadow-lg">
          <span className="text-sm font-medium">
            ✨ Like this website? Activate it to remove the watermark and go live!
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleActivate}
            disabled={checkoutLoading}
            className="bg-white text-blue-600 hover:bg-blue-50 gap-1.5"
          >
            {checkoutLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Activate Now
          </Button>
        </div>
      )}
      
      {/* Website iframe */}
      <iframe
        srcDoc={finalHtml}
        className={`w-full h-full border-0 ${!isActivated ? 'pt-11' : ''}`}
        title="Website"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        style={{ height: !isActivated ? 'calc(100vh - 44px)' : '100vh' }}
      />
    </div>
  );
}
