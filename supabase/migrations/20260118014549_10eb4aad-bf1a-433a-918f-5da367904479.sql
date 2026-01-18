-- Add activated_at column to track when a website was paid for and activated
ALTER TABLE public.generated_websites 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add stripe_session_id to track the payment
ALTER TABLE public.generated_websites 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT DEFAULT NULL;

-- Drop the old function
DROP FUNCTION IF EXISTS public.get_website_by_public_id(text);

-- Recreate with activated_at
CREATE FUNCTION public.get_website_by_public_id(p_public_id text)
 RETURNS TABLE(id uuid, public_id text, business_name text, template_id text, html_content text, created_at timestamp with time zone, updated_at timestamp with time zone, activated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    id,
    public_id,
    business_name,
    template_id,
    html_content,
    created_at,
    updated_at,
    activated_at
  FROM public.generated_websites
  WHERE generated_websites.public_id = p_public_id
  LIMIT 1;
$function$;