import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RecentActivity {
  id: string;
  action: string;
  description: string | null;
  created_at: string;
  lead_id: string;
  lead_business_name: string;
}

export function useRecentActivities(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activities', limit],
    queryFn: async (): Promise<RecentActivity[]> => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select(`
          id,
          action,
          description,
          created_at,
          lead_id,
          leads!inner(business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((activity: any) => ({
        id: activity.id,
        action: activity.action,
        description: activity.description,
        created_at: activity.created_at,
        lead_id: activity.lead_id,
        lead_business_name: activity.leads?.business_name || 'Unknown',
      }));
    },
    enabled: !!user,
  });
}
