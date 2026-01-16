import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLeads } from '@/hooks/useLeads';
import { useDeals } from '@/hooks/useDeals';
import type { ProposalFormData } from '../CreateProposalWizard';

interface StepClientDetailsProps {
  formData: ProposalFormData;
  onUpdate: (data: Partial<ProposalFormData>) => void;
}

const defaultFilters = {
  search: '',
  status: 'all' as const,
  industry: '',
  dateRange: { from: null, to: null },
};

export function StepClientDetails({ formData, onUpdate }: StepClientDetailsProps) {
  const { data: leads } = useLeads(defaultFilters);
  const { data: deals } = useDeals();

  const handleLeadSelect = (leadId: string) => {
    if (leadId === 'none') {
      onUpdate({ lead_id: undefined, deal_id: undefined });
      return;
    }

    const lead = leads?.find((l) => l.id === leadId);
    if (lead) {
      onUpdate({
        lead_id: lead.id,
        client_name: lead.business_name,
        client_email: lead.email || '',
        client_business: lead.business_name,
      });
    }
  };

  const handleDealSelect = (dealId: string) => {
    if (dealId === 'none') {
      onUpdate({ deal_id: undefined });
      return;
    }

    const deal = deals?.find((d) => d.id === dealId);
    if (deal) {
      onUpdate({
        deal_id: deal.id,
        lead_id: deal.lead_id || undefined,
        client_name: deal.title,
        client_business: deal.leads?.business_name || '',
        client_email: deal.leads?.email || '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Client Details</h2>
        <p className="text-muted-foreground">
          Select an existing lead/deal or enter new client information
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Link to Lead (Optional)</Label>
          <Select onValueChange={handleLeadSelect} value={formData.lead_id || 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Select a lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No lead</SelectItem>
              {leads?.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Link to Deal (Optional)</Label>
          <Select onValueChange={handleDealSelect} value={formData.deal_id || 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Select a deal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No deal</SelectItem>
              {deals?.map((deal) => (
                <SelectItem key={deal.id} value={deal.id}>
                  {deal.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_name">Contact Name *</Label>
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => onUpdate({ client_name: e.target.value })}
            placeholder="John Smith"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_email">Email</Label>
          <Input
            id="client_email"
            type="email"
            value={formData.client_email}
            onChange={(e) => onUpdate({ client_email: e.target.value })}
            placeholder="john@company.com"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="client_business">Business Name</Label>
          <Input
            id="client_business"
            value={formData.client_business}
            onChange={(e) => onUpdate({ client_business: e.target.value })}
            placeholder="Acme Corporation"
          />
        </div>
      </div>
    </div>
  );
}
