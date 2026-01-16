import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type DealStage = 'lead' | 'proposal_sent' | 'negotiation' | 'contract_signed' | 'onboarding' | 'active_client';

export interface Deal {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  value: number;
  stage: DealStage;
  services: string[] | null;
  next_action: string | null;
  next_action_date: string | null;
  proposal_url: string | null;
  notes: string | null;
  stage_entered_at: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  leads?: {
    id: string;
    business_name: string;
    email: string | null;
    phone: string | null;
    industry: string | null;
  } | null;
}

export interface DealStageHistory {
  id: string;
  deal_id: string;
  stage: DealStage;
  entered_at: string;
  notes: string | null;
}

export const STAGE_ORDER: DealStage[] = [
  'lead',
  'proposal_sent',
  'negotiation',
  'contract_signed',
  'onboarding',
  'active_client',
];

export const STAGE_LABELS: Record<DealStage, string> = {
  lead: 'Lead',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  contract_signed: 'Contract Signed',
  onboarding: 'Onboarding',
  active_client: 'Active Client',
};

export function useDeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          leads:lead_id (
            id,
            business_name,
            email,
            phone,
            industry
          )
        `)
        .is('archived_at', null)
        .order('stage_entered_at', { ascending: true });

      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!user,
  });
}

export function useDeal(id: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          leads:lead_id (
            id,
            business_name,
            email,
            phone,
            industry,
            website
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Deal | null;
    },
    enabled: !!user && !!id,
  });
}

export function useDealHistory(dealId: string | null) {
  return useQuery({
    queryKey: ['deal-history', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from('deal_stage_history')
        .select('*')
        .eq('deal_id', dealId)
        .order('entered_at', { ascending: false });

      if (error) throw error;
      return data as DealStageHistory[];
    },
    enabled: !!dealId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      value: number;
      stage?: DealStage;
      lead_id?: string;
      services?: string[];
      next_action?: string;
      next_action_date?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: deal, error } = await supabase
        .from('deals')
        .insert({
          ...data,
          user_id: user.id,
          stage: data.stage || 'lead',
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial stage history
      await supabase.from('deal_stage_history').insert({
        deal_id: deal.id,
        stage: data.stage || 'lead',
      });

      return deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create deal: ' + error.message);
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Deal>) => {
      const { data: deal, error } = await supabase
        .from('deals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return deal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['deal-history', variables.id] });
    },
    onError: (error) => {
      toast.error('Failed to update deal: ' + error.message);
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: DealStage }) => {
      const { data: deal, error } = await supabase
        .from('deals')
        .update({ stage })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return deal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['deal-history', variables.id] });
    },
    onError: (error) => {
      toast.error('Failed to move deal: ' + error.message);
    },
  });
}

export function useArchiveDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal archived successfully');
    },
    onError: (error) => {
      toast.error('Failed to archive deal: ' + error.message);
    },
  });
}
