import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  proposalsSent: number;
  activeClients: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [leadsResult, qualifiedResult, proposalsResult, clientsResult] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'qualified'),
        supabase.from('proposals').select('id', { count: 'exact', head: true }).neq('status', 'draft'),
        supabase.from('deals').select('id', { count: 'exact', head: true }).eq('stage', 'active_client'),
      ]);

      return {
        totalLeads: leadsResult.count ?? 0,
        qualifiedLeads: qualifiedResult.count ?? 0,
        proposalsSent: proposalsResult.count ?? 0,
        activeClients: clientsResult.count ?? 0,
      };
    },
  });
}
