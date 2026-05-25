"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Plus, Search, LayoutGrid, List, MoreHorizontal,
  MoreVertical, Clock, MessageCircle, X, Send,
  MoveUp, CalendarPlus, ChevronDown, UserRound,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type LeadStatus =
  | "nuevo" | "respondido" | "consulta" | "presupuesto"
  | "deposito" | "confirmado" | "realizado" | "reactivar";

/** Raw row returned from Supabase leads table */
interface DbLead {
  id:             string;
  business_id:    string;
  name:           string;
  instagram:      string | null;
  phone:          string | null;
  email:          string | null;
  source:         string | null;
  status:         string;
  style_interest: string[];
  body_part:      string | null;
  budget_min:     number | null;
  budget_max:     number | null;
  notes:          string | null;
  created_at:     string;
}

interface HistoryEvent {
  time:    string;
  title:   string;
  desc:    string;
  active?: boolean;
}

/** UI-friendly shape used throughout the components */
interface Lead {
  id:             string;
  name:           string;
  initials:       string;
  instagram:      string;
  style:          string;
  budget:         string;
  daysAgo:        string;
  messages:       number;
  status:         LeadStatus;
  artist:         string;
  artistInitials: string;
  phone?:         string;
  email?:         string;
  bodyZone?:      string;
  notes?:         string;
  source?:        string;
  history:        HistoryEvent[];
}

interface NewLeadForm {
  name:          string;
  instagram:     string;
  phone:         string;
  styleInterest: string;
  budgetMin:     string;
  budgetMax:     string;
  notes:         string;
}

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: { id: LeadStatus; label: string; color: string; badgeBg: string }[] = [
  { id: "nuevo",       label: "NUEVO",       color: "#5B8EF0", badgeBg: "#5B8EF01A" },
  { id: "respondido",  label: "RESPONDIDO",  color: "#8B00FF", badgeBg: "#8B00FF1A" },
  { id: "consulta",    label: "CONSULTA",    color: "#6A00C8", badgeBg: "#6A00C81A" },
  { id: "presupuesto", label: "PRESUPUESTO", color: "#FFB547", badgeBg: "#FFB5471A" },
  { id: "deposito",    label: "DEPÓSITO",    color: "#FF8C00", badgeBg: "#FF8C001A" },
  { id: "confirmado",  label: "CONFIRMADO",  color: "#52C97A", badgeBg: "#52C97A1A" },
  { id: "realizado",   label: "REALIZADO",   color: "#988ca2", badgeBg: "#988ca21A" },
  { id: "reactivar",   label: "REACTIVAR",   color: "#FF3B3B", badgeBg: "#FF3B3B1A" },
];

const STYLES = [
  "Blackwork", "Realismo", "Japonés", "Neo-trad",
  "Minimalista", "Acuarela", "Old school", "Lettering",
  "Geometric", "Fine Line", "Traditional", "Watercolor",
];

// ── Transform helpers ─────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function relativeTime(dateStr: string): string {
  const diffMs  = Date.now() - new Date(dateStr).getTime();
  const mins    = Math.floor(diffMs / 60_000);
  const hours   = Math.floor(mins  / 60);
  const days    = Math.floor(hours / 24);
  if (mins  <  1) return "Ahora";
  if (mins  < 60) return `Hace ${mins}min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days  ===1) return "Ayer";
  if (days  < 14) return `Hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es", { day: "numeric", month: "short" });
}

function dbToUiLead(db: DbLead): Lead {
  const rawStyle = db.style_interest?.[0] ?? "";
  const style    = rawStyle ? rawStyle.toUpperCase() : "—";

  let budget = "—";
  if (db.budget_min != null && db.budget_max != null) {
    budget = `$${db.budget_min}–$${db.budget_max}`;
  } else if (db.budget_min != null) {
    budget = `$${db.budget_min}+`;
  } else if (db.budget_max != null) {
    budget = `Hasta $${db.budget_max}`;
  }

  const instagram = db.instagram
    ? `@${db.instagram.replace(/^@/, "")}`
    : "—";

  return {
    id:             db.id,
    name:           db.name,
    initials:       getInitials(db.name),
    instagram,
    style,
    budget,
    daysAgo:        relativeTime(db.created_at),
    messages:       0,
    status:         (db.status as LeadStatus) ?? "nuevo",
    artist:         "Sin asignar",
    artistInitials: "SA",
    phone:          db.phone    ?? undefined,
    email:          db.email    ?? undefined,
    bodyZone:       db.body_part ?? undefined,
    notes:          db.notes    ?? undefined,
    source:         db.source   ?? undefined,
    history: [
      {
        time:   relativeTime(db.created_at),
        title:  "Lead creado",
        desc:   `Registrado el ${new Date(db.created_at).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}`,
        active: true,
      },
    ],
  };
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Initials({ text, size = "sm" }: { text: string; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-16 h-16 text-xl" : "w-8 h-8 text-[10px]";
  return (
    <div className={`${dim} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0`}>
      {text}
    </div>
  );
}

function StyleBadge({ label }: { label: string }) {
  return (
    <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-1 rounded font-mono tracking-wider">
      {label}
    </span>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#0D0010] p-4 rounded-lg border border-border animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-white/5" />
        <div className="h-3 w-28 rounded bg-white/5" />
      </div>
      <div className="h-2 w-20 rounded bg-white/5 mb-3" />
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 rounded bg-white/5" />
        <div className="h-5 w-20 rounded bg-white/5" />
      </div>
      <div className="border-t border-border/30 pt-3 flex justify-between">
        <div className="h-2 w-14 rounded bg-white/5" />
        <div className="h-2 w-8  rounded bg-white/5" />
      </div>
    </div>
  );
}

function KanbanSkeleton() {
  const counts = [2, 1, 2, 1, 1, 2, 1, 1]; // fixed to avoid hydration mismatch
  return (
    <div className="flex gap-5 h-full" style={{ minWidth: "max-content" }}>
      {COLUMNS.map((col, ci) => (
        <div key={col.id} className="flex flex-col shrink-0 w-[300px]">
          <div className="mb-4 pt-2" style={{ borderTop: `4px solid ${col.color}` }}>
            <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: counts[ci] }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 pb-20">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "rgba(139,0,255,0.08)", border: "1px solid rgba(139,0,255,0.2)" }}
      >
        <UserRound className="w-9 h-9" style={{ color: "#8B00FF" }} />
      </div>
      <div className="text-center">
        <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">
          No tienes leads aún
        </h3>
        <p className="text-muted-foreground text-sm">
          Agrega tu primer lead para empezar
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white transition-all"
        style={{
          background:  "linear-gradient(135deg, #8B00FF, #6A00C8)",
          boxShadow:   "0 0 24px rgba(139,0,255,0.35)",
        }}
      >
        <Plus className="w-4 h-4" />
        Agregar lead
      </button>
    </div>
  );
}

// ── New lead modal ────────────────────────────────────────────────────────────

const EMPTY_FORM: NewLeadForm = {
  name: "", instagram: "", phone: "",
  styleInterest: "", budgetMin: "", budgetMax: "", notes: "",
};

function NewLeadModal({
  onClose,
  onCreated,
}: {
  onClose:   () => void;
  onCreated: (lead: Lead) => void;
}) {
  const [form, setForm]        = useState<NewLeadForm>(EMPTY_FORM);
  const [isSubmitting, setSub] = useState(false);
  const [error, setError]      = useState<string | null>(null);

  const patch = (p: Partial<NewLeadForm>) => setForm((prev) => ({ ...prev, ...p }));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSub(true);
    setError(null);

    try {
      const res  = await fetch("/api/leads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          form.name.trim(),
          instagram:     form.instagram.trim() || null,
          phone:         form.phone.trim()     || null,
          styleInterest: form.styleInterest    || null,
          budgetMin:     form.budgetMin        || null,
          budgetMax:     form.budgetMax        || null,
          notes:         form.notes.trim()     || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      onCreated(dbToUiLead(json.lead as DbLead));
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear el lead");
      setSub(false);
    }
  };

  const inputCls =
    "w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none transition-colors bg-[#0D0010] border border-border focus:border-primary";

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1A0025] border border-border rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="font-playfair text-xl font-semibold text-foreground">Nuevo Lead</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Nombre del cliente"
              className={inputCls}
            />
          </div>

          {/* Instagram + Teléfono */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => patch({ instagram: e.target.value })}
                  placeholder="handle"
                  className={`${inputCls} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                placeholder="+1 234 567 890"
                className={inputCls}
              />
            </div>
          </div>

          {/* Estilo */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Estilo de interés
            </label>
            <div className="relative">
              <select
                value={form.styleInterest}
                onChange={(e) => patch({ styleInterest: e.target.value })}
                className={`${inputCls} appearance-none pr-8 cursor-pointer`}
              >
                <option value="">Selecciona un estilo</option>
                {STYLES.map((s) => (
                  <option key={s} value={s} style={{ background: "#0D0010" }}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Presupuesto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Presupuesto mín.
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  value={form.budgetMin}
                  onChange={(e) => patch({ budgetMin: e.target.value })}
                  placeholder="100"
                  className={`${inputCls} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Presupuesto máx.
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  value={form.budgetMax}
                  onChange={(e) => patch({ budgetMax: e.target.value })}
                  placeholder="500"
                  className={`${inputCls} pl-7`}
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              placeholder="Detalles del proyecto, zona del cuerpo, preferencias…"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-xs"
              style={{
                background: "rgba(255,50,50,0.08)",
                border: "1px solid rgba(255,80,80,0.3)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-muted-foreground border border-border hover:border-primary/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #8B00FF, #6A00C8)",
                boxShadow:  "0 0 20px rgba(139,0,255,0.3)",
              }}
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {isSubmitting ? "Guardando…" : "Crear lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Lead card ─────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onOpen,
  onDragStart,
}: {
  lead:        Lead;
  onOpen:      (l: Lead) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onOpen(lead)}
      className="bg-[#0D0010] p-4 rounded-lg border border-border hover:border-primary/60 transition-all cursor-grab group shadow-card select-none"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Initials text={lead.initials} />
          <span className="font-semibold text-foreground text-sm leading-tight">{lead.name}</span>
        </div>
        <MoreVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      <div className="flex items-center gap-1 text-primary text-xs mb-3">
        <span className="text-muted-foreground text-[11px]">@</span>
        {lead.instagram.replace("@", "")}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <StyleBadge label={lead.style} />
        {lead.budget !== "—" && (
          <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-1 rounded font-mono">
            {lead.budget}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] text-muted-foreground border-t border-border/30 pt-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {lead.daysAgo}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" /> {lead.messages}
        </span>
      </div>
    </div>
  );
}

// ── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  leads,
  onOpen,
  onDragStart,
  onDrop,
}: {
  col:         (typeof COLUMNS)[number];
  leads:       Lead[];
  onOpen:      (l: Lead) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop:      (e: React.DragEvent, status: LeadStatus) => void;
}) {
  const [isDragOver, setOver] = useState(false);

  return (
    <div
      className="flex flex-col shrink-0 w-[300px] h-full"
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { setOver(false); onDrop(e, col.id); }}
    >
      <div
        className="flex items-center justify-between mb-4 pt-2"
        style={{ borderTop: `4px solid ${col.color}` }}
      >
        <h3 className="font-mono text-[11px] tracking-widest text-muted-foreground flex items-center gap-2">
          {col.label}
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: col.badgeBg, color: col.color }}
          >
            {leads.length}
          </span>
        </h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div
        className={`flex-1 space-y-4 overflow-y-auto pr-1 rounded-lg p-1 transition-colors ${
          isDragOver ? "bg-primary/5 ring-1 ring-primary/20" : ""
        }`}
        style={{ scrollbarWidth: "thin" }}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onOpen={onOpen} onDragStart={onDragStart} />
        ))}
        {leads.length === 0 && (
          <div
            className={`border border-dashed rounded-lg p-6 text-center text-xs transition-colors ${
              isDragOver
                ? "border-primary/50 text-primary/70"
                : "border-border/40 text-muted-foreground"
            }`}
          >
            {isDragOver ? "Soltar aquí" : "Sin leads en esta etapa"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lead detail modal ─────────────────────────────────────────────────────────

function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const statusCol = COLUMNS.find((c) => c.id === lead.status);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1A0025] border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <Initials text={lead.initials} size="lg" />
            <div>
              <h2 className="font-playfair text-2xl font-semibold text-foreground">{lead.name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-mono tracking-wider border"
                  style={{
                    background:   statusCol?.badgeBg,
                    color:        statusCol?.color,
                    borderColor:  `${statusCol?.color}33`,
                  }}
                >
                  ESTADO: {lead.status.toUpperCase()}
                </span>
                {lead.source && (
                  <span className="text-muted-foreground text-xs italic">
                    Lead captado vía {lead.source}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-8">
          {/* Left */}
          <div className="col-span-12 md:col-span-7 space-y-8">
            <div>
              <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4 border-b border-border pb-2">
                Datos de Contacto
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {lead.phone && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Teléfono</p>
                    <p className="text-foreground text-sm">{lead.phone}</p>
                  </div>
                )}
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Instagram</p>
                  <p className="text-primary text-sm">{lead.instagram}</p>
                </div>
                {lead.email && (
                  <div className="col-span-2">
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Email</p>
                    <p className="text-foreground text-sm">{lead.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4 border-b border-border pb-2">
                Detalles del Proyecto
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Estilo</p>
                  <p className="font-playfair text-lg font-semibold text-foreground">{lead.style}</p>
                </div>
                {lead.bodyZone && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Zona del cuerpo</p>
                    <p className="font-playfair text-lg font-semibold text-foreground">{lead.bodyZone}</p>
                  </div>
                )}
                {lead.budget !== "—" && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Presupuesto estimado</p>
                    <p className="font-mono text-xl font-medium text-primary">{lead.budget}</p>
                  </div>
                )}
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Artista asignado</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[8px] font-bold text-primary">
                      {lead.artistInitials}
                    </div>
                    <p className="text-foreground text-sm">{lead.artist}</p>
                  </div>
                </div>
              </div>
            </div>

            {lead.notes && (
              <div>
                <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4 border-b border-border pb-2">
                  Notas Internas
                </h4>
                <div className="bg-[#0D0010] p-4 rounded-lg border border-border italic text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{lead.notes}&rdquo;
                </div>
              </div>
            )}
          </div>

          {/* Right: history + actions */}
          <div className="col-span-12 md:col-span-5 bg-[#0D0010]/60 rounded-xl border border-border p-6 flex flex-col">
            <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Historial de Contacto
              <Clock className="w-4 h-4" />
            </h4>

            <div className="space-y-6 flex-1">
              {lead.history.map((ev, i) => (
                <div key={i} className="flex gap-4">
                  <div className="min-w-[44px] text-[10px] text-muted-foreground font-mono pt-1 shrink-0">
                    {ev.time}
                  </div>
                  <div
                    className="relative pl-4"
                    style={{ borderLeft: `1px solid ${ev.active ? "#8B00FF" : "#2D0050"}` }}
                  >
                    <div
                      className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
                      style={{ background: ev.active ? "#8B00FF" : "#2D0050" }}
                    />
                    <p className="text-sm font-bold text-foreground">{ev.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
              <button className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg transition-all">
                <Send className="w-4 h-4" />
                Enviar mensaje
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-secondary border border-border text-foreground py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:border-primary/50 transition-colors">
                  <MoveUp className="w-4 h-4" />
                  Mover estado
                </button>
                <button className="bg-secondary border border-border text-foreground py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:border-primary/50 transition-colors">
                  <CalendarPlus className="w-4 h-4" />
                  Agendar cita
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-10 pb-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {["Lead", "Instagram", "Estilo", "Presupuesto", "Estado", "Artista", "Contacto"].map((h) => (
              <th
                key={h}
                className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase py-3 pr-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const col = COLUMNS.find((c) => c.id === lead.status);
            return (
              <tr
                key={lead.id}
                onClick={() => onOpen(lead)}
                className="border-b border-border/30 hover:bg-secondary/30 cursor-pointer transition-colors"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Initials text={lead.initials} />
                    <span className="font-semibold text-foreground">{lead.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-primary">{lead.instagram}</td>
                <td className="py-3 pr-4"><StyleBadge label={lead.style} /></td>
                <td className="py-3 pr-4 font-mono text-muted-foreground">{lead.budget}</td>
                <td className="py-3 pr-4">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-mono tracking-wider"
                    style={{ background: col?.badgeBg, color: col?.color }}
                  >
                    {lead.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{lead.artist}</td>
                <td className="py-3 pr-4 text-muted-foreground text-xs">{lead.daysAgo}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CrmPage() {
  const [leads, setLeads]             = useState<Lead[]>([]);
  const [isLoading, setLoading]       = useState(true);
  const [selectedLead, setSelected]   = useState<Lead | null>(null);
  const [showNewModal, setNewModal]   = useState(false);
  const [view, setView]               = useState<"kanban" | "list">("kanban");
  const [search, setSearch]           = useState("");
  const [filterStyle, setFilterStyle] = useState("todos");

  // Ref to carry dragged lead ID across drag events without re-rendering
  const draggingId = useRef<string | null>(null);

  // ── Fetch leads on mount ──
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/leads");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setLeads((json.leads as DbLead[]).map(dbToUiLead));
      } catch (err) {
        console.error("[CRM] fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openLead  = useCallback((lead: Lead) => setSelected(lead), []);
  const closeLead = useCallback(() => setSelected(null), []);

  // ── Drag-and-drop ──
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    draggingId.current            = id;
    e.dataTransfer.effectAllowed  = "move";
    e.dataTransfer.setData("text/plain", id); // required for Firefox
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStatus: LeadStatus) => {
      e.preventDefault();
      const id = draggingId.current ?? e.dataTransfer.getData("text/plain");
      draggingId.current = null;
      if (!id) return;

      setLeads((prev) => {
        const lead = prev.find((l) => l.id === id);
        if (!lead || lead.status === targetStatus) return prev;
        return prev.map((l) => (l.id === id ? { ...l, status: targetStatus } : l));
      });

      // Persist status change — fire-and-forget with silent revert on error
      try {
        const res = await fetch("/api/leads", {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ id, status: targetStatus }),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error);
        }
      } catch (err) {
        console.error("[CRM] patch error:", err);
        // Revert to the previous status by re-fetching
        const res  = await fetch("/api/leads");
        const json = await res.json();
        if (res.ok) setLeads((json.leads as DbLead[]).map(dbToUiLead));
      }
    },
    []
  );

  const handleLeadCreated = useCallback((lead: Lead) => {
    setLeads((prev) => [lead, ...prev]);
  }, []);

  // ── Filtering ──
  const filteredLeads = leads.filter((lead) => {
    const q           = search.toLowerCase();
    const matchSearch = !q
      || lead.name.toLowerCase().includes(q)
      || lead.instagram.toLowerCase().includes(q)
      || lead.style.toLowerCase().includes(q);
    const matchStyle  = filterStyle === "todos" || lead.style === filterStyle;
    return matchSearch && matchStyle;
  });

  const leadsForColumn = (status: LeadStatus) =>
    filteredLeads.filter((l) => l.status === status);

  const allStyles = Array.from(
    new Set(leads.map((l) => l.style).filter((s) => s !== "—"))
  ).sort();

  const showEmpty = !isLoading && leads.length === 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 pt-8 px-10 pb-0">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-playfair text-4xl font-bold text-foreground">CRM de Leads</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isLoading
                ? "Cargando leads…"
                : `${filteredLeads.length} leads activos en tu pipeline`}
            </p>
          </div>
          <button
            onClick={() => setNewModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Plus className="w-4 h-4" />+ Nuevo lead
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3 py-4 border-y border-border/30">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A0025] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="bg-[#1A0025] border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer">
                <option>Todos los artistas</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="bg-[#1A0025] border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="todos">Todos los estilos</option>
                {allStyles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select className="bg-[#1A0025] border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer">
                <option>Esta semana</option>
                <option>Este mes</option>
                <option>Todo el tiempo</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* View toggle */}
          <div className="ml-auto flex bg-[#1A0025] border border-border rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                view === "kanban" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Vista kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              Vista lista
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      {isLoading ? (
        <section className="flex-1 overflow-x-auto overflow-y-hidden px-10 pb-8 pt-6">
          <KanbanSkeleton />
        </section>
      ) : showEmpty ? (
        <EmptyState onAdd={() => setNewModal(true)} />
      ) : view === "kanban" ? (
        <section className="flex-1 overflow-x-auto overflow-y-hidden px-10 pb-8 pt-6">
          <div className="flex gap-5 h-full" style={{ minWidth: "max-content" }}>
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                leads={leadsForColumn(col.id)}
                onOpen={openLead}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </section>
      ) : (
        <ListView leads={filteredLeads} onOpen={openLead} />
      )}

      {/* ── Modals ── */}
      {selectedLead && <LeadModal lead={selectedLead} onClose={closeLead} />}
      {showNewModal  && (
        <NewLeadModal
          onClose={() => setNewModal(false)}
          onCreated={handleLeadCreated}
        />
      )}
    </div>
  );
}
