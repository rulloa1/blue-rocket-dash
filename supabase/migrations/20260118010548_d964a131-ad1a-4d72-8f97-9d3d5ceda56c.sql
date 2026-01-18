-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view websites by public_id" ON public.generated_websites;

-- Create a more restrictive policy that only allows public access when filtering by public_id
-- This prevents full table scans while still allowing public preview pages to work
CREATE POLICY "Public can view websites only by public_id"
ON public.generated_websites
FOR SELECT
USING (
  -- Users can always view their own websites
  auth.uid() = user_id
  OR
  -- Public access is only allowed when the query includes a specific public_id filter
  -- This relies on the RLS optimization that checks if the query filters on the column
  public_id IS NOT NULL
);

-- Actually, the above still allows full scans. We need a different approach.
-- Let's use a security definer function to control access

DROP POLICY IF EXISTS "Public can view websites only by public_id" ON public.generated_websites;

-- Create a function to get website by public_id (public access)
CREATE OR REPLACE FUNCTION public.get_website_by_public_id(p_public_id text)
RETURNS TABLE (
  id uuid,
  public_id text,
  business_name text,
  template_id text,
  html_content text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    public_id,
    business_name,
    template_id,
    html_content,
    created_at,
    updated_at
  FROM public.generated_websites
  WHERE generated_websites.public_id = p_public_id
  LIMIT 1;
$$;

-- Now update RLS to only allow owners to SELECT directly
-- Public access must go through the function
CREATE POLICY "Users can view their own websites directly"
ON public.generated_websites
FOR SELECT
USING (auth.uid() = user_id);