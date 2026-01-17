import { useState } from 'react';
import { Palette, Sparkles, Layers, Zap, Eye, Loader2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WebsiteTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  onGenerate: (templateId: string) => void;
  isGenerating?: boolean;
}

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM5kC0sQ2DwbCl6Kx1Jm00';

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
  leadName,
  onGenerate,
  isGenerating = false,
}: WebsiteTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleGenerate = () => {
    if (selectedTemplate) {
      onGenerate(selectedTemplate);
    }
  };

  const selectedTemplateData = WEBSITE_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Website for {leadName}</DialogTitle>
          <DialogDescription>
            Choose a style template to generate a website preview
          </DialogDescription>
        </DialogHeader>

        {previewMode && selectedTemplateData ? (
          <div className="space-y-4">
            <div
              className={cn(
                'relative aspect-video rounded-lg border border-border overflow-hidden',
                selectedTemplateData.preview
              )}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md space-y-6 text-center">
                  {/* Mock website preview */}
                  <div className="space-y-2">
                    <div className="h-4 w-24 mx-auto bg-foreground/20 rounded" />
                    <div className="flex justify-center gap-4">
                      <div className="h-2 w-12 bg-foreground/10 rounded" />
                      <div className="h-2 w-12 bg-foreground/10 rounded" />
                      <div className="h-2 w-12 bg-foreground/10 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 w-3/4 mx-auto bg-foreground/20 rounded" />
                    <div className="h-3 w-full bg-foreground/10 rounded" />
                    <div className="h-3 w-5/6 mx-auto bg-foreground/10 rounded" />
                  </div>
                  {/* Payment CTA Button */}
                  <a
                    href={STRIPE_PAYMENT_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-10 px-6 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Get Started Now
                  </a>
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="h-16 bg-foreground/10 rounded" />
                    <div className="h-16 bg-foreground/10 rounded" />
                    <div className="h-16 bg-foreground/10 rounded" />
                  </div>
                </div>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <selectedTemplateData.icon className="h-5 w-5 text-foreground/60" />
                <span className="text-sm font-medium text-foreground/80">
                  {selectedTemplateData.name} Style
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPreviewMode(false)} className="flex-1">
                Back to Templates
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
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
                    className={cn(
                      'relative text-left rounded-lg border-2 p-4 transition-all hover:border-primary/50',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
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
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => setPreviewMode(true)}
                disabled={!selectedTemplate}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Template
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
