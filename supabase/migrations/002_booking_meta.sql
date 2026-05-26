-- ================================================================
-- TattooVision AI — Migration 002
-- Adds booking_slug + Meta display columns
-- ================================================================

-- ── booking_slug on businesses ────────────────────────────────────
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS booking_slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS businesses_booking_slug_uidx
  ON businesses (booking_slug)
  WHERE booking_slug IS NOT NULL;

-- ── Meta OAuth display fields ─────────────────────────────────────
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS meta_user_name    TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS meta_account_name TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS meta_ad_accounts  JSONB;

-- ── Extend leads.source to include booking_page ───────────────────
-- Drops & re-adds the CHECK only if it exists (safe to run multiple times)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leads_source_check'
      AND conrelid = 'leads'::regclass
  ) THEN
    ALTER TABLE leads DROP CONSTRAINT leads_source_check;
    ALTER TABLE leads ADD CONSTRAINT leads_source_check
      CHECK (source IN (
        'manual','instagram','facebook_ad','referral',
        'walk_in','website','booking_page','other'
      ));
  END IF;
END;
$$;

-- ── Backfill slugs for existing businesses ────────────────────────
UPDATE businesses
SET booking_slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE booking_slug IS NULL
  AND name IS NOT NULL
  AND TRIM(name) <> '';
