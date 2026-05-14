// Anthropic SDK client — model: claude-sonnet-4-20250514
// Install: npm install @anthropic-ai/sdk

export function createAnthropicClient() {
  // TODO: implement after installing @anthropic-ai/sdk
  throw new Error("Anthropic client not yet configured");
}

export const TV_TOKEN_COSTS = {
  CREATE_CAMPAIGN: 25,
  AI_STRATEGY: 10,
  CONTENT_IDEA: 5,
  AUTOMATION_SENT: 2,
  ANALYTICS_REPORT: 10,
} as const;

export type TVTokenAction = keyof typeof TV_TOKEN_COSTS;
