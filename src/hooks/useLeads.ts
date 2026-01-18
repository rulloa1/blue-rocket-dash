import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];
type LeadUpdate = Database['public']['Tables']['leads']['Update'];
type LeadNote = Database['public']['Tables']['lead_notes']['Row'];
type LeadActivity = Database['public']['Tables']['lead_activities']['Row'];

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'not_interested';

export interface LeadFilters {
  search: string;
  status: LeadStatus | 'all';
  industry: string;
  dateRange: { from: Date | null; to: Date | null };
}

export function useLeads(filters: LeadFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }

      if (filters.search) {
        query = query.or(
          `business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });

  // Real-time Subscription
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

export function useLead(id: string | null) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Lead | null;
    },
    enabled: !!id,
  });
}

export function useLeadNotes(leadId: string | null) {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadNote[];
    },
    enabled: !!leadId,
  });
}

export function useLeadActivities(leadId: string | null) {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadActivity[];
    },
    enabled: !!leadId,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: Omit<LeadInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leads')
        .insert({ ...lead, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('lead_activities').insert({
        lead_id: data.id,
        user_id: user.id,
        action: 'created',
        description: `Lead "${lead.business_name}" was created`,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating lead', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: LeadUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      if (user) {
        await supabase.from('lead_activities').insert({
          lead_id: id,
          user_id: user.id,
          action: 'updated',
          description: `Lead was updated`,
        });
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', data.id] });
      toast({ title: 'Lead updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating lead', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting lead', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteLeads() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('leads').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Leads deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting leads', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateLeadsStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: LeadStatus }) => {
      const { error } = await supabase.from('leads').update({ status }).in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Status updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAddLeadNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ leadId, content }: { leadId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lead_notes')
        .insert({ lead_id: leadId, user_id: user.id, content })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        user_id: user.id,
        action: 'note_added',
        description: 'A note was added',
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', data.lead_id] });
      toast({ title: 'Note added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding note', description: error.message, variant: 'destructive' });
    },
  });
}
