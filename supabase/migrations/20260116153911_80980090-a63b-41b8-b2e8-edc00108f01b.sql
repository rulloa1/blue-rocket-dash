-- Create deal stage enum
CREATE TYPE public.deal_stage AS ENUM ('lead', 'proposal_sent', 'negotiation', 'contract_signed', 'onboarding', 'active_client');

-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stage deal_stage NOT NULL DEFAULT 'lead',
  services TEXT[],
  next_action TEXT,
  next_action_date DATE,
  proposal_url TEXT,
  notes TEXT,
  stage_entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Create deal_stage_history table for timeline
CREATE TABLE public.deal_stage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  stage deal_stage NOT NULL,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_stage_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals
CREATE POLICY "Users can view their own deals" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deals" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deals" ON public.deals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for deal_stage_history
CREATE POLICY "Users can view their deal history" ON public.deal_stage_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.deals WHERE deals.id = deal_stage_history.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can create deal history" ON public.deal_stage_history FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.deals WHERE deals.id = deal_stage_history.deal_id AND deals.user_id = auth.uid()));

-- Add update trigger
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update stage_entered_at and create history on stage change
CREATE OR REPLACE FUNCTION public.handle_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_entered_at = now();
    INSERT INTO public.deal_stage_history (deal_id, stage, entered_at)
    VALUES (NEW.id, NEW.stage, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for stage changes
CREATE TRIGGER handle_deal_stage_change
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deal_stage_change();