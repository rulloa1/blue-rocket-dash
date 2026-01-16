import { useState } from 'react';
import { Building2, Upload, Mail, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';

export function ProfileTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    business_address: '',
  });

  // Sync form data when settings load
  useState(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        contact_email: settings.contact_email || '',
        business_address: settings.business_address || '',
      });
    }
  });

  const handleSave = () => {
    updateSettings.mutate({
      company_name: formData.company_name || null,
      contact_email: formData.contact_email || null,
      business_address: formData.business_address || null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Company Profile</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Update your company information that appears on proposals and communications
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-3">
        <Label>Company Logo</Label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
            {settings?.company_logo_url ? (
              <img
                src={settings.company_logo_url}
                alt="Company logo"
                className="h-full w-full object-contain rounded-lg"
              />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Upload Logo
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 2MB. Recommended: 200x200px
            </p>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="company_name">
          <Building2 className="inline h-4 w-4 mr-2" />
          Company Name
        </Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          placeholder="RoysCompany"
        />
      </div>

      {/* Contact Email */}
      <div className="space-y-2">
        <Label htmlFor="contact_email">
          <Mail className="inline h-4 w-4 mr-2" />
          Contact Email
        </Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          placeholder="contact@company.com"
        />
      </div>

      {/* Business Address */}
      <div className="space-y-2">
        <Label htmlFor="business_address">
          <MapPin className="inline h-4 w-4 mr-2" />
          Business Address
        </Label>
        <Textarea
          id="business_address"
          value={formData.business_address}
          onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
          placeholder="123 Main St, City, State 12345"
          rows={3}
        />
      </div>

      <Button onClick={handleSave} disabled={updateSettings.isPending}>
        Save Changes
      </Button>
    </div>
  );
}
