"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  Sparkles,
  Bot,
  BotMessageSquare,
  Settings,
  Zap,
} from "lucide-react";
import { usePlan } from "@/components/shared/PlanContext";

const NAV_ITEMS = [
  { href: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { href: "/crm",             label: "CRM",             icon: Users           },
  { href: "/agenda",          label: "Agenda",          icon: Calendar        },
  { href: "/campanas",        label: "Campañas",        icon: Megaphone       },
  { href: "/contenido",       label: "Contenido",       icon: Sparkles        },
  { href: "/agente",          label: "Agente",          icon: BotMessageSquare},
  { href: "/automatizaciones",label: "Automatizaciones",icon: Bot             },
  { href: "/configuracion",   label: "Configuración",   icon: Settings        },
];

function daysUntilReset(resetDate: string | null): string {
  if (!resetDate) return "Renuevan mensualmente";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reset = new Date(resetDate);
  const diffDays = Math.ceil((reset.getTime() - today.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Renuevan pronto";
  if (diffDays === 1) return "Renuevan mañana";
  return `Renuevan en ${diffDays} días`;
}

export default function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { plan, tokensBalance, tokensLimit, tokensResetDate, loading } = usePlan();

  const tokensPct = tokensLimit > 0
    ? Math.min(100, Math.round((tokensBalance / tokensLimit) * 100))
    : 0;

  const renewText = daysUntilReset(tokensResetDate);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-60 bg-card border-r border-border z-40 flex flex-col py-6 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="px-6 mb-10">
        <Image src="/logo.jpeg" alt="TattooVision AI" width={140} height={40} className="object-contain h-auto" />
        <p className="font-mono text-[10px] text-muted-foreground opacity-60 tracking-widest mt-1">
          v2.4
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => onClose?.()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors relative ${
                    active
                      ? "bg-primary/20 text-foreground font-bold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary before:rounded-r"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-primary" : ""}`} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom area */}
      <div className="px-4 mt-auto">
        {/* Upgrade CTA — only show for free/starter */}
        {(!plan || plan === "free") && (
          <Link href="/configuracion#plan">
            <button className="w-full py-2.5 px-4 mb-4 rounded-lg bg-primary text-white font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Mejorar a PRO
            </button>
          </Link>
        )}

        {/* TV Tokens widget */}
        <div className="bg-[#1A0025] border border-primary/25 rounded-lg p-3.5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-foreground text-xs">⚡ TV Tokens</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {loading ? "—/—" : `${tokensBalance}/${tokensLimit}`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: loading ? "0%" : `${tokensPct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{renewText}</p>
          <Link
            href="/configuracion#plan"
            className="text-[10px] text-muted-foreground font-bold hover:text-primary transition-colors"
          >
            [+ Comprar tokens]
          </Link>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 px-2 py-2.5 border-t border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            ML
          </div>
          <span className="text-sm font-medium text-foreground truncate">
            Matías López
          </span>
        </div>
      </div>
    </aside>
  );
}
