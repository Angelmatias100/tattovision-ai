import Anthropic from '@anthropic-ai/sdk'

export const AI_MODEL   = 'claude-sonnet-4-20250514'
export const MAX_TOKENS = 2048

export const TV_TOKEN_COSTS = {
  CREATE_CAMPAIGN:   25,
  AI_STRATEGY:       10,
  CONTENT_IDEA:       5,
  AUTOMATION_SENT:    2,
  ANALYTICS_REPORT:  10,
} as const

export type TVTokenAction = keyof typeof TV_TOKEN_COSTS

/**
 * Returns an Anthropic client initialised with the server-side API key.
 * Only call this from Server Components or Route Handlers — never in browser code.
 */
export function createAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}
