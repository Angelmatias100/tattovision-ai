import Sidebar from "@/components/shared/Sidebar";
import { PlanProvider } from "@/components/shared/PlanContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 ml-60 min-h-screen overflow-auto">{children}</div>
      </div>
    </PlanProvider>
  );
}
