import { useState, useEffect } from 'react';
import { Copy, Plus, Trash2, Play, ExternalLink, Webhook, Table, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  useSettings,
  useUpdateSettings,
  useWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useSyncAirtable,
} from '@/hooks/useSettings';
import { toast } from 'sonner';

const TRIGGER_EVENTS = [
  { value: 'new_lead', label: 'New Lead Created' },
  { value: 'status_change', label: 'Lead Status Change' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'proposal_viewed', label: 'Proposal Viewed' },
  { value: 'proposal_signed', label: 'Proposal Signed' },
  { value: 'deal_stage_change', label: 'Deal Stage Change' },
];

export function IntegrationsTab() {
  const { data: settings, isLoading: loadingSettings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { data: webhooks, isLoading: loadingWebhooks } = useWebhooks();
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();
  const syncAirtable = useSyncAirtable();

  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    trigger_event: 'new_lead',
  });

  const [airtableConfig, setAirtableConfig] = useState({
    apiKey: '',
    baseId: '',
    tableName: '',
  });

  useEffect(() => {
    if (settings) {
      setAirtableConfig({
        apiKey: settings.airtable_api_key || '',
        baseId: settings.airtable_base_id || '',
        tableName: settings.airtable_table_name || '',
      });
    }
  }, [settings]);

  const webhookUrl = settings?.inbound_webhook_token
    ? `${window.location.origin}/api/webhook/inbound`
    : '';

  const handleCopyToken = () => {
    if (settings?.inbound_webhook_token) {
      navigator.clipboard.writeText(settings.inbound_webhook_token);
      toast.success('Token copied to clipboard');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL copied to clipboard');
  };

  const handleAddWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error('Name and URL are required');
      return;
    }

    await createWebhook.mutateAsync(newWebhook);
    setShowAddWebhook(false);
    setNewWebhook({ name: '', url: '', trigger_event: 'new_lead' });
  };

  const handleDeleteWebhook = () => {
    if (deleteId) {
      deleteWebhook.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleSaveAirtable = () => {
    updateSettings.mutate({
      airtable_api_key: airtableConfig.apiKey || null,
      airtable_base_id: airtableConfig.baseId || null,
      airtable_table_name: airtableConfig.tableName || null,
    });
  };

  if (loadingSettings || loadingWebhooks) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Airtable Integration */}
      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Table className="h-5 w-5" />
          Airtable Integration
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Airtable base to sync leads
        </p>

        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="space-y-2">
            <Label>Personal Access Token</Label>
            <Input
              type="password"
              value={airtableConfig.apiKey}
              onChange={(e) => setAirtableConfig({ ...airtableConfig, apiKey: e.target.value })}
              placeholder="pat..."
            />
            <p className="text-xs text-muted-foreground">
              Create a token with <code>data.records:read</code> and <code>data.records:write</code> scopes
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Base ID</Label>
              <Input
                value={airtableConfig.baseId}
                onChange={(e) => setAirtableConfig({ ...airtableConfig, baseId: e.target.value })}
                placeholder="app..."
              />
            </div>

            <div className="space-y-2">
              <Label>Table Name</Label>
              <Input
                value={airtableConfig.tableName}
                onChange={(e) => setAirtableConfig({ ...airtableConfig, tableName: e.target.value })}
                placeholder="Leads"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => syncAirtable.mutate()} 
              disabled={syncAirtable.isPending || !settings?.airtable_api_key}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncAirtable.isPending ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
            <Button onClick={handleSaveAirtable} disabled={updateSettings.isPending}>
              Save Configuration
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Inbound Webhook */}
      <div>
        <h3 className="text-lg font-medium mb-2">Inbound Webhook</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use this webhook to receive leads from Make.com, n8n, Zapier, or any HTTP client
        </p>

        <div className="rounded-lg border border-border p-4 space-y-4 bg-card">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Authentication Token</Label>
            <div className="flex gap-2">
              <Input
                value={settings?.inbound_webhook_token || ''}
                readOnly
                type="password"
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={handleCopyToken}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Include this token in the <code className="bg-muted px-1 rounded">x-webhook-token</code> header
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Example Request</Label>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`POST ${webhookUrl}
Content-Type: application/json
x-webhook-token: YOUR_TOKEN

{
  "business_name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "industry": "Technology",
  "website": "https://acme.com",
  "notes": "Interested in automation"
}`}
            </pre>
          </div>
        </div>
      </div>

      <Separator />

      {/* Outbound Webhooks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Outbound Webhooks</h3>
            <p className="text-sm text-muted-foreground">
              Notify external services when events occur
            </p>
          </div>
          <Button onClick={() => setShowAddWebhook(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        </div>

        {webhooks?.length ? (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Webhook className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{webhook.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {TRIGGER_EVENTS.find((e) => e.value === webhook.trigger_event)?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {webhook.url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={webhook.is_active}
                    onCheckedChange={(checked) =>
                      updateWebhook.mutate({ id: webhook.id, is_active: checked })
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testWebhook.mutate(webhook.url)}
                    disabled={testWebhook.isPending}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(webhook.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No outbound webhooks configured</p>
          </div>
        )}
      </div>

      <Separator />

      {/* API Keys (Future) */}
      <div>
        <h3 className="text-lg font-medium mb-2">API Keys</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Generate API keys for programmatic access
        </p>
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">API key management coming soon</p>
        </div>
      </div>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Outbound Webhook</DialogTitle>
            <DialogDescription>
              Configure a webhook to notify external services when events occur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="My Webhook"
              />
            </div>

            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://example.com/webhook"
              />
            </div>

            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <Select
                value={newWebhook.trigger_event}
                onValueChange={(value) => setNewWebhook({ ...newWebhook, trigger_event: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map((event) => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWebhook(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWebhook} disabled={createWebhook.isPending}>
              Add Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWebhook} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
