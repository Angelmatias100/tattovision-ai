/**
 * Meta Business SDK client
 *
 * Wraps facebook-nodejs-business-sdk (CJS, no bundled types).
 * All functions accept an `accessToken` so they can operate on a per-business
 * basis — the token stored in `businesses.meta_access_token` is passed in at
 * call time, rather than relying on a single global SDK init.
 *
 * Reference: https://developers.facebook.com/docs/marketing-api/reference
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MetaCampaignParams {
  adAccountId: string   // e.g. "act_123456789"
  name: string
  objective: string     // e.g. "OUTCOME_AWARENESS", "OUTCOME_LEADS"
  dailyBudget?: number  // in cents (e.g. 1000 = $10.00)
  specialAdCategories?: string[]
}

export interface MetaCampaign {
  id: string
  name: string
  status: 'PAUSED' | 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  objective: string
}

export interface MetaInsightsParams {
  campaignId: string
  datePreset?: string   // e.g. "last_7d", "last_30d", "this_month"
  fields?: string[]
}

export interface MetaInsightsRow {
  date_start:   string
  date_stop:    string
  impressions:  string
  reach:        string
  clicks:       string
  spend:        string
  cpm:          string
  cpc:          string
  ctr:          string
  [key: string]: string
}

// ── SDK bootstrap ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sdk = require('facebook-nodejs-business-sdk') as {
  FacebookAdsApi: {
    init: (token: string) => unknown
  }
  AdAccount: new (id: string) => {
    createCampaign: (
      fields: string[],
      params: Record<string, unknown>
    ) => Promise<{ id: string; name: string; status: string; objective: string }>
  }
  Campaign: {
    new (id: string): {
      getInsights: (
        fields: string[],
        params: Record<string, unknown>
      ) => Promise<MetaInsightsRow[]>
    }
  }
}

/**
 * Initialises the SDK with the given access token.
 * The SDK init is global but lightweight — safe to call once per request.
 */
function initSdk(accessToken: string) {
  sdk.FacebookAdsApi.init(accessToken)
  return sdk
}

// ── createCampaign ────────────────────────────────────────────────────────────

/**
 * Creates a new campaign in PAUSED state so it never spends money
 * until the user explicitly activates it in Meta Ads Manager.
 *
 * Returns the created campaign's id and summary fields.
 */
export async function createCampaign(
  accessToken: string,
  params: MetaCampaignParams
): Promise<MetaCampaign> {
  const { AdAccount } = initSdk(accessToken)

  const account = new AdAccount(params.adAccountId)

  const campaign = await account.createCampaign(
    ['id', 'name', 'status', 'objective'],
    {
      name:                  params.name,
      objective:             params.objective,
      status:                'PAUSED',        // always start paused
      special_ad_categories: params.specialAdCategories ?? [],
      ...(params.dailyBudget != null
        ? { daily_budget: String(params.dailyBudget) }
        : {}),
    }
  )

  return {
    id:        campaign.id,
    name:      campaign.name,
    status:    campaign.status as MetaCampaign['status'],
    objective: campaign.objective,
  }
}

// ── getCampaignInsights ───────────────────────────────────────────────────────

const DEFAULT_INSIGHT_FIELDS = [
  'date_start',
  'date_stop',
  'impressions',
  'reach',
  'clicks',
  'spend',
  'cpm',
  'cpc',
  'ctr',
]

/**
 * Fetches performance insights for a single campaign.
 * Returns an array of daily rows (one row per day, last 30 days by default).
 */
export async function getCampaignInsights(
  accessToken: string,
  params: MetaInsightsParams
): Promise<MetaInsightsRow[]> {
  const { Campaign } = initSdk(accessToken)

  const campaign = new Campaign(params.campaignId)

  const rows = await campaign.getInsights(
    params.fields ?? DEFAULT_INSIGHT_FIELDS,
    {
      date_preset:    params.datePreset ?? 'last_30d',
      time_increment: 1,   // one row per day
    }
  )

  return rows
}
