import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LUXURY_REAL_ESTATE_TEMPLATE } from '@/data/defaultTemplates';
import { Loader2, Plus, Upload, Code, Eye, Trash2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Template {
  id: string;
  name: string;
  description: string | null;
  html_content: string;
  thumbnail_url: string | null;
  created_at: string;
  is_active: boolean;
}

export default function Templates() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  
  const { data: templates, isLoading } = useQuery({
    queryKey: ['website-templates'],
    queryFn: async () => {
      let dbTemplates: Template[] = [];
      try {
        // Attempt to fetch from DB
        const { data, error } = await supabase
          .from('website_templates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
           dbTemplates = data as Template[];
        }
      } catch (err) {
        console.warn('Failed to fetch templates from DB', err);
      }

      // Always fetch local templates
      let local: any[] = [];
      try {
          const raw = localStorage.getItem('local_templates');
          if (raw) {
              local = JSON.parse(raw);
              if (!Array.isArray(local)) local = [];
          }
      } catch (e) {
          local = [];
      }
      
      // Combine them (Local first so they appear at top)
      return [...local, ...dbTemplates];
    },
  });

  const queryClient = useQueryClient();

  const restoreDefaultsMutation = useMutation({
    mutationFn: async () => {
      // Try DB first
      try {
        const { data } = await supabase.from('website_templates').select('id').eq('name', 'Luxury Real Estate').maybeSingle();
        
        if (data) {
            await supabase.from('website_templates').update({
                html_content: LUXURY_REAL_ESTATE_TEMPLATE,
                description: 'Premium dark theme with gold accents, scroll animations, donut chart, and typewriter effect.',
                is_active: true
            }).eq('id', data.id);
        } else {
            await supabase.from('website_templates').insert({
                name: 'Luxury Real Estate',
                description: 'Premium dark theme with gold accents, scroll animations, donut chart, and typewriter effect.',
                html_content: LUXURY_REAL_ESTATE_TEMPLATE,
                is_active: true
            });
        }
      } catch (err: any) {
         // Fallback to local storage
         console.warn('DB Restore failed, falling back to local storage', err);
         
         const newTemplate: Template = {
             id: 'local-luxury-' + Date.now(),
             name: 'Luxury Real Estate',
             description: 'Premium dark theme (Local Fallback)',
             html_content: LUXURY_REAL_ESTATE_TEMPLATE,
             thumbnail_url: null,
             created_at: new Date().toISOString(),
             is_active: true
         };
         
         const existing = JSON.parse(localStorage.getItem('local_templates') || '[]');
         // Remove old default if exists
         const filtered = existing.filter((t: any) => t.name !== 'Luxury Real Estate');
         localStorage.setItem('local_templates', JSON.stringify([newTemplate, ...filtered]));
         
         throw new Error("Saved to local storage (Database table missing). Refresh to see changes.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-templates'] });
      toast.success('Default templates restored successfully');
    },
    onError: (error) => {
       if (error.message.includes("Saved to local storage")) {
           toast.success("Saved to local storage (Database not configured)");
           queryClient.invalidateQueries({ queryKey: ['website-templates'] });
       } else {
           toast.error('Failed to restore defaults: ' + error.message);
       }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('website_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete template: ' + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage and upload HTML templates used for generating client websites.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => restoreDefaultsMutation.mutate()} disabled={restoreDefaultsMutation.isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${restoreDefaultsMutation.isPending ? 'animate-spin' : ''}`} />
                Restore Defaults
            </Button>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Template
                </Button>
              </DialogTrigger>
              <UploadTemplateDialog onClose={() => setIsUploadOpen(false)} />
            </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {template.description || "No description provided"}
                  </CardDescription>
                </div>
                {template.is_active && <Badge variant="secondary">Active</Badge>}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="bg-muted rounded-md p-4 h-32 flex items-center justify-center text-muted-foreground">
                 {template.thumbnail_url ? (
                   <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover rounded-md" />
                 ) : (
                   <Code className="h-8 w-8" />
                 )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewTemplate(template)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => {
                    if (confirm('Are you sure you want to delete this template?')) {
                        deleteMutation.mutate(template.id);
                    }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {templates?.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No templates found. Upload your first one!</p>
            </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} - Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 border rounded-md overflow-hidden bg-white">
            <iframe 
                srcDoc={previewTemplate?.html_content} 
                className="w-full h-full" 
                title="Template Preview"
                sandbox="allow-scripts"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadTemplateDialog({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    html_content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, html_content: e.target?.result as string }));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.html_content) {
      toast.error('Name and HTML content are required');
      return;
    }

    setIsSubmitting(true);
    
    // Helper to save locally
    const saveToLocal = (): { success: boolean; error?: any } => {
        try {
            const newTemplate: Template = {
                id: 'local-custom-' + Date.now(),
                name: formData.name,
                description: formData.description + ' (Local)',
                html_content: formData.html_content,
                thumbnail_url: null,
                created_at: new Date().toISOString(),
                is_active: true
            };
            
            let existing: any[] = [];
            try {
                const raw = localStorage.getItem('local_templates');
                if (raw) {
                    existing = JSON.parse(raw);
                    if (!Array.isArray(existing)) existing = [];
                }
            } catch (parseError) {
                console.warn("Corrupted local templates, resetting.", parseError);
                existing = [];
            }

            // Try to save
            try {
                const json = JSON.stringify([newTemplate, ...existing]);
                if (json.length > 4500000) { // ~4.5MB safety limit
                    throw new Error("Template too large for browser storage (>4.5MB). Please use smaller images or fix the database connection.");
                }
                localStorage.setItem('local_templates', json);
            } catch (storageError: any) {
                // If quota exceeded, try removing the oldest local template
                if (storageError.name === 'QuotaExceededError' || storageError.message?.includes('exceeded')) {
                    if (existing.length > 0) {
                        // Try removing oldest items until it fits
                        let reduced = [...existing];
                        while (reduced.length > 0) {
                            reduced.pop(); // Remove last (oldest)
                            try {
                                const newJson = JSON.stringify([newTemplate, ...reduced]);
                                localStorage.setItem('local_templates', newJson);
                                toast.info(`Storage full. Removed older templates to save "${newTemplate.name}".`);
                                return { success: true };
                            } catch (e) {
                                // Continue loop
                            }
                        }
                    }
                    throw new Error("Storage full. Template is too large even after clearing old items.");
                }
                throw storageError;
            }
            return { success: true };
        } catch (e: any) {
            console.error("Local storage failed", e);
            return { success: false, error: e };
        }
    };

    try {
        // Try saving to DB first
        const { error } = await supabase.from('website_templates').insert({
          name: formData.name,
          description: formData.description,
          html_content: formData.html_content,
        });

        if (error) {
             console.warn("DB Insert failed, trying local fallback", error);
             const localResult = saveToLocal();
             if (localResult.success) {
                 toast.success('Saved to local storage (Database not configured)');
                 queryClient.invalidateQueries({ queryKey: ['website-templates'] });
                 onClose();
             } else {
                 // Show the LOCAL error if local save failed, because that's the fallback
                 toast.error(`Offline save failed: ${localResult.error?.message || 'Storage error'}`);
             }
        } else {
            toast.success('Template uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['website-templates'] });
            onClose();
        }
    } catch (error: any) {
        // Catch network errors or exceptions
        console.warn("Unexpected error, trying local fallback", error);
        
        // Only try local save if we haven't already (check if error message comes from above)
        if (!error.message?.includes('Local save failed')) {
            const localResult = saveToLocal();
            if (localResult.success) {
                toast.success('Saved to local storage (Network/DB error)');
                queryClient.invalidateQueries({ queryKey: ['website-templates'] });
                onClose();
                return;
            } else {
                 toast.error(`Offline save failed: ${localResult.error?.message || 'Storage error'}`);
                 return;
            }
        }
        
        toast.error(error.message || "Failed to upload template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Upload New Template</DialogTitle>
        <DialogDescription>
          Upload an HTML file or paste the code directly. Ensure the template includes the necessary placeholders like <code>{'{{AGENT_CONFIG_SCRIPT}}'}</code>.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input 
            id="name" 
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Luxury Dark Theme" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input 
            id="description" 
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the style" 
          />
        </div>

        <div className="space-y-2">
          <Label>Template Source</Label>
          <div className="flex gap-4 mb-2">
             <div className="flex-1">
                <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 hover:bg-muted/50 transition-colors">
                    <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload HTML File</span>
                    <Input id="file-upload" type="file" accept=".html" className="hidden" onChange={handleFileUpload} />
                </Label>
             </div>
          </div>
          <div className="relative">
             <Label htmlFor="html-code" className="mb-2 block">Or Paste Code</Label>
             <Textarea 
                id="html-code"
                value={formData.html_content}
                onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
                className="h-48 font-mono text-xs"
                placeholder="<!DOCTYPE html>..."
             />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Upload Template
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
