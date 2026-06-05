"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface PlanContextValue {
  plan: string;
  loading: boolean;
  tokensBalance: number;
  tokensLimit: number;
  tokensResetDate: string | null;
  bookingSlug: string | null;
}

const PlanContext = createContext<PlanContextValue>({
  plan: "starter",
  loading: true,
  tokensBalance: 0,
  tokensLimit: 200,
  tokensResetDate: null,
  bookingSlug: null,
});

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan,            setPlan]            = useState("starter");
  const [loading,         setLoading]         = useState(true);
  const [tokensBalance,   setTokensBalance]   = useState(0);
  const [tokensLimit,     setTokensLimit]     = useState(200);
  const [tokensResetDate, setTokensResetDate] = useState<string | null>(null);
  const [bookingSlug,     setBookingSlug]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setPlan(data?.plan ?? "free");
        if (data?.tv_tokens_balance != null) setTokensBalance(data.tv_tokens_balance);
        if (data?.tv_tokens_limit   != null) setTokensLimit(data.tv_tokens_limit);
        if (data?.tv_tokens_reset_date !== undefined) setTokensResetDate(data.tv_tokens_reset_date);
        if (data?.booking_slug !== undefined) setBookingSlug(data.booking_slug);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PlanContext.Provider value={{ plan, loading, tokensBalance, tokensLimit, tokensResetDate, bookingSlug }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
