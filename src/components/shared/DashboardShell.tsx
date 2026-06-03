"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, LayoutDashboard, Users, Calendar, Megaphone } from "lucide-react";
import Sidebar from "./Sidebar";

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm",       label: "CRM",       icon: Users            },
  { href: "/agenda",    label: "Agenda",     icon: Calendar         },
  { href: "/campanas",  label: "Campañas",   icon: Megaphone        },
] as const;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  function close() { setSidebarOpen(false); }

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar — always visible on desktop, slide-in drawer on mobile */}
      <Sidebar open={sidebarOpen} onClose={close} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-20 flex items-center px-4 gap-3 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <Image src="/logo.jpeg" alt="TattooVision AI" width={120} height={35} className="object-contain h-auto" />
      </header>

      {/* Page content — offset for mobile top bar and bottom nav */}
      <div className="flex-1 md:ml-60 min-h-screen overflow-auto pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </div>

      {/* Bottom navigation — mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-20 flex items-stretch md:hidden"
        aria-label="Navegación principal"
      >
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-secondary/60 transition-colors"
            >
              <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-bold leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-secondary/60 transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] font-bold leading-none text-muted-foreground">Más</span>
        </button>
      </nav>

    </div>
  );
}
