import { useState } from 'react';
import { format } from 'date-fns';
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  Send,
  FileText,
  Loader2,
  Clock,
  MessageSquare,
  Edit,
  UserPlus,
  LayoutTemplate,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LeadStatusBadge } from './LeadStatusBadge';
import { WebsiteTemplateModal } from './WebsiteTemplateModal';
import { AIScoreIndicator } from './AIScoreIndicator';
import {
  useLead,
  useLeadNotes,
  useLeadActivities,
  useAddLeadNote,
  LeadStatus,
} from '@/hooks/useLeads';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface LeadDrawerProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const activityIcons: Record<string, React.ElementType> = {
  created: UserPlus,
  updated: Edit,
  note_added: MessageSquare,
  email_sent: Mail,
  status_changed: Clock,
};

export function LeadDrawer({ leadId, open, onOpenChange }: LeadDrawerProps) {
  const { data: lead, isLoading: leadLoading } = useLead(leadId);
  const { data: notes = [], isLoading: notesLoading } = useLeadNotes(leadId);
  const { data: activities = [], isLoading: activitiesLoading } = useLeadActivities(leadId);
  const addNote = useAddLeadNote();
  const [newNote, setNewNote] = useState('');
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isSendingN8n, setIsSendingN8n] = useState(false);
  const queryClient = useQueryClient();

  const handleAddNote = async () => {
    if (!leadId || !newNote.trim()) return;
    await addNote.mutateAsync({ leadId, content: newNote.trim() });
    setNewNote('');
  };

  const handleRefreshScore = async () => {
    if (!leadId) return;
    setIsScoring(true);
    try {
        const { data, error } = await supabase.functions.invoke('qualify-lead', {
            body: { leadId }
        });

        if (error) throw error;

        if (data.success) {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
    } catch (error) {
        console.error(error);
        toast.error('Failed to update score');
    } finally {
        setIsScoring(false);
    }
  };

  const handleSendToN8n = async () => {
    if (!lead) return;
    setIsSendingN8n(true);
    try {
        const { data, error } = await supabase.functions.invoke('n8n-proxy', {
            body: { 
                action: 'process_lead',
                payload: lead
            }
        });

        if (error) throw error;

        toast.success(data.message || 'Sent to n8n successfully');
    } catch (error) {
        console.error(error);
        toast.error('Failed to send to n8n: ' + (error as any).message);
    } finally {
        setIsSendingN8n(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg border-l border-border bg-card p-0">
        <SheetHeader className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Lead Details</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          {leadLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : lead ? (
            <div className="space-y-6 p-4">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {lead.business_name}
                    </h2>
                    {lead.industry && (
                      <p className="text-sm text-muted-foreground">{lead.industry}</p>
                    )}
                  </div>
                  <LeadStatusBadge status={lead.status as LeadStatus} />
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                <div className="space-y-2">
                  {lead.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-foreground hover:text-primary"
                      >
                        {lead.email}
                      </a>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{lead.phone}</span>
                    </div>
                  )}
                  {lead.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {lead.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Added {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Initial Notes */}
              {lead.notes && (
                <>
                  <Separator className="bg-border" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Initial Notes</h3>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                </>
              )}

              <Separator className="bg-border" />

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={handleSendToN8n}
                    disabled={isSendingN8n}
                  >
                    {isSendingN8n ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    Send to n8n
                  </Button>
                  <Button variant="secondary" className="flex-1 gap-2">
                    <FileText className="h-4 w-4" />
                    Create Proposal
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowWebsiteModal(true)}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Create Website
                </Button>
              </div>

              <Separator className="bg-border" />

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <div className="space-y-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="bg-muted/50 border-border resize-none"
                    rows={3}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={addNote.isPending || !newNote.trim()}
                  >
                    {addNote.isPending ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : null}
                    Add Note
                  </Button>
                </div>

                {notesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border border-border bg-muted/30 p-3"
                      >
                        <p className="text-sm text-foreground">{note.content}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                )}
              </div>

              <Separator className="bg-border" />

              {/* Activity Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Activity Timeline</h3>
                {activitiesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => {
                      const Icon = activityIcons[activity.action] || Clock;
                      return (
                        <div key={activity.id} className="flex gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">Lead not found</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>

      {lead && (
        <WebsiteTemplateModal
          open={showWebsiteModal}
          onOpenChange={setShowWebsiteModal}
          lead={{
            business_name: lead.business_name,
            industry: lead.industry,
            email: lead.email,
            phone: lead.phone,
            website: lead.website,
          }}
        />
      )}
    </Sheet>
  );
}
