import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
      srcDoc={html || ''}
      className="w-full h-screen border-0"
      title="Website"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
