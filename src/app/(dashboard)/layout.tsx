import DashboardShell from "@/components/shared/DashboardShell";
import { PlanProvider } from "@/components/shared/PlanContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanProvider>
      <DashboardShell>{children}</DashboardShell>
    </PlanProvider>
  );
}
