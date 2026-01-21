import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTemplate, useUpdateTemplate } from '@/hooks/useTemplates';
import type { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';

type EmailTemplate = Tables<'email_templates'>;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
});

interface CreateTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
}

const VARIABLES = [
  { label: 'First Name', value: '{{first_name}}' },
  { label: 'Last Name', value: '{{last_name}}' },
  { label: 'Company', value: '{{company}}' },
  { label: 'Website', value: '{{website}}' },
];

export function CreateTemplateModal({ open, onOpenChange, template }: CreateTemplateModalProps) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const isEditing = !!template;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      subject: '',
      body: '',
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        subject: template.subject,
        body: template.body,
      });
    } else {
      form.reset({
        name: '',
        subject: '',
        body: '',
      });
    }
  }, [template, form]);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + variable + text.substring(end);
      form.setValue('body', newText, { shouldDirty: true });
      // Restore cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    } else {
      const current = form.getValues('body');
      form.setValue('body', current + variable, { shouldDirty: true });
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          name: data.name,
          subject: data.subject,
          body: data.body,
        });
      } else {
        await createTemplate.mutateAsync({
          name: data.name,
          subject: data.subject,
          body: data.body,
        });
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Create Template'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your email template'
              : 'Create a reusable email template for your sequences'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Initial Outreach" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Line</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quick question about {{company}}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Email Body</FormLabel>
                    <div className="flex gap-1">
                      {VARIABLES.map((v) => (
                        <Badge
                          key={v.value}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => insertVariable(v.value)}
                        >
                          {v.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FormControl>
                    <Textarea
                      id="template-body"
                      placeholder="Use variables above for personalization..."
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEditing ? 'Save Changes' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
