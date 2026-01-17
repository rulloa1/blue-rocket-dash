import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  contract_signed: 'Contract Signed',
  onboarding: 'Onboarding',
  active_client: 'Active Client',
};

export default function Pipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFilter = searchParams.get('stage');

  const clearFilter = () => {
    searchParams.delete('stage');
    setSearchParams(searchParams);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize and manage your sales pipeline.
          </p>
        </div>

        {stageFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <Badge variant="secondary" className="gap-1">
              {STAGE_LABELS[stageFilter] || stageFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={clearFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            {stageFilter 
              ? `Showing deals in "${STAGE_LABELS[stageFilter] || stageFilter}" stage. Full pipeline view coming soon.`
              : 'Pipeline view coming soon.'}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
