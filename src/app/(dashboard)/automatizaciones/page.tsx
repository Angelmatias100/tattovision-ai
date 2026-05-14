"use client";

import { useState } from "react";
import {
  MessageCircle, Clock, CreditCard, CalendarCheck, Star, RefreshCw,
  CheckCircle, XCircle, Zap, ToggleLeft, ToggleRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Automation {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  trigger: string;
  tokens: number;
  active: boolean;
}

interface LogRow {
  id: string;
  date: string;
  lead: string;
  type: string;
  channel: string;
  status: "enviado" | "fallido";
}

// ── Static data ───────────────────────────────────────────────────────────────

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: "a1",
    icon: MessageCircle,
    name: "Bienvenida al nuevo lead",
    description: "Envía un mensaje personalizado cuando un lead entra al CRM por primera vez.",
    trigger: "Cuando un lead llega a columna NUEVO",
    tokens: 2,
    active: true,
  },
  {
    id: "a2",
    icon: Clock,
    name: "Recordatorio de consulta pendiente",
    description: "Recuerda al lead que tiene una consulta sin confirmar tras 48 h de silencio.",
    trigger: "48 h sin respuesta en columna CONSULTA",
    tokens: 2,
    active: true,
  },
  {
    id: "a3",
    icon: CreditCard,
    name: "Recordatorio de depósito",
    description: "Solicita el depósito cuando el lead acordó precio pero no ha pagado en 24 h.",
    trigger: "24 h en columna PRESUPUESTO sin depósito",
    tokens: 2,
    active: true,
  },
  {
    id: "a4",
    icon: CalendarCheck,
    name: "Confirmación de cita 24h antes",
    description: "Confirma la cita automáticamente el día anterior con hora y dirección del estudio.",
    trigger: "24 h antes de la cita agendada",
    tokens: 2,
    active: true,
  },
  {
    id: "a5",
    icon: Star,
    name: "Mensaje post sesión",
    description: "Agradece al cliente, solicita reseña y comparte instrucciones de cuidado.",
    trigger: "2 h después de la cita marcada como REALIZADO",
    tokens: 2,
    active: false,
  },
  {
    id: "a6",
    icon: RefreshCw,
    name: "Reactivación de clientes inactivos",
    description: "Reactiva leads sin actividad en 30 días con una oferta de diseño personalizado.",
    trigger: "30 días sin actividad en el CRM",
    tokens: 2,
    active: false,
  },
];

const LOG_ROWS: LogRow[] = [
  { id: "l1",  date: "Hoy 09:14",    lead: "Sofía Martínez",  type: "Bienvenida",         channel: "Instagram DM", status: "enviado" },
  { id: "l2",  date: "Hoy 08:50",    lead: "Tomás Ruiz",      type: "Confirmación cita",  channel: "WhatsApp",     status: "enviado" },
  { id: "l3",  date: "Hoy 07:32",    lead: "Valentina Gómez", type: "Bienvenida",         channel: "Instagram DM", status: "enviado" },
  { id: "l4",  date: "Ayer 21:05",   lead: "Nicolás Herrera", type: "Dep. recordatorio",  channel: "WhatsApp",     status: "fallido" },
  { id: "l5",  date: "Ayer 18:20",   lead: "Camila Torres",   type: "Confirmación cita",  channel: "WhatsApp",     status: "enviado" },
  { id: "l6",  date: "Ayer 15:47",   lead: "Martín López",    type: "Consulta pendiente", channel: "Instagram DM", status: "enviado" },
  { id: "l7",  date: "Ayer 12:30",   lead: "Lucía Fernández", type: "Bienvenida",         channel: "Instagram DM", status: "enviado" },
  { id: "l8",  date: "25 Abr 10:15", lead: "Diego Sánchez",   type: "Dep. recordatorio",  channel: "WhatsApp",     status: "fallido" },
  { id: "l9",  date: "24 Abr 16:00", lead: "Renata Pérez",    type: "Bienvenida",         channel: "Instagram DM", status: "enviado" },
  { id: "l10", date: "23 Abr 09:45", lead: "Facundo Díaz",    type: "Consulta pendiente", channel: "Instagram DM", status: "enviado" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className="flex items-center gap-1.5 transition-colors"
    >
      {active ? (
        <ToggleRight className="w-9 h-9 text-primary drop-shadow-[0_0_6px_rgba(139,0,255,0.6)]" />
      ) : (
        <ToggleLeft className="w-9 h-9 text-muted-foreground" />
      )}
      <span className={`text-xs font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
        {active ? "Activa" : "Inactiva"}
      </span>
    </button>
  );
}

function AutomationCard({
  auto,
  onToggle,
}: {
  auto: Automation;
  onToggle: (id: string) => void;
}) {
  const Icon = auto.icon;
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-4 transition-all duration-200 ${
        auto.active
          ? "border-primary/40 shadow-[0_0_20px_rgba(139,0,255,0.08)]"
          : "border-border opacity-70"
      }`}
      style={{ background: "rgba(26,0,37,0.7)", backdropFilter: "blur(12px)" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: auto.active ? "rgba(139,0,255,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${auto.active ? "rgba(139,0,255,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <Icon className={`w-5 h-5 ${auto.active ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">{auto.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {auto.description}
            </p>
          </div>
        </div>
        <Toggle active={auto.active} onToggle={() => onToggle(auto.id)} />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-[11px] text-muted-foreground">{auto.trigger}</span>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0"
          style={{
            color: "#C084FC",
            background: "rgba(139,0,255,0.1)",
            borderColor: "rgba(139,0,255,0.25)",
          }}
        >
          <Zap className="w-3 h-3" />
          {auto.tokens} tokens
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "enviado" | "fallido" }) {
  if (status === "enviado") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border"
        style={{ color: "#52C97A", background: "#52C97A1A", borderColor: "#52C97A40" }}
      >
        <CheckCircle className="w-3 h-3" />
        Enviado
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border"
      style={{ color: "#FF3B3B", background: "#FF3B3B1A", borderColor: "#FF3B3B40" }}
    >
      <XCircle className="w-3 h-3" />
      Fallido
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AutomatizacionesPage() {
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS);

  const activeCount = automations.filter((a) => a.active).length;
  const allActive = activeCount === automations.length;

  const toggle = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const toggleAll = () => {
    const next = !allActive;
    setAutomations((prev) => prev.map((a) => ({ ...a, active: next })));
  };

  return (
    <div className="p-10 max-w-[1200px] mx-auto">
      {/* ── Header ── */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-playfair text-4xl font-bold text-foreground">Automatizaciones</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {activeCount} de {automations.length} automatizaciones activas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Activar todas</span>
          <Toggle active={allActive} onToggle={toggleAll} />
        </div>
      </header>

      {/* ── Automation cards grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {automations.map((auto) => (
          <AutomationCard key={auto.id} auto={auto} onToggle={toggle} />
        ))}
      </div>

      {/* ── Log table ── */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Registro de actividad</h3>
        <div
          className="rounded-xl border border-border overflow-hidden"
          style={{ background: "rgba(13,0,16,0.8)" }}
        >
          <div className="grid grid-cols-[160px_1fr_1fr_140px_100px] gap-4 px-5 py-3 border-b border-border">
            {["Fecha", "Lead", "Tipo", "Canal", "Estado"].map((h) => (
              <span
                key={h}
                className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
              >
                {h}
              </span>
            ))}
          </div>

          {LOG_ROWS.map((row, i) => (
            <div
              key={row.id}
              className={`grid grid-cols-[160px_1fr_1fr_140px_100px] gap-4 px-5 py-3.5 items-center transition-colors hover:bg-white/[0.02] ${
                i < LOG_ROWS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-xs text-muted-foreground font-mono">{row.date}</span>
              <span className="text-sm text-foreground font-medium truncate">{row.lead}</span>
              <span className="text-xs text-muted-foreground truncate">{row.type}</span>
              <span className="text-xs text-muted-foreground">{row.channel}</span>
              <StatusBadge status={row.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
