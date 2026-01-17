import { useState, useEffect } from 'react';
import { Palette, Sparkles, Layers, Zap, Eye, Loader2, Check, ExternalLink, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Lead {
  business_name: string;
  industry?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

interface WebsiteTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onGenerate?: (templateId: string, html: string) => void;
}

const WEBSITE_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, bold typography, and a contemporary feel',
    icon: Sparkles,
    preview: 'bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20',
    features: ['Minimalist layout', 'Sans-serif fonts', 'Subtle animations'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless elegance with refined traditional aesthetics',
    icon: Palette,
    preview: 'bg-gradient-to-br from-amber-900/20 via-stone-800/10 to-amber-800/20',
    features: ['Serif typography', 'Balanced layout', 'Warm tones'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Less is more — focused on content and whitespace',
    icon: Layers,
    preview: 'bg-gradient-to-br from-muted via-background to-muted/50',
    features: ['Maximum whitespace', 'Essential elements only', 'Fast loading'],
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Eye-catching design with vibrant colors and strong presence',
    icon: Zap,
    preview: 'bg-gradient-to-br from-primary via-accent to-secondary',
    features: ['Vibrant colors', 'Large headlines', 'Dynamic elements'],
  },
];

export function WebsiteTemplateModal({
  open,
  onOpenChange,
  lead,
  onGenerate,
}: WebsiteTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedTemplate(null);
      setGeneratedHtml(null);
      setShowPreview(false);
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-website', {
        body: {
          businessName: lead.business_name,
          industry: lead.industry,
          templateId: selectedTemplate,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate website');

      setGeneratedHtml(data.html);
      setShowPreview(true);
      toast.success('Website generated successfully!');
      onGenerate?.(selectedTemplate, data.html);
    } catch (error: any) {
      console.error('Error generating website:', error);
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message?.includes('402')) {
        toast.error('AI usage limit reached. Please add credits to continue.');
      } else {
        toast.error(error.message || 'Failed to generate website');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lead.business_name.toLowerCase().replace(/\s+/g, '-')}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Website downloaded!');
  };

  const selectedTemplateData = WEBSITE_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        'bg-card border-border',
        showPreview && generatedHtml ? 'sm:max-w-5xl' : 'sm:max-w-2xl'
      )}>
        <DialogHeader>
          <DialogTitle className="text-xl">
            {showPreview && generatedHtml 
              ? `Website Preview for ${lead.business_name}` 
              : `Create Website for ${lead.business_name}`}
          </DialogTitle>
          <DialogDescription>
            {showPreview && generatedHtml 
              ? 'Your AI-generated website is ready. Open in new tab or download the HTML.'
              : 'Choose a style template to generate a website with AI'}
          </DialogDescription>
        </DialogHeader>

        {showPreview && generatedHtml ? (
          <div className="space-y-4">
            <div className="relative aspect-[16/10] rounded-lg border border-border overflow-hidden bg-white">
              <iframe
                srcDoc={generatedHtml}
                className="w-full h-full"
                title="Website Preview"
                sandbox="allow-scripts"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setGeneratedHtml(null);
                }}
                className="flex-1"
              >
                Generate Another
              </Button>
              <Button variant="secondary" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleOpenInNewTab} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Full Page
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {WEBSITE_TEMPLATES.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    disabled={isGenerating}
                    className={cn(
                      'relative text-left rounded-lg border-2 p-4 transition-all hover:border-primary/50',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50',
                      isGenerating && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="space-y-3">
                      <div
                        className={cn(
                          'h-20 rounded-md flex items-center justify-center',
                          template.preview
                        )}
                      >
                        <Icon className="h-8 w-8 text-foreground/50" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                      </div>
                      <ul className="space-y-1">
                        {template.features.map((feature) => (
                          <li
                            key={feature}
                            className="text-xs text-muted-foreground flex items-center gap-1.5"
                          >
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1"
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!selectedTemplate || isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Website
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
