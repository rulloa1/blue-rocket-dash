-- Add source field to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- Add comment for documentation
COMMENT ON COLUMN public.leads.source IS 'Lead source: manual, webhook, import';