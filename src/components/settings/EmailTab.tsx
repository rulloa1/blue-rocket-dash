import { useState, useEffect } from 'react';
import { Mail, Send, Server, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export function EmailTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    email_signature: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port?.toString() || '',
        smtp_username: settings.smtp_username || '',
        smtp_password: settings.smtp_password || '',
        smtp_from_email: settings.smtp_from_email || '',
        email_signature: settings.email_signature || '',
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      smtp_host: formData.smtp_host || null,
      smtp_port: formData.smtp_port ? parseInt(formData.smtp_port) : null,
      smtp_username: formData.smtp_username || null,
      smtp_password: formData.smtp_password || null,
      smtp_from_email: formData.smtp_from_email || null,
      email_signature: formData.email_signature || null,
    });
  };

  const handleTestEmail = () => {
    // This would send a test email via an edge function
    toast.info('Test email functionality coming soon');
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
      {/* SMTP Configuration */}
      <div>
        <h3 className="text-lg font-medium mb-2">SMTP Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure your email server for sending proposals and notifications
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">
              <Server className="inline h-4 w-4 mr-2" />
              SMTP Host
            </Label>
            <Input
              id="smtp_host"
              value={formData.smtp_host}
              onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
              placeholder="smtp.gmail.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_port">Port</Label>
            <Input
              id="smtp_port"
              type="number"
              value={formData.smtp_port}
              onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
              placeholder="587"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_username">
              <User className="inline h-4 w-4 mr-2" />
              Username
            </Label>
            <Input
              id="smtp_username"
              value={formData.smtp_username}
              onChange={(e) => setFormData({ ...formData, smtp_username: e.target.value })}
              placeholder="your-email@gmail.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_password">
              <Lock className="inline h-4 w-4 mr-2" />
              Password
            </Label>
            <Input
              id="smtp_password"
              type="password"
              value={formData.smtp_password}
              onChange={(e) => setFormData({ ...formData, smtp_password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="smtp_from_email">
              <Mail className="inline h-4 w-4 mr-2" />
              From Email
            </Label>
            <Input
              id="smtp_from_email"
              type="email"
              value={formData.smtp_from_email}
              onChange={(e) => setFormData({ ...formData, smtp_from_email: e.target.value })}
              placeholder="noreply@yourcompany.com"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleTestEmail}>
            <Send className="mr-2 h-4 w-4" />
            Send Test Email
          </Button>
        </div>
      </div>

      <Separator />

      {/* Email Signature */}
      <div>
        <h3 className="text-lg font-medium mb-2">Email Signature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This signature will be added to the bottom of all outgoing emails
        </p>

        <div className="space-y-4">
          <Textarea
            value={formData.email_signature}
            onChange={(e) => setFormData({ ...formData, email_signature: e.target.value })}
            placeholder={`Best regards,
John Smith
RoysCompany
AI Automation Agency
contact@royscompany.com`}
            rows={6}
          />

          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
}
