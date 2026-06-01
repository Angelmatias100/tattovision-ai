-- ================================================================
-- TattooVision AI — Migration 004: Lead CRM Fields
-- ================================================================
-- Already applied in Supabase. Documented here for version control.
-- ================================================================

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS tags              TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS priority          TEXT    NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS leads_priority_idx          ON leads (priority);
CREATE INDEX IF NOT EXISTS leads_last_contacted_at_idx ON leads (last_contacted_at DESC);
