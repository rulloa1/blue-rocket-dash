import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type EmailTemplate = Tables<'email_templates'>;

export function useTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['email-templates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!user,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; subject: string; body: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: template, error } = await supabase
        .from('email_templates')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create template: ' + error.message);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & TablesUpdate<'email_templates'>) => {
      const { data: template, error } = await supabase
        .from('email_templates')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update template: ' + error.message);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete template: ' + error.message);
    },
  });
}
