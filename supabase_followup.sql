-- Follow-ups Migration
-- Run this in Supabase SQL Editor

-- Add follow_up_date column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_time TIME;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_note TEXT;

-- Index for quick follow-up queries
CREATE INDEX IF NOT EXISTS idx_leads_followup ON leads(follow_up_date);
