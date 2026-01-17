-- Create table for storing generated websites
CREATE TABLE public.generated_websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  template_id TEXT NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_websites ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own websites
CREATE POLICY "Users can view their own websites"
  ON public.generated_websites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create websites"
  ON public.generated_websites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites"
  ON public.generated_websites
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites"
  ON public.generated_websites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public policy for viewing by public_id (for shared links)
CREATE POLICY "Anyone can view websites by public_id"
  ON public.generated_websites
  FOR SELECT
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_generated_websites_updated_at
  BEFORE UPDATE ON public.generated_websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for public_id lookups
CREATE INDEX idx_generated_websites_public_id ON public.generated_websites(public_id);