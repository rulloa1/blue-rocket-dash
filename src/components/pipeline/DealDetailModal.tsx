import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  ExternalLink,
  Edit2,
  Archive,
  Clock,
  DollarSign,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useDeal,
  useDealHistory,
  useUpdateDeal,
  useArchiveDeal,
  STAGE_ORDER,
  STAGE_LABELS,
  type Deal,
  type DealStage,
} from '@/hooks/useDeals';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be positive'),
  stage: z.string(),
  next_action: z.string().optional(),
  next_action_date: z.string().optional(),
  proposal_url: z.string().optional(),
  notes: z.string().optional(),
});

interface DealDetailModalProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealDetailModal({ deal, open, onOpenChange }: DealDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const { data: fullDeal, isLoading } = useDeal(deal?.id || null);
  const { data: history } = useDealHistory(deal?.id || null);
  const updateDeal = useUpdateDeal();
  const archiveDeal = useArchiveDeal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      value: 0,
      stage: 'lead',
      next_action: '',
      next_action_date: '',
      proposal_url: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (fullDeal) {
      form.reset({
        title: fullDeal.title,
        value: Number(fullDeal.value),
        stage: fullDeal.stage,
        next_action: fullDeal.next_action || '',
        next_action_date: fullDeal.next_action_date || '',
        proposal_url: fullDeal.proposal_url || '',
        notes: fullDeal.notes || '',
      });
    }
  }, [fullDeal, form]);

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({
        id: deal.id,
        title: values.title,
        value: values.value,
        stage: values.stage as DealStage,
        next_action: values.next_action || null,
        next_action_date: values.next_action_date || null,
        proposal_url: values.proposal_url || null,
        notes: values.notes || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  };

  const handleArchive = async () => {
    if (!deal) return;
    await archiveDeal.mutateAsync(deal.id);
    setShowArchiveConfirm(false);
    onOpenChange(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const displayDeal = fullDeal || deal;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{displayDeal?.title}</DialogTitle>
              {displayDeal && (
                <Badge className="mt-1">{STAGE_LABELS[displayDeal.stage]}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchiveConfirm(true)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-48" />
            </div>
          ) : isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Value ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STAGE_ORDER.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {STAGE_LABELS[stage]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="next_action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Action</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Follow up call" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="next_action_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="proposal_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposal URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateDeal.isPending}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              {/* Deal Value & Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deal Value</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(Number(displayDeal?.value || 0))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-lg font-medium text-foreground">
                      {displayDeal?.created_at
                        ? format(new Date(displayDeal.created_at), 'MMM d, yyyy')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Linked Lead Info */}
              {displayDeal?.leads && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Linked Lead
                    </h4>
                    <div className="grid gap-2 text-sm">
                      <p className="font-medium">{displayDeal.leads.business_name}</p>
                      {displayDeal.leads.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {displayDeal.leads.email}
                        </div>
                      )}
                      {displayDeal.leads.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {displayDeal.leads.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Next Action */}
              {(displayDeal?.next_action || displayDeal?.next_action_date) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Next Action
                    </h4>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="font-medium">{displayDeal.next_action || 'No action set'}</p>
                      {displayDeal.next_action_date && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {format(new Date(displayDeal.next_action_date), 'MMMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Proposal Link */}
              {displayDeal?.proposal_url && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Proposal</h4>
                    <a
                      href={displayDeal.proposal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      View Proposal
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </>
              )}

              {/* Notes */}
              {displayDeal?.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {displayDeal.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Stage History Timeline */}
              {history && history.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Stage History</h4>
                    <div className="relative pl-4 border-l-2 border-border space-y-4">
                      {history.map((entry, index) => (
                        <div key={entry.id} className="relative">
                          <div className="absolute -left-[21px] h-3 w-3 rounded-full bg-primary border-2 border-background" />
                          <div className="ml-2">
                            <p className="font-medium text-sm">{STAGE_LABELS[entry.stage]}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(entry.entered_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this deal? It will be removed from the pipeline but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
