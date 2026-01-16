-- Create proposal status enum if not exists
DO $$ BEGIN
  CREATE TYPE public.proposal_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create proposal templates table if not exists
CREATE TABLE IF NOT EXISTS public.proposal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  default_services JSONB DEFAULT '[]'::jsonb,
  default_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proposals table if not exists
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.proposal_templates(id) ON DELETE SET NULL,
  status proposal_status NOT NULL DEFAULT 'draft',
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_business TEXT,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  delivery_date DATE,
  terms TEXT,
  notes TEXT,
  public_id TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proposal line items table if not exists
CREATE TABLE IF NOT EXISTS public.proposal_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_line_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can view templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.proposal_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.proposal_templates;

CREATE POLICY "Users can view templates" ON public.proposal_templates FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create their own templates" ON public.proposal_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.proposal_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.proposal_templates FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can create their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can delete their own proposals" ON public.proposals;

CREATE POLICY "Users can view their own proposals" ON public.proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own proposals" ON public.proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own proposals" ON public.proposals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own proposals" ON public.proposals FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their line items" ON public.proposal_line_items;
DROP POLICY IF EXISTS "Users can create line items" ON public.proposal_line_items;
DROP POLICY IF EXISTS "Users can update their line items" ON public.proposal_line_items;
DROP POLICY IF EXISTS "Users can delete their line items" ON public.proposal_line_items;

CREATE POLICY "Users can view their line items" ON public.proposal_line_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.proposals WHERE proposals.id = proposal_line_items.proposal_id AND proposals.user_id = auth.uid()));
CREATE POLICY "Users can create line items" ON public.proposal_line_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals WHERE proposals.id = proposal_line_items.proposal_id AND proposals.user_id = auth.uid()));
CREATE POLICY "Users can update their line items" ON public.proposal_line_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.proposals WHERE proposals.id = proposal_line_items.proposal_id AND proposals.user_id = auth.uid()));
CREATE POLICY "Users can delete their line items" ON public.proposal_line_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.proposals WHERE proposals.id = proposal_line_items.proposal_id AND proposals.user_id = auth.uid()));

-- Add update triggers if they don't exist
DROP TRIGGER IF EXISTS update_proposal_templates_updated_at ON public.proposal_templates;
CREATE TRIGGER update_proposal_templates_updated_at BEFORE UPDATE ON public.proposal_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON public.proposals;
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert system templates with NULL user_id
INSERT INTO public.proposal_templates (user_id, name, description, default_services, default_terms)
VALUES 
(NULL, 'Website Package', 'Complete website design and development package',
 '[{"description": "Custom Website Design", "quantity": 1, "unit_price": 3500}, {"description": "Responsive Development", "quantity": 1, "unit_price": 2500}, {"description": "SEO Optimization", "quantity": 1, "unit_price": 1000}, {"description": "Content Management System", "quantity": 1, "unit_price": 1500}]'::jsonb,
 'Payment terms: 50% upfront, 50% upon completion. Project timeline begins after initial payment. Revisions limited to 3 rounds per phase.'),
(NULL, 'Automation Package', 'Business process automation and AI integration',
 '[{"description": "Process Analysis & Design", "quantity": 1, "unit_price": 2000}, {"description": "Workflow Automation Setup", "quantity": 1, "unit_price": 4000}, {"description": "AI Integration", "quantity": 1, "unit_price": 3000}, {"description": "Training & Documentation", "quantity": 1, "unit_price": 1000}]'::jsonb,
 'Payment terms: 50% upfront, 50% upon completion. Includes 30 days of post-launch support.'),
(NULL, 'Voice Agent Package', 'AI-powered voice assistant for customer service',
 '[{"description": "Voice Agent Development", "quantity": 1, "unit_price": 5000}, {"description": "Custom Training Data", "quantity": 1, "unit_price": 2000}, {"description": "Phone System Integration", "quantity": 1, "unit_price": 1500}, {"description": "Monthly Maintenance", "quantity": 12, "unit_price": 500}]'::jsonb,
 'Payment terms: 50% upfront, 50% upon go-live. Monthly maintenance billed quarterly in advance.')
ON CONFLICT DO NOTHING;