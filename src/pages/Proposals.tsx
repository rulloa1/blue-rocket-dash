import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ProposalsTable } from '@/components/proposals/ProposalsTable';
import { CreateProposalWizard } from '@/components/proposals/CreateProposalWizard';
import { ProposalDetailModal } from '@/components/proposals/ProposalDetailModal';
import type { Proposal } from '@/hooks/useProposals';

export default function Proposals() {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  if (showWizard) {
    return (
      <CreateProposalWizard
        onClose={() => setShowWizard(false)}
        onComplete={() => setShowWizard(false)}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Proposals
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage client proposals
            </p>
          </div>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Proposal
          </Button>
        </div>

        <ProposalsTable onViewProposal={setSelectedProposal} />

        <ProposalDetailModal
          proposal={selectedProposal}
          open={!!selectedProposal}
          onOpenChange={(open) => !open && setSelectedProposal(null)}
        />
      </div>
    </DashboardLayout>
  );
}
