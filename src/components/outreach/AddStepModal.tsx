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
import { useAddSequenceStep } from '@/hooks/useSequences';

const formSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  delay_days: z.number().min(0, 'Delay must be 0 or more'),
});

interface AddStepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequenceId: string;
  nextOrder: number;
}

export function AddStepModal({ open, onOpenChange, sequenceId, nextOrder }: AddStepModalProps) {
  const addStep = useAddSequenceStep();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      body: '',
      delay_days: nextOrder === 1 ? 0 : 2,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addStep.mutateAsync({
        sequence_id: sequenceId,
        step_order: nextOrder,
        subject: values.subject,
        body: values.body,
        delay_days: values.delay_days,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add step:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Email Step</DialogTitle>
          <DialogDescription>
            Add a new email to your sequence
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {nextOrder > 1 && (
              <FormField
                control={form.control}
                name="delay_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay after previous email</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">days</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                  <FormLabel>Email Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Use {{first_name}}, {{company}}, {{website}} for personalization"
                      rows={8}
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
              <Button type="submit" disabled={addStep.isPending}>
                Add Step
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
