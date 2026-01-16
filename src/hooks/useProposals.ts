import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'expired';

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order?: number;
}

export interface ProposalTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  default_services: LineItem[];
  default_terms: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  user_id: string;
  deal_id: string | null;
  lead_id: string | null;
  template_id: string | null;
  status: ProposalStatus;
  client_name: string;
  client_email: string | null;
  client_business: string | null;
  subtotal: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number;
  total: number;
  delivery_date: string | null;
  terms: string | null;
  notes: string | null;
  public_id: string;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  template_name?: string;
  proposal_line_items?: LineItem[];
}

// Helper to convert Json to LineItem[]
function parseLineItems(json: Json | null): LineItem[] {
  if (!json || !Array.isArray(json)) return [];
  return json.map((item: Json) => {
    const obj = item as Record<string, Json>;
    return {
      description: String(obj.description || ''),
      quantity: Number(obj.quantity || 1),
      unit_price: Number(obj.unit_price || 0),
      total: Number(obj.quantity || 1) * Number(obj.unit_price || 0),
      sort_order: Number(obj.sort_order || 0),
    };
  });
}

export function useProposals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['proposals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          proposal_templates (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((p) => ({
        ...p,
        template_name: p.proposal_templates?.name || null,
      })) as Proposal[];
    },
    enabled: !!user,
  });
}

export function useProposal(id: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Get proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (proposalError) throw proposalError;
      if (!proposal) return null;

      // Get line items
      const { data: lineItems } = await supabase
        .from('proposal_line_items')
        .select('*')
        .eq('proposal_id', id)
        .order('sort_order', { ascending: true });

      return {
        ...proposal,
        proposal_line_items: lineItems || [],
      } as Proposal;
    },
    enabled: !!user && !!id,
  });
}

export function useProposalTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['proposal-templates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map((t) => ({
        ...t,
        default_services: parseLineItems(t.default_services),
      })) as ProposalTemplate[];
    },
    enabled: !!user,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      template_id?: string;
      deal_id?: string;
      lead_id?: string;
      client_name: string;
      client_email?: string;
      client_business?: string;
      subtotal: number;
      discount_type?: 'percentage' | 'fixed';
      discount_value?: number;
      total: number;
      delivery_date?: string;
      terms?: string;
      notes?: string;
      line_items: LineItem[];
      status?: ProposalStatus;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { line_items, ...proposalData } = data;

      // Create proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          ...proposalData,
          user_id: user.id,
          status: data.status || 'draft',
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Create line items
      if (line_items.length > 0) {
        const lineItemsData = line_items.map((item, index) => ({
          proposal_id: proposal.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('proposal_line_items')
          .insert(lineItemsData);

        if (itemsError) throw itemsError;
      }

      return proposal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create proposal: ' + error.message);
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, line_items, template_name, proposal_line_items, ...data }: { id: string; line_items?: LineItem[] } & Partial<Proposal>) => {
      const { data: proposal, error } = await supabase
        .from('proposals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update line items if provided
      if (line_items) {
        // Delete existing items
        await supabase.from('proposal_line_items').delete().eq('proposal_id', id);

        // Insert new items
        if (line_items.length > 0) {
          const lineItemsData = line_items.map((item, index) => ({
            proposal_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.quantity * item.unit_price,
            sort_order: index,
          }));

          await supabase.from('proposal_line_items').insert(lineItemsData);
        }
      }

      return proposal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', variables.id] });
      toast.success('Proposal updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update proposal: ' + error.message);
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete proposal: ' + error.message);
    },
  });
}

export function useSendProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('proposals')
        .update({
          status: 'sent' as ProposalStatus,
          sent_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', id] });
      toast.success('Proposal sent successfully');
    },
    onError: (error) => {
      toast.error('Failed to send proposal: ' + error.message);
    },
  });
}
