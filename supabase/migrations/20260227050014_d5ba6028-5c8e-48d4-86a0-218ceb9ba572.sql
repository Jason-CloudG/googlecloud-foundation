
-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  contact_person TEXT,
  email TEXT,
  org_id TEXT,
  billing_account TEXT,
  environments TEXT[] DEFAULT '{}',
  network_model TEXT,
  iam_model TEXT,
  cis_level TEXT,
  regions TEXT[] DEFAULT '{}',
  budget_threshold NUMERIC,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Admin access policy (service role can do everything, anon can read/update for admin dashboard)
CREATE POLICY "Allow full access for authenticated users"
ON public.submissions FOR ALL
USING (true)
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
