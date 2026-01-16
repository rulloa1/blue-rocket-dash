import { Bell, Mail, MessageSquare } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';

export function NotificationsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const handleToggle = (key: string, value: boolean) => {
    updateSettings.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </h3>
            <p className="text-sm text-muted-foreground">
              Receive email alerts for important events
            </p>
          </div>
          <Switch
            checked={settings?.email_notifications ?? true}
            onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
          />
        </div>

        <div className="space-y-4 pl-4 border-l-2 border-border">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">New Lead</Label>
              <p className="text-sm text-muted-foreground">
                When a new lead is created via webhook or manually
              </p>
            </div>
            <Switch
              checked={settings?.notify_new_lead ?? true}
              onCheckedChange={(checked) => handleToggle('notify_new_lead', checked)}
              disabled={!settings?.email_notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Lead Status Change</Label>
              <p className="text-sm text-muted-foreground">
                When a lead's status is updated
              </p>
            </div>
            <Switch
              checked={settings?.notify_lead_status_change ?? true}
              onCheckedChange={(checked) => handleToggle('notify_lead_status_change', checked)}
              disabled={!settings?.email_notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Proposal Viewed</Label>
              <p className="text-sm text-muted-foreground">
                When a client views your proposal
              </p>
            </div>
            <Switch
              checked={settings?.notify_proposal_viewed ?? true}
              onCheckedChange={(checked) => handleToggle('notify_proposal_viewed', checked)}
              disabled={!settings?.email_notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Proposal Signed</Label>
              <p className="text-sm text-muted-foreground">
                When a client signs your proposal
              </p>
            </div>
            <Switch
              checked={settings?.notify_proposal_signed ?? true}
              onCheckedChange={(checked) => handleToggle('notify_proposal_signed', checked)}
              disabled={!settings?.email_notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Deal Stage Change</Label>
              <p className="text-sm text-muted-foreground">
                When a deal moves to a new pipeline stage
              </p>
            </div>
            <Switch
              checked={settings?.notify_deal_stage_change ?? true}
              onCheckedChange={(checked) => handleToggle('notify_deal_stage_change', checked)}
              disabled={!settings?.email_notifications}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Third-party Integrations (Placeholder) */}
      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Other Channels
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Receive notifications via other platforms
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg border border-dashed border-border text-center">
            <div className="h-12 w-12 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </div>
            <p className="font-medium mb-1">Telegram</p>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>

          <div className="p-4 rounded-lg border border-dashed border-border text-center">
            <div className="h-12 w-12 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
            </div>
            <p className="font-medium mb-1">Slack</p>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
