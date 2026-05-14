// Lemon Squeezy client — Merchant of Record for payments
// Install: npm install @lemonsqueezy/lemonsqueezy-js

export function createLemonSqueezyClient() {
  // TODO: implement after installing @lemonsqueezy/lemonsqueezy-js
  throw new Error("Lemon Squeezy client not yet configured");
}

export const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    priceUsd: 79,
    tokensPerMonth: 200,
    maxArtists: 1,
    extraTokenPrice: 9, // per 100 tokens
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceUsd: 179,
    tokensPerMonth: 600,
    maxArtists: 5,
    extraTokenPrice: 7,
  },
  agency: {
    id: "agency",
    name: "Agency",
    priceUsd: 349,
    tokensPerMonth: 2000,
    maxArtists: Infinity,
    extraTokenPrice: 5,
    tokenAccumulationMonths: 3,
  },
} as const;

export type PlanId = keyof typeof PLANS;
