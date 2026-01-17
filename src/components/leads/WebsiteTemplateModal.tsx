import { useState, useEffect } from 'react';
import { Palette, Sparkles, Layers, Zap, Loader2, Check, ExternalLink, Download, Copy, Link, Leaf, Cpu } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Lead {
  id?: string;
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
  onGenerate?: (templateId: string, html: string, publicUrl: string) => void;
}

const WEBSITE_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, bold typography, and a contemporary feel',
    icon: Sparkles,
    preview: 'bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-cyan-500/20',
    features: ['Gradient accents', 'Smooth animations', 'Card layouts'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless elegance with refined traditional aesthetics',
    icon: Palette,
    preview: 'bg-gradient-to-br from-amber-900/20 via-stone-800/10 to-amber-700/20',
    features: ['Serif typography', 'Gold accents', 'Elegant borders'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Less is more — focused on content and whitespace',
    icon: Layers,
    preview: 'bg-gradient-to-br from-zinc-200/50 via-white to-zinc-100/50',
    features: ['Maximum whitespace', 'Pure typography', 'Fast loading'],
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High-impact dark theme with vibrant gradients',
    icon: Zap,
    preview: 'bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-orange-500/30',
    features: ['Dark mode', 'Neon gradients', 'Dynamic shapes'],
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Organic, earthy design inspired by natural elements',
    icon: Leaf,
    preview: 'bg-gradient-to-br from-green-600/20 via-emerald-500/10 to-yellow-600/20',
    features: ['Earthy tones', 'Organic shapes', 'Warm palette'],
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Futuristic, cutting-edge design with cyber aesthetics',
    icon: Cpu,
    preview: 'bg-gradient-to-br from-cyan-400/30 via-blue-600/20 to-fuchsia-500/30',
    features: ['Neon effects', 'Grid patterns', 'Monospace fonts'],
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
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedTemplate(null);
      setGeneratedHtml(null);
      setPublicUrl(null);
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
          leadId: lead.id,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate website');

      const generatedPublicUrl = `${window.location.origin}/site/${data.publicId}`;
      
      setGeneratedHtml(data.html);
      setPublicUrl(generatedPublicUrl);
      setShowPreview(true);
      toast.success('Website generated and hosted successfully!');
      onGenerate?.(selectedTemplate, data.html, generatedPublicUrl);
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

  const handleCopyUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleOpenPublicUrl = () => {
    if (!publicUrl) return;
    window.open(publicUrl, '_blank');
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
              ? 'Your AI-generated website is live and ready to share!'
              : 'Choose a style template to generate a website with AI'}
          </DialogDescription>
        </DialogHeader>

        {showPreview && generatedHtml ? (
          <div className="space-y-4">
            {/* Shareable URL section */}
            {publicUrl && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  value={publicUrl}
                  readOnly
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm"
                />
                <Button variant="ghost" size="sm" onClick={handleCopyUrl} className="gap-1.5">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            )}

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
                  setPublicUrl(null);
                }}
                className="flex-1"
              >
                Generate Another
              </Button>
              <Button variant="secondary" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleOpenPublicUrl} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Live Site
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WEBSITE_TEMPLATES.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    disabled={isGenerating}
                    className={cn(
                      'relative text-left rounded-xl border-2 p-3 transition-all hover:border-primary/50 hover:scale-[1.02]',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border bg-card hover:bg-muted/50',
                      isGenerating && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div
                        className={cn(
                          'h-16 rounded-lg flex items-center justify-center',
                          template.preview
                        )}
                      >
                        <Icon className={cn(
                          'h-7 w-7',
                          isSelected ? 'text-primary' : 'text-foreground/50'
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{template.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                      </div>
                      <ul className="space-y-0.5">
                        {template.features.map((feature) => (
                          <li
                            key={feature}
                            className="text-[10px] text-muted-foreground flex items-center gap-1"
                          >
                            <div className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
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
