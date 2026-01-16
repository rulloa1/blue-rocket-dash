import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Sequence = Tables<'sequences'>;
type SequenceStep = Tables<'sequence_steps'>;
type SequenceEnrollment = Tables<'sequence_enrollments'>;

export function useSequences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sequences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Sequence[];
    },
    enabled: !!user,
  });
}

export function useSequence(id: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sequence', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('sequences')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Sequence;
    },
    enabled: !!user && !!id,
  });
}

export function useSequenceSteps(sequenceId: string | null) {
  return useQuery({
    queryKey: ['sequence-steps', sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      const { data, error } = await supabase
        .from('sequence_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('step_order', { ascending: true });

      if (error) throw error;
      return data as SequenceStep[];
    },
    enabled: !!sequenceId,
  });
}

export function useSequenceEnrollments(sequenceId: string | null) {
  return useQuery({
    queryKey: ['sequence-enrollments', sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      const { data, error } = await supabase
        .from('sequence_enrollments')
        .select(`
          *,
          leads:lead_id (
            id,
            business_name,
            email,
            status
          )
        `)
        .eq('sequence_id', sequenceId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!sequenceId,
  });
}

export function useSequenceStats(sequenceId: string) {
  return useQuery({
    queryKey: ['sequence-stats', sequenceId],
    queryFn: async () => {
      // Get enrollment count
      const { count: enrollmentCount } = await supabase
        .from('sequence_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', sequenceId);

      // Get step count
      const { count: stepCount } = await supabase
        .from('sequence_steps')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', sequenceId);

      return {
        enrollmentCount: enrollmentCount || 0,
        stepCount: stepCount || 0,
        openRate: 0, // Would need tracking data
        replyRate: 0, // Would need tracking data
      };
    },
  });
}

export function useCreateSequence() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: sequence, error } = await supabase
        .from('sequences')
        .insert({
          name: data.name,
          description: data.description,
          user_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return sequence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast.success('Sequence created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create sequence: ' + error.message);
    },
  });
}

export function useUpdateSequence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & TablesUpdate<'sequences'>) => {
      const { data: sequence, error } = await supabase
        .from('sequences')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return sequence;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence', variables.id] });
      toast.success('Sequence updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update sequence: ' + error.message);
    },
  });
}

export function useDeleteSequence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sequences')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast.success('Sequence deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete sequence: ' + error.message);
    },
  });
}

export function useAddSequenceStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TablesInsert<'sequence_steps'>) => {
      const { data: step, error } = await supabase
        .from('sequence_steps')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return step;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sequence-steps', variables.sequence_id] });
      queryClient.invalidateQueries({ queryKey: ['sequence-stats', variables.sequence_id] });
      toast.success('Step added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add step: ' + error.message);
    },
  });
}

export function useUpdateSequenceStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sequenceId, ...data }: { id: string; sequenceId: string } & TablesUpdate<'sequence_steps'>) => {
      const { data: step, error } = await supabase
        .from('sequence_steps')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return step;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sequence-steps', variables.sequenceId] });
    },
    onError: (error) => {
      toast.error('Failed to update step: ' + error.message);
    },
  });
}

export function useDeleteSequenceStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sequenceId }: { id: string; sequenceId: string }) => {
      const { error } = await supabase
        .from('sequence_steps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sequence-steps', variables.sequenceId] });
      queryClient.invalidateQueries({ queryKey: ['sequence-stats', variables.sequenceId] });
      toast.success('Step deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete step: ' + error.message);
    },
  });
}

export function useEnrollLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ sequenceId, leadId }: { sequenceId: string; leadId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          lead_id: leadId,
          user_id: user.id,
          status: 'active',
          current_step: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sequence-enrollments', variables.sequenceId] });
      queryClient.invalidateQueries({ queryKey: ['sequence-stats', variables.sequenceId] });
      toast.success('Lead enrolled successfully');
    },
    onError: (error) => {
      toast.error('Failed to enroll lead: ' + error.message);
    },
  });
}
