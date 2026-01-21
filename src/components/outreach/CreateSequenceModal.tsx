import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCreateSequence, useAddSequenceStep, useUpdateSequence } from '@/hooks/useSequences';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

interface EmailStep {
  id: string;
  subject: string;
  body: string;
  delayDays: number;
}

interface CreateSequenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VARIABLES = [
  { label: 'First Name', value: '{{first_name}}' },
  { label: 'Last Name', value: '{{last_name}}' },
  { label: 'Company', value: '{{company}}' },
  { label: 'Website', value: '{{website}}' },
];

export function CreateSequenceModal({ open, onOpenChange }: CreateSequenceModalProps) {
  const [steps, setSteps] = useState<EmailStep[]>([
    { id: '1', subject: '', body: '', delayDays: 0 },
  ]);
  const createSequence = useCreateSequence();
  const addStep = useAddSequenceStep();
  const updateSequence = useUpdateSequence();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const addNewStep = () => {
    setSteps([
      ...steps,
      { id: Date.now().toString(), subject: '', body: '', delayDays: 2 },
    ]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof EmailStep, value: string | number) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const insertVariable = (stepId: string, variable: string) => {
    const textarea = document.getElementById(`step-body-${stepId}`) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      updateStep(stepId, 'body', newText);
      
      // Restore cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    } else {
      const step = steps.find(s => s.id === stepId);
      if (step) {
        updateStep(stepId, 'body', step.body + variable);
      }
    }
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>, activate: boolean) => {
    try {
      const sequence = await createSequence.mutateAsync({
        name: data.name,
        description: data.description,
      });

      // Add all steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await addStep.mutateAsync({
          sequence_id: sequence.id,
          step_order: i + 1,
          subject: step.subject || `Email ${i + 1}`,
          body: step.body || '',
          delay_days: step.delayDays,
        });
      }

      // If activating, update status
      if (activate) {
        await updateSequence.mutateAsync({ id: sequence.id, status: 'active' });
      }

      form.reset();
      setSteps([{ id: '1', subject: '', body: '', delayDays: 0 }]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create sequence:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Email Sequence</DialogTitle>
          <DialogDescription>
            Build an automated email sequence to engage your leads
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Welcome Series" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Email Steps</h4>
                <Button type="button" variant="outline" size="sm" onClick={addNewStep}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="rounded-lg border border-border bg-card/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Email {index + 1}
                        </span>
                        {index > 0 && (
                          <span className="text-xs text-muted-foreground">
                            (Wait {step.delayDays} days)
                          </span>
                        )}
                      </div>
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeStep(step.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {index > 0 && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">
                          Delay after previous:
                        </label>
                        <Input
                          type="number"
                          min={1}
                          className="w-20"
                          value={step.delayDays}
                          onChange={(e) =>
                            updateStep(step.id, 'delayDays', parseInt(e.target.value) || 0)
                          }
                        />
                        <span className="text-sm text-muted-foreground">days</span>
                      </div>
                    )}

                    <Input
                      placeholder="Subject line"
                      value={step.subject}
                      onChange={(e) => updateStep(step.id, 'subject', e.target.value)}
                    />

                    <div className="space-y-2">
                      <div className="flex gap-1 flex-wrap">
                        {VARIABLES.map((v) => (
                          <Badge
                            key={v.value}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted text-xs"
                            onClick={() => insertVariable(step.id, v.value)}
                          >
                            {v.label}
                          </Badge>
                        ))}
                      </div>
                      <Textarea
                        id={`step-body-${step.id}`}
                        placeholder="Email body (use variables above for personalization)"
                        rows={4}
                        value={step.body}
                        onChange={(e) => updateStep(step.id, 'body', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={form.handleSubmit((values) => handleSubmit(values, false))}
            disabled={createSequence.isPending}
          >
            Save as Draft
          </Button>
          <Button
            onClick={form.handleSubmit((values) => handleSubmit(values, true))}
            disabled={createSequence.isPending}
          >
            Save & Activate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
