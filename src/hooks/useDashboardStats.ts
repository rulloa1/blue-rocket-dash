import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PipelineStage {
  stage: string;
  label: string;
  count: number;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  proposalsSent: number;
  activeClients: number;
  pipelineStages: PipelineStage[];
}

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  contract_signed: 'Contract Signed',
  onboarding: 'Onboarding',
  active_client: 'Active Client',
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [leadsResult, qualifiedResult, proposalsResult, clientsResult, dealsResult] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'qualified'),
        supabase.from('proposals').select('id', { count: 'exact', head: true }).neq('status', 'draft'),
        supabase.from('deals').select('id', { count: 'exact', head: true }).eq('stage', 'active_client'),
        supabase.from('deals').select('stage'),
      ]);

      // Count deals by stage
      const stageCounts: Record<string, number> = {};
      (dealsResult.data || []).forEach((deal) => {
        stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1;
      });

      const pipelineStages: PipelineStage[] = Object.keys(STAGE_LABELS).map((stage) => ({
        stage,
        label: STAGE_LABELS[stage],
        count: stageCounts[stage] || 0,
      }));

      return {
        totalLeads: leadsResult.count ?? 0,
        qualifiedLeads: qualifiedResult.count ?? 0,
        proposalsSent: proposalsResult.count ?? 0,
        activeClients: clientsResult.count ?? 0,
        pipelineStages,
      };
    },
  });
}
    },
  });
}
