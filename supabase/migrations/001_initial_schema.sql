-- ================================================================
-- TattooVision AI — Initial Schema
-- Migration: 001_initial_schema.sql
-- ================================================================
-- Auth strategy: Clerk JWT → Supabase RLS
--   auth.jwt() ->> 'sub'  resolves the Clerk user_id on every request
-- ================================================================

SET search_path = public;

-- uuid-ossp not needed — gen_random_uuid() is built-in since Postgres 13

-- ================================================================
-- HELPERS
-- ================================================================

-- Auto-bump updated_at on any UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Extract Clerk user_id from the request JWT (sub claim)
CREATE OR REPLACE FUNCTION clerk_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(auth.jwt() ->> 'sub', '')
$$;

-- ================================================================
-- TABLE 1 · BUSINESSES
-- ================================================================
CREATE TABLE IF NOT EXISTS businesses (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              TEXT        NOT NULL,                 -- Clerk user_id
  name                 TEXT        NOT NULL,
  city                 TEXT,
  country              TEXT,
  styles               TEXT[]      NOT NULL DEFAULT '{}',
  artists_count        INT         NOT NULL DEFAULT 1,
  avg_ticket           NUMERIC(10,2),
  monthly_goal         NUMERIC(10,2),
  instagram_url        TEXT,
  meta_account_id      TEXT,
  meta_access_token    TEXT,                                 -- encrypted at rest via Vault in prod
  plan                 TEXT        NOT NULL DEFAULT 'free'
                         CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  tv_tokens_balance    INT         NOT NULL DEFAULT 0,
  tv_tokens_reset_date DATE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One business per Clerk user
CREATE UNIQUE INDEX IF NOT EXISTS businesses_user_id_uidx ON businesses (user_id);

CREATE OR REPLACE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- TABLE 2 · ARTISTS
-- ================================================================
CREATE TABLE IF NOT EXISTS artists (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  styles      TEXT[]      NOT NULL DEFAULT '{}',
  instagram   TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS artists_business_id_idx ON artists (business_id);

CREATE OR REPLACE TRIGGER trg_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- TABLE 3 · CAMPAIGNS
-- (declared before leads so leads.campaign_id FK resolves)
-- ================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  objective        TEXT,
  status           TEXT        NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  meta_campaign_id TEXT,
  meta_adset_id    TEXT,
  meta_ad_id       TEXT,
  budget_daily     NUMERIC(10,2),
  budget_total     NUMERIC(10,2),
  copy_headline    TEXT,
  copy_body        TEXT,
  copy_cta         TEXT,
  leads_count      INT         NOT NULL DEFAULT 0,
  spend            NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date       DATE,
  end_date         DATE,
  ai_strategy      JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campaigns_business_id_idx ON campaigns (business_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx       ON campaigns (status);

CREATE OR REPLACE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- TABLE 4 · LEADS
-- ================================================================
CREATE TABLE IF NOT EXISTS leads (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    UUID        NOT NULL REFERENCES businesses  (id) ON DELETE CASCADE,
  artist_id      UUID                 REFERENCES artists     (id) ON DELETE SET NULL,
  campaign_id    UUID                 REFERENCES campaigns   (id) ON DELETE SET NULL,
  name           TEXT        NOT NULL,
  phone          TEXT,
  email          TEXT,
  instagram      TEXT,
  source         TEXT        NOT NULL DEFAULT 'manual'
                   CHECK (source IN (
                     'manual', 'instagram', 'facebook_ad',
                     'referral', 'walk_in', 'website', 'other'
                   )),
  status         TEXT        NOT NULL DEFAULT 'new'
                   CHECK (status IN (
                     'new', 'contacted', 'quoted',
                     'booked', 'completed', 'lost', 'cold'
                   )),
  style_interest TEXT[]      NOT NULL DEFAULT '{}',
  body_part      TEXT,
  budget_min     NUMERIC(10,2),
  budget_max     NUMERIC(10,2),
  reference_url  TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_business_id_idx ON leads (business_id);
CREATE INDEX IF NOT EXISTS leads_artist_id_idx   ON leads (artist_id);
CREATE INDEX IF NOT EXISTS leads_campaign_id_idx ON leads (campaign_id);
CREATE INDEX IF NOT EXISTS leads_status_idx      ON leads (status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx  ON leads (created_at DESC);

CREATE OR REPLACE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- TABLE 5 · APPOINTMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    UUID        NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
  lead_id        UUID                 REFERENCES leads      (id) ON DELETE SET NULL,
  artist_id      UUID                 REFERENCES artists    (id) ON DELETE SET NULL,
  date           DATE        NOT NULL,
  time_start     TIME,
  time_end       TIME,
  status         TEXT        NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN (
                     'scheduled', 'confirmed', 'completed',
                     'cancelled', 'no_show'
                   )),
  deposit_paid   BOOLEAN     NOT NULL DEFAULT FALSE,
  deposit_amount NUMERIC(10,2),
  total_amount   NUMERIC(10,2),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_business_id_idx ON appointments (business_id);
CREATE INDEX IF NOT EXISTS appointments_lead_id_idx     ON appointments (lead_id);
CREATE INDEX IF NOT EXISTS appointments_artist_id_idx   ON appointments (artist_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx        ON appointments (date);

CREATE OR REPLACE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- TABLE 6 · CONTENT PIECES
-- ================================================================
CREATE TABLE IF NOT EXISTS content_pieces (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
  type         TEXT        NOT NULL DEFAULT 'post'
                 CHECK (type IN (
                   'post', 'reel', 'story', 'carousel',
                   'blog', 'email', 'ad_copy'
                 )),
  format       TEXT,
  title        TEXT,
  body         TEXT,
  status       TEXT        NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  publish_date DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_pieces_business_id_idx ON content_pieces (business_id);
CREATE INDEX IF NOT EXISTS content_pieces_status_idx      ON content_pieces (status);
CREATE INDEX IF NOT EXISTS content_pieces_publish_date_idx ON content_pieces (publish_date);

CREATE OR REPLACE TRIGGER trg_content_pieces_updated_at
  BEFORE UPDATE ON content_pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- TABLE 7 · AUTOMATION LOGS
-- ================================================================
CREATE TABLE IF NOT EXISTS automation_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
  lead_id     UUID                 REFERENCES leads      (id) ON DELETE SET NULL,
  type        TEXT        NOT NULL,                          -- e.g. 'welcome_message', 'quote_follow_up'
  channel     TEXT        NOT NULL
                CHECK (channel IN (
                  'whatsapp', 'email', 'instagram_dm', 'sms', 'internal'
                )),
  status      TEXT        NOT NULL DEFAULT 'sent'
                CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS automation_logs_business_id_idx ON automation_logs (business_id);
CREATE INDEX IF NOT EXISTS automation_logs_lead_id_idx     ON automation_logs (lead_id);
CREATE INDEX IF NOT EXISTS automation_logs_type_idx        ON automation_logs (type);

CREATE OR REPLACE TRIGGER trg_automation_logs_updated_at
  BEFORE UPDATE ON automation_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- TABLE 8 · TOKEN USAGE  (append-only ledger, no updated_at)
-- ================================================================
CREATE TABLE IF NOT EXISTS token_usage (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses (id) ON DELETE CASCADE,
  action_type TEXT        NOT NULL,                          -- e.g. 'generate_caption', 'ai_strategy'
  tokens_used INT         NOT NULL DEFAULT 0,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS token_usage_business_id_idx  ON token_usage (business_id);
CREATE INDEX IF NOT EXISTS token_usage_action_type_idx  ON token_usage (action_type);
CREATE INDEX IF NOT EXISTS token_usage_created_at_idx   ON token_usage (created_at DESC);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE businesses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns       ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces  ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage     ENABLE ROW LEVEL SECURITY;

-- ── businesses ───────────────────────────────────────────────────
CREATE POLICY "businesses: owner full access"
  ON businesses FOR ALL
  USING     (user_id = clerk_user_id())
  WITH CHECK (user_id = clerk_user_id());

-- ── artists ──────────────────────────────────────────────────────
CREATE POLICY "artists: owner full access"
  ON artists FOR ALL
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

-- ── campaigns ────────────────────────────────────────────────────
CREATE POLICY "campaigns: owner full access"
  ON campaigns FOR ALL
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

-- ── leads ────────────────────────────────────────────────────────
CREATE POLICY "leads: owner full access"
  ON leads FOR ALL
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

-- ── appointments ─────────────────────────────────────────────────
CREATE POLICY "appointments: owner full access"
  ON appointments FOR ALL
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

-- ── content_pieces ───────────────────────────────────────────────
CREATE POLICY "content_pieces: owner full access"
  ON content_pieces FOR ALL
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

-- ── automation_logs ──────────────────────────────────────────────
CREATE POLICY "automation_logs: owner full access"
  ON automation_logs FOR ALL
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

-- ── token_usage ──────────────────────────────────────────────────
CREATE POLICY "token_usage: owner full access"
  ON token_usage FOR ALL
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

-- ================================================================
-- ONBOARDING RPC
-- Called from POST /api/onboarding after Clerk sign-up completes.
-- Uses SECURITY DEFINER so it can INSERT even before the user's
-- JWT is attached (the route uses the service-role key).
-- ================================================================
CREATE OR REPLACE FUNCTION create_business_for_user(
  p_user_id       TEXT,
  p_name          TEXT,
  p_city          TEXT          DEFAULT NULL,
  p_country       TEXT          DEFAULT NULL,
  p_styles        TEXT[]        DEFAULT '{}',
  p_artists_count INT           DEFAULT 1,
  p_avg_ticket    NUMERIC       DEFAULT NULL,
  p_monthly_goal  NUMERIC       DEFAULT NULL,
  p_instagram_url TEXT          DEFAULT NULL
)
RETURNS businesses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business businesses;
BEGIN
  INSERT INTO businesses (
    user_id, name, city, country, styles,
    artists_count, avg_ticket, monthly_goal,
    instagram_url, plan,
    tv_tokens_balance, tv_tokens_reset_date
  ) VALUES (
    p_user_id, p_name, p_city, p_country, p_styles,
    p_artists_count, p_avg_ticket, p_monthly_goal,
    p_instagram_url, 'free',
    500,
    (date_trunc('month', NOW()) + INTERVAL '1 month')::DATE
  )
  ON CONFLICT (user_id) DO UPDATE
    SET name          = EXCLUDED.name,
        city          = EXCLUDED.city,
        country       = EXCLUDED.country,
        styles        = EXCLUDED.styles,
        artists_count = EXCLUDED.artists_count,
        avg_ticket    = EXCLUDED.avg_ticket,
        monthly_goal  = EXCLUDED.monthly_goal,
        instagram_url = EXCLUDED.instagram_url,
        updated_at    = NOW()
  RETURNING * INTO v_business;

  RETURN v_business;
END;
$$;

-- ================================================================
-- TOKEN HELPER
-- Deducts tokens from the business balance and logs the usage
-- atomically. Returns FALSE if balance is insufficient.
-- ================================================================
CREATE OR REPLACE FUNCTION spend_tv_tokens(
  p_business_id UUID,
  p_action_type TEXT,
  p_tokens      INT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INT;
BEGIN
  SELECT tv_tokens_balance INTO v_balance
    FROM businesses
   WHERE id = p_business_id
   FOR UPDATE;

  IF v_balance < p_tokens THEN
    RETURN FALSE;
  END IF;

  UPDATE businesses
     SET tv_tokens_balance = tv_tokens_balance - p_tokens,
         updated_at        = NOW()
   WHERE id = p_business_id;

  INSERT INTO token_usage (business_id, action_type, tokens_used, description)
  VALUES (p_business_id, p_action_type, p_tokens, p_description);

  RETURN TRUE;
END;
$$;

-- ================================================================
-- MONTHLY TOKEN RESET
-- Run via pg_cron or a scheduled Supabase Edge Function.
-- Resets tv_tokens_balance to plan limits on the 1st of each month.
-- ================================================================
CREATE OR REPLACE FUNCTION reset_monthly_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE businesses
     SET tv_tokens_balance    = CASE plan
                                  WHEN 'free'    THEN 500
                                  WHEN 'starter' THEN 2000
                                  WHEN 'pro'     THEN 8000
                                  WHEN 'agency'  THEN 30000
                                  ELSE 500
                                END,
         tv_tokens_reset_date = (date_trunc('month', NOW()) + INTERVAL '1 month')::DATE,
         updated_at           = NOW()
   WHERE tv_tokens_reset_date <= CURRENT_DATE;
END;
$$;
