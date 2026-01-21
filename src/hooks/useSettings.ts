import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserSettings {
  id: string;
  user_id: string;
  company_name: string | null;
  company_logo_url: string | null;
  contact_email: string | null;
  business_address: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_password: string | null;
  smtp_from_email: string | null;
  email_signature: string | null;
  notify_new_lead: boolean;
  notify_proposal_viewed: boolean;
  notify_proposal_signed: boolean;
  notify_lead_status_change: boolean;
  notify_deal_stage_change: boolean;
  email_notifications: boolean;
  inbound_webhook_token: string;
  airtable_api_key: string | null;
  airtable_base_id: string | null;
  airtable_table_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  trigger_event: string;
  is_active: boolean;
  last_triggered_at: string | null;
  last_status_code: number | null;
  created_at: string;
  updated_at: string;
}

export interface TeamInvite {
  id: string;
  invited_by: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  owner_id: string;
  member_id: string;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
}

export function useSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      // Try to get existing settings
      let { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      // If no settings exist, create them
      if (!data && !error) {
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({ user_id: user!.id })
          .select()
          .single();

        if (createError) throw createError;
        data = newSettings;
      }

      if (error) throw error;
      return data as UserSettings;
    },
    enabled: !!user,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const { data: settings, error } = await supabase
        .from('user_settings')
        .update(data)
        .eq('user_id', user!.id)
        .select()
        .single();

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save settings: ' + error.message);
    },
  });
}

export function useWebhooks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['webhooks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Webhook[];
    },
    enabled: !!user,
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; url: string; trigger_event: string }) => {
      const { data: webhook, error } = await supabase
        .from('webhooks')
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create webhook: ' + error.message);
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Webhook>) => {
      const { data: webhook, error } = await supabase
        .from('webhooks')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update webhook: ' + error.message);
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('webhooks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete webhook: ' + error.message);
    },
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          data: { message: 'This is a test webhook from RoysCompany' },
        }),
      });

      return { status: response.status, ok: response.ok };
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(`Webhook test successful (${result.status})`);
      } else {
        toast.warning(`Webhook responded with status ${result.status}`);
      }
    },
    onError: (error) => {
      toast.error('Webhook test failed: ' + error.message);
    },
  });
}

export function useTeamInvites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-invites', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamInvite[];
    },
    enabled: !!user,
  });
}

export function useCreateTeamInvite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { email: string; role: 'admin' | 'member' | 'viewer' }) => {
      const { data: invite, error } = await supabase
        .from('team_invites')
        .insert({ ...data, invited_by: user!.id })
        .select()
        .single();

      if (error) throw error;
      return invite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      toast.success('Invite sent successfully');
    },
    onError: (error) => {
      toast.error('Failed to send invite: ' + error.message);
    },
  });
}

export function useDeleteTeamInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_invites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      toast.success('Invite cancelled');
    },
    onError: (error) => {
      toast.error('Failed to cancel invite: ' + error.message);
    },
  });
}

export function useTeamMembers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!user,
  });
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'admin' | 'member' | 'viewer' }) => {
      const { data, error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update role: ' + error.message);
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member removed');
    },
    onError: (error) => {
      toast.error('Failed to remove team member: ' + error.message);
    },
  });
}
