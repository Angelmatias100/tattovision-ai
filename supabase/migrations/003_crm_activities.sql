-- ================================================================
-- TattooVision AI — Migration 003: CRM Activities
-- ================================================================
-- Already applied in Supabase. Documented here for version control.
-- ================================================================

-- Align status values with UI (Spanish stage names)
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'nuevo';

ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN (
    'nuevo', 'respondido', 'consulta', 'presupuesto',
    'deposito', 'confirmado', 'realizado', 'reactivar'
  ));

-- Activity log: every note, call, and stage change
CREATE TABLE IF NOT EXISTS lead_activities (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID        NOT NULL REFERENCES leads(id)      ON DELETE CASCADE,
  business_id   UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL
    CHECK (type IN (
      'note', 'call', 'whatsapp', 'email',
      'instagram_dm', 'status_change', 'booking_created'
    )),
  content       TEXT,
  old_status    TEXT,
  new_status    TEXT,
  clerk_user_id TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_activities_lead_id_idx     ON lead_activities (lead_id);
CREATE INDEX IF NOT EXISTS lead_activities_business_id_idx ON lead_activities (business_id);
CREATE INDEX IF NOT EXISTS lead_activities_created_at_idx  ON lead_activities (created_at DESC);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_activities: owner full access"
  ON lead_activities FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = clerk_user_id()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = clerk_user_id()
    )
  );
