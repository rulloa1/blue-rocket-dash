-- Enable RLS on tables if not already enabled
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policies for leads
-- We drop existing policies to ensure clean state (in case they exist with different names, this might fail, but it's a best effort)
-- Ideally, we use DO blocks, but simple DROP IF EXISTS is often supported.

DROP POLICY IF EXISTS "Allow authenticated users full access to leads" ON leads;
DROP POLICY IF EXISTS "Enable read access for all users" ON leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leads;

CREATE POLICY "Allow authenticated users full access to leads"
ON leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for proposals
DROP POLICY IF EXISTS "Allow authenticated users full access to proposals" ON proposals;

CREATE POLICY "Allow authenticated users full access to proposals"
ON proposals
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for deals
DROP POLICY IF EXISTS "Allow authenticated users full access to deals" ON deals;

CREATE POLICY "Allow authenticated users full access to deals"
ON deals
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
