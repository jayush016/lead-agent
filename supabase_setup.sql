-- Lead Agent Database Schema
-- Run this in Supabase SQL Editor

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  property TEXT,
  location TEXT,
  budget_min INTEGER DEFAULT 0,
  budget_max INTEGER DEFAULT 0,
  source TEXT,
  stage TEXT DEFAULT 'new',
  score INTEGER DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activities table (for lead timeline)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (but allow all for now - auth will be added later)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies to allow all operations (we'll tighten this when adding auth)
CREATE POLICY "Allow all leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- Index for common queries
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_location ON leads(location);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
