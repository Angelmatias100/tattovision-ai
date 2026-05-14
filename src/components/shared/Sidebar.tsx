"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  Sparkles,
  Bot,
  Settings,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/campanas", label: "Campañas", icon: Megaphone },
  { href: "/contenido", label: "Contenido", icon: Sparkles },
  { href: "/automatizaciones", label: "Automatizaciones", icon: Bot },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-card border-r border-border z-40 flex flex-col py-6">
      {/* Logo */}
      <div className="px-6 mb-10">
        <h1 className="font-playfair text-lg font-bold text-foreground uppercase tracking-wide leading-tight">
          TATTOOVISION AI
        </h1>
        <p className="font-mono text-[10px] text-muted-foreground opacity-60 tracking-widest mt-0.5">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors relative ${
                    active
                      ? "bg-primary/20 text-foreground font-bold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary before:rounded-r"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${active ? "text-primary" : ""}`}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom area */}
      <div className="px-4 mt-auto">
        {/* Upgrade CTA */}
        <button className="w-full py-2.5 px-4 mb-4 rounded-lg bg-primary text-white font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          Upgrade to PRO
        </button>

        {/* TV Tokens widget */}
        <div className="bg-[#1A0025] border border-primary/25 rounded-lg p-3.5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-foreground text-xs">⚡ TV Tokens</span>
            <span className="font-mono text-[10px] text-muted-foreground">147/200</span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: "73.5%" }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Renuevan en 12 días</p>
          <a
            href="#"
            className="text-[10px] text-muted-foreground font-bold hover:text-primary transition-colors"
          >
            [+ Comprar tokens]
          </a>
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
