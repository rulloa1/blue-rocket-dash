-- Add Airtable settings to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS airtable_api_key TEXT,
ADD COLUMN IF NOT EXISTS airtable_base_id TEXT,
ADD COLUMN IF NOT EXISTS airtable_table_name TEXT;
