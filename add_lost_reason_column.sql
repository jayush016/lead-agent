-- Migration: Add lost_reason column to leads table

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Update existing lost leads with random reasons for demo data
UPDATE leads 
SET lost_reason = CASE floor(random() * 4)::int
    WHEN 0 THEN 'Price'
    WHEN 1 THEN 'Location'
    WHEN 2 THEN 'Budget'
    ELSE 'Competitor'
END
WHERE stage = 'lost' OR stage = 'Lost';
