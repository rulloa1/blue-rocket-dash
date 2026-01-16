-- Create user_settings table for profile and preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT,
  company_logo_url TEXT,
  contact_email TEXT,
  business_address TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  smtp_from_email TEXT,
  email_signature TEXT,
  notify_new_lead BOOLEAN DEFAULT true,
  notify_proposal_viewed BOOLEAN DEFAULT true,
  notify_proposal_signed BOOLEAN DEFAULT true,
  notify_lead_status_change BOOLEAN DEFAULT true,
  notify_deal_stage_change BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  inbound_webhook_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outbound webhooks table
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('new_lead', 'status_change', 'proposal_sent', 'proposal_viewed', 'proposal_signed', 'deal_stage_change')),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team invites table
CREATE TABLE public.team_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invited_by UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team members table (for accepted invites)
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  member_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id, member_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for webhooks
CREATE POLICY "Users can view their own webhooks" ON public.webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own webhooks" ON public.webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own webhooks" ON public.webhooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own webhooks" ON public.webhooks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for team_invites
CREATE POLICY "Users can view invites they created" ON public.team_invites FOR SELECT USING (auth.uid() = invited_by);
CREATE POLICY "Users can create invites" ON public.team_invites FOR INSERT WITH CHECK (auth.uid() = invited_by);
CREATE POLICY "Users can delete their invites" ON public.team_invites FOR DELETE USING (auth.uid() = invited_by);

-- RLS Policies for team_members
CREATE POLICY "Owners can view their team" ON public.team_members FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can add team members" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update team members" ON public.team_members FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can remove team members" ON public.team_members FOR DELETE USING (auth.uid() = owner_id);

-- Add triggers
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create settings on first access
CREATE OR REPLACE FUNCTION public.ensure_user_settings()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  settings_id UUID;
BEGIN
  SELECT id INTO settings_id FROM public.user_settings WHERE user_id = auth.uid();
  
  IF settings_id IS NULL THEN
    INSERT INTO public.user_settings (user_id)
    VALUES (auth.uid())
    RETURNING id INTO settings_id;
  END IF;
  
  RETURN settings_id;
END;
$$;