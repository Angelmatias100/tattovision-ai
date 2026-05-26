"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface PlanContextValue {
  plan: string;
  loading: boolean;
}

const PlanContext = createContext<PlanContextValue>({ plan: "starter", loading: true });

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState("starter");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data?.plan) setPlan(data.plan);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PlanContext.Provider value={{ plan, loading }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
