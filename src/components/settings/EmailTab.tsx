import { useState, useEffect } from 'react';
import { Mail, Send, Server, Lock, User, Shield, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
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

  const [isSaving, setIsSaving] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port?.toString() || '',
        smtp_username: settings.smtp_username || '',
        // Show placeholder for encrypted password, actual password never sent to client
        smtp_password: settings.smtp_password ? '••••••••' : '',
        smtp_from_email: settings.smtp_from_email || '',
        email_signature: settings.email_signature || '',
      });
      setPasswordChanged(false);
    }
  }, [settings]);

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, smtp_password: value });
    // Only mark as changed if user actually types something new
    if (value !== '••••••••') {
      setPasswordChanged(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let encryptedPassword: string | null = null;

      // Only encrypt if password was actually changed
      if (passwordChanged && formData.smtp_password && formData.smtp_password !== '••••••••') {
        // Encrypt the password before saving
        const { data, error } = await supabase.functions.invoke('encrypt-smtp-password', {
          body: {
            action: 'encrypt',
            password: formData.smtp_password,
          },
        });

        if (error) {
          console.error('Encryption error:', error);
          toast.error('Failed to encrypt password securely');
          return;
        }

        encryptedPassword = data.encrypted;
      }

      // Build update object
      const updateData: Record<string, string | number | null> = {
        smtp_host: formData.smtp_host || null,
        smtp_port: formData.smtp_port ? parseInt(formData.smtp_port) : null,
        smtp_username: formData.smtp_username || null,
        smtp_from_email: formData.smtp_from_email || null,
        email_signature: formData.email_signature || null,
      };

      // Only update password if it was changed
      if (passwordChanged) {
        updateData.smtp_password = encryptedPassword;
      }

      await updateSettings.mutateAsync(updateData);
      setPasswordChanged(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const handleTestEmail = async () => {
    const recipient = testEmail || formData.smtp_from_email || formData.smtp_username;
    if (!recipient) {
      toast.error('Please enter a recipient email or configure your From Email first');
      return;
    }
    if (!formData.smtp_host || !formData.smtp_username) {
      toast.error('Please save your SMTP settings first');
      return;
    }

    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { recipientEmail: recipient },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Test email sent to ${recipient}`);
    } catch (error: any) {
      console.error('Test email error:', error);
      toast.error(error.message || 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const hasEncryptedPassword = settings?.smtp_password?.startsWith('enc:');

  return (
    <div className="space-y-8">
      {/* SMTP Configuration */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-medium">SMTP Configuration</h3>
          {hasEncryptedPassword && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Encrypted
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Configure your email server for sending proposals and notifications.
          Passwords are encrypted with AES-256-GCM before storage.
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
              {passwordChanged && (
                <span className="ml-2 text-xs text-muted-foreground">(will be encrypted)</span>
              )}
            </Label>
            <Input
              id="smtp_password"
              type="password"
              value={formData.smtp_password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="••••••••"
              onFocus={(e) => {
                // Clear placeholder when focusing if it's the default
                if (e.target.value === '••••••••') {
                  setFormData({ ...formData, smtp_password: '' });
                  setPasswordChanged(true);
                }
              }}
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
          <Button onClick={handleSave} disabled={isSaving || updateSettings.isPending}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Encrypting & Saving...
              </>
            ) : (
              'Save Settings'
            )}
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

          <Button onClick={handleSave} disabled={isSaving || updateSettings.isPending}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Signature'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
