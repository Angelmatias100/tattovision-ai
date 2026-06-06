"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X,
  Search, ChevronDown, Clock, MoreVertical, CalendarOff,
  Share2, Copy, Check,
} from "lucide-react";
import { usePlan } from "@/components/shared/PlanContext";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROW_H  = 80;
const START_H = 9;
const END_H   = 20;
const HOURS   = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const DURATION_OPTIONS = [
  { label: "1h",       minutes: 60  },
  { label: "1h 30m",   minutes: 90  },
  { label: "2h",       minutes: 120 },
  { label: "3h",       minutes: 180 },
  { label: "4h",       minutes: 240 },
  { label: "Full day", minutes: 480 },
];

// Artist color palette — assigned by position in sorted artists list
const PALETTE = [
  { bg: "rgba(139,0,255,0.15)", border: "#8B00FF", label: "#C084FC", dot: "#8B00FF" },
  { bg: "rgba(98,37,155,0.20)",  border: "#62259b", label: "#ddb8ff", dot: "#62259b" },
  { bg: "rgba(91,142,240,0.20)", border: "#5B8EF0", label: "#93c5fd", dot: "#5B8EF0" },
  { bg: "rgba(82,201,122,0.15)", border: "#52C97A", label: "#86efac", dot: "#52C97A" },
  { bg: "rgba(255,181,71,0.15)", border: "#FFB547", label: "#fde68a", dot: "#FFB547" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode   = "dia" | "semana" | "mes";
type ApptStatus = "confirmada" | "pendiente" | "noshow" | "realizada";

/** Raw row from GET /api/appointments (already enriched server-side) */
interface DbAppt {
  id:             string;
  lead_id:        string | null;
  artist_id:      string | null;
  date:           string;          // YYYY-MM-DD
  time_start:     string | null;   // HH:MM or HH:MM:SS
  time_end:       string | null;
  status:         string;
  deposit_amount: number | null;
  notes:          string | null;
  lead_name:      string | null;   // injected by API
  lead_style:     string | null;
  artist_name:    string | null;
}

interface ArtistOption {
  id:     string;
  name:   string;
  styles: string[];
}

interface DbLead {
  id:   string;
  name: string;
}

type PaletteColor = typeof PALETTE[number];

/** UI-ready appointment — all display data pre-computed */
interface Appointment {
  id:             string;
  clientName:     string;
  style:          string;
  dayIndex:       number;         // 0 = Monday of displayed week
  startHour:      number;
  startMinute:    number;
  durationMinutes:number;
  artistId:       string | null;
  artistInitials: string;
  artistName:     string;
  status:         ApptStatus;
  color:          PaletteColor;
  date:           string;
  leadId:         string | null;
}

interface NewCitaForm {
  leadSearch:    string;
  leadId:        string | null;
  leadName:      string;
  artistId:      string;
  date:          string;
  timeStart:     string;
  duration:      string;          // minutes
  depositAmount: string;
  notes:         string;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day  = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function todayDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const mD = monday.getDate(), sD = sunday.getDate();
  const mM = MONTHS[monday.getMonth()], sM = MONTHS[sunday.getMonth()];
  const yr = sunday.getFullYear();
  return monday.getMonth() === sunday.getMonth()
    ? `Lun ${mD} - Dom ${sD} ${mM} ${yr}`
    : `Lun ${mD} ${mM} - Dom ${sD} ${sM} ${yr}`;
}

function fmtTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total  = h * 60 + m + mins;
  return fmtTime(Math.floor(total / 60) % 24, total % 60);
}

// ── DB → UI transform ─────────────────────────────────────────────────────────

function dbToUiAppt(
  db: DbAppt,
  weekMonday: Date,
  colorMap: Record<string, PaletteColor>
): Appointment {
  // dayIndex relative to the displayed Monday
  const apptDate  = new Date(db.date + "T12:00:00");
  const monDate   = new Date(weekMonday); monDate.setHours(12, 0, 0, 0);
  const dayIndex  = Math.round((apptDate.getTime() - monDate.getTime()) / 86_400_000);

  // Parse time_start (may be "HH:MM" or "HH:MM:SS")
  const timeParts = (db.time_start ?? "09:00").split(":").map(Number);
  const startHour   = timeParts[0] ?? 9;
  const startMinute = timeParts[1] ?? 0;

  // Duration from time_end
  let durationMinutes = 60;
  if (db.time_end) {
    const [eh, em] = db.time_end.split(":").map(Number);
    durationMinutes = Math.max(30, (eh * 60 + em) - (startHour * 60 + startMinute));
  }

  // Artist display
  const artistName     = db.artist_name ?? "Sin artista";
  const artistInitials = artistName
    .split(" ")
    .map(p => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("") || "SA";

  const color = db.artist_id
    ? (colorMap[db.artist_id] ?? PALETTE[0])
    : PALETTE[0];

  return {
    id:              db.id,
    clientName:      db.lead_name   ?? "Cliente",
    style:           db.lead_style  ?? "—",
    dayIndex,
    startHour,
    startMinute,
    durationMinutes,
    artistId:        db.artist_id,
    artistInitials,
    artistName,
    status:          (db.status as ApptStatus) ?? "confirmada",
    color,
    date:            db.date,
    leadId:          db.lead_id,
  };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="flex flex-1 overflow-hidden animate-pulse">
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[610px]">
          {/* Day header */}
          <div
            className="grid border-b border-border h-14 shrink-0"
            style={{ gridTemplateColumns: "50px repeat(7, minmax(80px, 1fr))" }}
          >
            <div className="border-r border-border" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center border-r last:border-0 border-border">
                <div className="h-3 w-10 rounded bg-white/5" />
              </div>
            ))}
          </div>
          {/* Hour rows */}
          {HOURS.slice(0, 6).map(h => (
            <div
              key={h}
              className="grid shrink-0"
              style={{ height: ROW_H, gridTemplateColumns: "50px repeat(7, minmax(80px, 1fr))" }}
            >
              <div className="border-r border-b border-border flex justify-center pt-2">
                <div className="h-2 w-8 rounded bg-white/5" />
              </div>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="border-b border-border relative"
                  style={{ borderRight: i < 6 ? "1px solid hsl(var(--border))" : "none" }}>
                  {i === 1 && h === 10 && (
                    <div className="absolute inset-x-1 top-0 h-[160px] rounded bg-primary/10 border-l-4 border-primary/30" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden md:flex flex-col w-80 border-l border-border bg-[#090010] shrink-0">
        <div className="p-6 border-b border-border">
          <div className="h-4 w-28 rounded bg-white/5" />
        </div>
        <div className="p-5 space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="p-4 rounded-xl bg-white/3 border border-border animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-2 w-20 rounded bg-white/5" />
                <div className="h-4 w-16 rounded-full bg-white/5" />
              </div>
              <div className="h-3 w-32 rounded bg-white/5" />
              <div className="h-2 w-24 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ── Share modal ───────────────────────────────────────────────────────────────

function ShareModal({ bookingUrl, onClose }: { bookingUrl: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waText = bookingUrl
    ? `Hola! Puedes reservar tu cita conmigo aquí 🎨\n${bookingUrl}`
    : "";
  const waUrl = bookingUrl ? `https://wa.me/?text=${encodeURIComponent(waText)}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-[#0D0010] p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-playfair text-lg font-bold text-foreground">Compartir tu agenda</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Envía este link a tus clientes para que reserven citas directamente.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingUrl ? (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-muted-foreground">URL de reserva</label>
            <div className="bg-[#1A0025] border border-border rounded-lg px-3 py-2.5 text-xs font-mono text-primary break-all">
              {bookingUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold border transition-all ${
                copied
                  ? "bg-green-500/10 border-green-500/40 text-green-400"
                  : "bg-primary/10 border-primary/35 hover:bg-primary/20"
              }`}
              style={{ color: copied ? undefined : "#C084FC" }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "¡Copiado!" : "Copiar link de reservas"}
            </button>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm text-white transition-colors"
                style={{ background: "#25D366" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar por WhatsApp
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "rgba(139,0,255,0.08)", border: "1px solid rgba(139,0,255,0.2)" }}
            >
              <Share2 className="w-6 h-6" style={{ color: "#8B00FF" }} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              Completa tu perfil en{" "}
              <a href="/configuracion" className="text-primary font-bold hover:underline">
                Configuración
              </a>{" "}
              para obtener tu link de reservas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyWeek({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 pb-20">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "rgba(139,0,255,0.08)", border: "1px solid rgba(139,0,255,0.2)" }}
      >
        <CalendarOff className="w-9 h-9" style={{ color: "#8B00FF" }} />
      </div>
      <div className="text-center">
        <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">
          No tienes citas esta semana
        </h3>
        <p className="text-muted-foreground text-sm">Agrega una cita para verla aquí</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white transition-all"
        style={{
          background: "linear-gradient(135deg, #8B00FF, #6A00C8)",
          boxShadow:  "0 0 24px rgba(139,0,255,0.35)",
        }}
      >
        <Plus className="w-4 h-4" />+ Nueva cita
      </button>
    </div>
  );
}

// ── Appointment block ─────────────────────────────────────────────────────────

function ApptBlock({ appt }: { appt: Appointment }) {
  const c      = appt.color;
  const topPx  = (appt.startMinute / 60) * ROW_H;
  const highPx = (appt.durationMinutes / 60) * ROW_H;
  const dim    = appt.status === "noshow";
  const endH   = appt.startHour  + Math.floor((appt.startMinute + appt.durationMinutes) / 60);
  const endM   = (appt.startMinute + appt.durationMinutes) % 60;

  return (
    <div
      className="absolute inset-x-1 rounded-r z-10 p-2.5 cursor-pointer hover:brightness-110 transition-all overflow-hidden select-none"
      style={{
        top:             topPx,
        height:          highPx,
        backgroundColor: dim ? "rgba(80,80,80,0.12)" : c.bg,
        borderLeft:      `4px solid ${dim ? "#555" : c.border}`,
        opacity:         dim ? 0.55 : 1,
      }}
      title={`${appt.clientName} · ${fmtTime(appt.startHour, appt.startMinute)}–${fmtTime(endH, endM)}`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-[11px] text-foreground leading-tight truncate pr-1">
          {appt.clientName}
        </span>
        <div
          className="w-2 h-2 rounded-full shrink-0 mt-0.5"
          style={{ backgroundColor: STATUS_CFG[appt.status].color }}
        />
      </div>
      <p className="hidden md:block text-[10px] font-medium leading-tight" style={{ color: c.label }}>
        {appt.style}
      </p>
      {highPx >= 80 && (
        <div className="hidden md:flex items-center gap-1.5 mt-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
            style={{ backgroundColor: dim ? "#555" : c.border }}
          >
            {appt.artistInitials}
          </div>
          <span className="text-[10px] text-muted-foreground">{appt.artistName}</span>
        </div>
      )}
    </div>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ApptStatus, { label: string; color: string; bg: string }> = {
  confirmada: { label: "CONFIRMADA", color: "#52C97A", bg: "#52C97A1A" },
  pendiente:  { label: "PENDIENTE",  color: "#E0B800", bg: "#E0B8001A" },
  noshow:     { label: "NO SHOW",    color: "#FF3B3B", bg: "#FF3B3B1A" },
  realizada:  { label: "REALIZADA",  color: "#988ca2", bg: "#988ca21A" },
};

// ── Today sidebar card ────────────────────────────────────────────────────────

function TodayCard({
  appt,
  onStatusChange,
}: {
  appt:           Appointment;
  onStatusChange: (id: string, status: ApptStatus) => void;
}) {
  const sc    = STATUS_CFG[appt.status];
  const endH  = appt.startHour + Math.floor((appt.startMinute + appt.durationMinutes) / 60);
  const endM  = (appt.startMinute + appt.durationMinutes) % 60;
  const [busy, setBusy] = useState(false);

  const handleCheckIn = async () => {
    setBusy(true);
    onStatusChange(appt.id, "realizada");   // optimistic
    try {
      const res = await fetch("/api/appointments", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: appt.id, status: "realizada" }),
      });
      if (!res.ok) throw new Error();
    } catch {
      onStatusChange(appt.id, appt.status); // revert
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        background:    "rgba(13,0,16,0.8)",
        backdropFilter:"blur(12px)",
        border:        `1px solid ${appt.status === "pendiente" ? sc.color : "#2D0050"}`,
        borderLeft:    `4px solid ${appt.color.border}`,
        opacity:       appt.status === "noshow" ? 0.6 : 1,
      }}
    >
      <div className="flex justify-between items-center">
        <span className="font-mono text-[10px] text-muted-foreground">
          {fmtTime(appt.startHour, appt.startMinute)} – {fmtTime(endH, endM)}
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
          style={{ color: sc.color, background: sc.bg, borderColor: `${sc.color}50` }}
        >
          {sc.label}
        </span>
      </div>
      <div>
        <p className="font-bold text-sm text-foreground">{appt.clientName}</p>
        <p className="text-xs text-muted-foreground">{appt.style} · {appt.artistName}</p>
      </div>
      {appt.status === "confirmada" && (
        <div className="flex gap-2">
          <button className="flex-1 py-2 text-[11px] font-bold border border-border rounded hover:bg-secondary transition-colors text-foreground">
            Editar
          </button>
          <button
            disabled={busy}
            onClick={handleCheckIn}
            className="flex-1 py-2 text-[11px] font-bold bg-primary text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? "…" : "Check-in"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Nueva Cita modal ──────────────────────────────────────────────────────────

const EMPTY_FORM = (): NewCitaForm => ({
  leadSearch:    "",
  leadId:        null,
  leadName:      "",
  artistId:      "",
  date:          toDateStr(new Date()),
  timeStart:     "10:00",
  duration:      "120",
  depositAmount: "",
  notes:         "",
});

function NewCitaModal({
  artists,
  onClose,
  onCreated,
}: {
  artists:   ArtistOption[];
  onClose:   () => void;
  onCreated: (appt: DbAppt) => void;
}) {
  const [form, setForm]        = useState<NewCitaForm>(EMPTY_FORM);
  const [leads, setLeads]      = useState<DbLead[]>([]);
  const [showLeads, setShowLeads] = useState(false);
  const [isSubmitting, setSub] = useState(false);
  const [error, setError]      = useState<string | null>(null);
  const leadRef = useRef<HTMLDivElement>(null);

  const patch = (p: Partial<NewCitaForm>) => setForm(prev => ({ ...prev, ...p }));

  // Fetch leads once for search
  useEffect(() => {
    fetch("/api/leads")
      .then(r => r.json())
      .then(j => setLeads((j.leads ?? []).map((l: { id: string; name: string }) => ({ id: l.id, name: l.name }))))
      .catch(console.error);
  }, []);

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Close lead dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (leadRef.current && !leadRef.current.contains(e.target as Node)) {
        setShowLeads(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredLeads = form.leadSearch.length > 0
    ? leads.filter(l => l.name.toLowerCase().includes(form.leadSearch.toLowerCase())).slice(0, 6)
    : [];

  const timeEnd = addMinutes(form.timeStart, parseInt(form.duration) || 120);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) return;
    setSub(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId:        form.leadId        || null,
          artistId:      form.artistId      || null,
          date:          form.date,
          timeStart:     form.timeStart,
          timeEnd,
          depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : null,
          notes:         form.notes.trim()  || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      onCreated(json.appointment as DbAppt);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setSub(false);
    }
  };

  const inputCls =
    "w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: "rgba(13,0,16,0.95)", border: "1px solid #2D0050" }}
      >
        {/* Header */}
        <div className="p-8 border-b border-border flex justify-between items-center shrink-0">
          <h3 className="font-playfair text-2xl font-semibold text-foreground">Nueva cita</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 flex-1">

          {/* Lead search */}
          <div className="space-y-2" ref={leadRef}>
            <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
              Cliente (Lead)
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                value={form.leadId ? form.leadName : form.leadSearch}
                onChange={e => {
                  if (form.leadId) {
                    // Editing clears the selection
                    patch({ leadId: null, leadName: "", leadSearch: e.target.value });
                  } else {
                    patch({ leadSearch: e.target.value });
                  }
                  setShowLeads(true);
                }}
                onFocus={() => setShowLeads(true)}
                placeholder="Buscar por nombre..."
                className={inputCls}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

              {/* Dropdown */}
              {showLeads && filteredLeads.length > 0 && (
                <div
                  className="absolute top-full mt-1 w-full rounded-lg border border-border overflow-hidden z-50 shadow-xl"
                  style={{ background: "#1A0025" }}
                >
                  {filteredLeads.map(lead => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => {
                        patch({ leadId: lead.id, leadName: lead.name, leadSearch: "" });
                        setShowLeads(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-primary/10 transition-colors border-b border-border/40 last:border-0"
                    >
                      {lead.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.leadId && (
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Lead vinculado: <span className="font-bold">{form.leadName}</span>
                <button
                  type="button"
                  onClick={() => patch({ leadId: null, leadName: "", leadSearch: "" })}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </p>
            )}
          </div>

          {/* Artist + Date */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Artista
              </label>
              <div className="relative">
                <select
                  value={form.artistId}
                  onChange={e => patch({ artistId: e.target.value })}
                  className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                >
                  <option value="">Sin asignar</option>
                  {artists.map(a => (
                    <option key={a.id} value={a.id} style={{ background: "#1A0025" }}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Fecha <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => patch({ date: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Time + Duration + Deposit */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Hora inicio
              </label>
              <input
                type="time"
                value={form.timeStart}
                onChange={e => patch({ timeStart: e.target.value })}
                className={`${inputCls} font-mono`}
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Duración
              </label>
              <div className="relative">
                <select
                  value={form.duration}
                  onChange={e => patch({ duration: e.target.value })}
                  className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                >
                  {DURATION_OPTIONS.map(o => (
                    <option key={o.minutes} value={String(o.minutes)} style={{ background: "#1A0025" }}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Depósito ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="50"
                  value={form.depositAmount}
                  onChange={e => patch({ depositAmount: e.target.value })}
                  className={`${inputCls} pl-7 font-mono`}
                />
              </div>
            </div>
          </div>

          {/* Computed time end preview */}
          <p className="text-xs text-muted-foreground font-mono">
            Hora fin estimada: <span className="text-primary font-bold">{timeEnd}</span>
          </p>

          {/* Notes */}
          <div className="space-y-2">
            <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
              Notas de la sesión
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre el diseño, zona del cuerpo, etc…"
              value={form.notes}
              onChange={e => patch({ notes: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>

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
        </form>

        {/* Footer */}
        <div className="p-8 bg-card border-t border-border flex justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-bold text-sm border border-border hover:bg-secondary transition-colors text-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={!form.date || isSubmitting}
            className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {isSubmitting ? "Guardando…" : "Guardar cita"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const [view,        setView]        = useState<ViewMode>("semana");
  const [weekOffset,  setWeekOffset]  = useState(0);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [shareOpen,   setShareOpen]   = useState(false);
  const [filterArtist,setFilter]      = useState("todos");
  const [appointments,setAppointments]= useState<Appointment[]>([]);
  const [artists,     setArtists]     = useState<ArtistOption[]>([]);
  const [isLoading,   setLoading]     = useState(true);

  const { bookingSlug } = usePlan();
  const bookingUrl = bookingSlug
    ? `${typeof window !== "undefined" ? window.location.origin : "https://www.tattovision.com"}/booking/${bookingSlug}`
    : null;

  // Compute current week dates (stable per weekOffset)
  const today    = useMemo(() => new Date(), []);
  const monday   = useMemo(() => getMondayOfWeek(addDays(today, weekOffset * 7)), [weekOffset, today]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday]);

  // Artist color map — stable across fetches
  const colorMap = useMemo<Record<string, PaletteColor>>(
    () => Object.fromEntries(artists.map((a, i) => [a.id, PALETTE[i % PALETTE.length]])),
    [artists]
  );

  // ── Fetch appointments whenever the displayed week changes ──
  useEffect(() => {
    const start = toDateStr(monday);
    const end   = toDateStr(addDays(monday, 6));
    setLoading(true);

    fetch(`/api/appointments?start=${start}&end=${end}`)
      .then(r => r.json())
      .then(json => {
        const freshArtists: ArtistOption[] = json.artists ?? [];
        setArtists(freshArtists);

        // Rebuild colorMap with fresh artists for transform
        const freshColorMap: Record<string, PaletteColor> = Object.fromEntries(
          freshArtists.map((a, i) => [a.id, PALETTE[i % PALETTE.length]])
        );
        setAppointments(
          (json.appointments as DbAppt[] ?? []).map(a => dbToUiAppt(a, monday, freshColorMap))
        );
      })
      .catch(err => console.error("[Agenda] fetch error:", err))
      .finally(() => setLoading(false));
  }, [weekOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCurrentWeek = weekOffset === 0;
  const todayIdx      = todayDayIndex();

  // ── Filtered calendar appointments ──
  const visibleAppts = useMemo(() =>
    filterArtist === "todos"
      ? appointments
      : appointments.filter(a => a.artistId === filterArtist),
    [appointments, filterArtist]
  );

  // ── Today sidebar appointments ──
  const todayAppts = useMemo(() =>
    isCurrentWeek
      ? [...appointments]
          .filter(a => a.dayIndex === todayIdx)
          .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute))
      : [],
    [appointments, isCurrentWeek, todayIdx]
  );

  // ── Handlers ──
  const openModal  = useCallback(() => setModalOpen(true),  []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleStatusChange = useCallback((id: string, status: ApptStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }, []);

  const handleApptCreated = useCallback((dbAppt: DbAppt) => {
    setAppointments(prev => [dbToUiAppt(dbAppt, monday, colorMap), ...prev]);
  }, [monday, colorMap]);

  const showEmpty = !isLoading && appointments.length === 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Header ── */}
      <header className="px-4 md:px-8 py-3 md:py-0 md:h-20 border-b border-border bg-black/40 backdrop-blur-xl shrink-0">
        {/* Mobile layout */}
        <div className="flex md:hidden flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-xl font-semibold text-foreground">Agenda</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
              <button
                onClick={openModal}
                className="bg-primary text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-glow active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva cita
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pb-1">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="text-primary hover:text-foreground transition-colors p-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-foreground text-xs text-center">
              {formatWeekRange(monday)}
            </span>
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="text-primary hover:text-foreground transition-colors p-1"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex items-center justify-between h-full">
          <div className="flex items-center gap-5">
            <h2 className="font-playfair text-2xl font-semibold text-foreground">Agenda</h2>

            {/* View toggle */}
            <div className="flex bg-card rounded-lg p-1 border border-border gap-0.5">
              {(["dia", "semana", "mes"] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-sm rounded transition-colors ${
                    view === v ? "bg-primary text-white font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
                </button>
              ))}
            </div>

            {/* Week navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset(o => o - 1)}
                className="text-primary hover:text-foreground transition-colors p-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-foreground min-w-[220px] text-center text-sm">
                {formatWeekRange(monday)}
              </span>
              <button
                onClick={() => setWeekOffset(o => o + 1)}
                className="text-primary hover:text-foreground transition-colors p-1"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Artist filter */}
            <div className="relative">
              <select
                value={filterArtist}
                onChange={e => setFilter(e.target.value)}
                className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground appearance-none pr-9 focus:border-primary outline-none cursor-pointer"
              >
                <option value="todos">Todos los artistas</option>
                {artists.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartir agenda
            </button>

            <button
              onClick={openModal}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-glow hover:shadow-glow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva cita
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : showEmpty ? (
        <EmptyWeek onAdd={openModal} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* ── Calendar grid ── */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <div className="min-w-[610px]">
              {/* Sticky day header */}
              <div
                className="grid border-b border-border sticky top-0 bg-black z-10 shrink-0"
                style={{ gridTemplateColumns: "50px repeat(7, minmax(80px, 1fr))" }}
              >
                <div className="h-14 flex items-center justify-center border-r border-border">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                {weekDays.map((date, i) => {
                  const isToday = isCurrentWeek && i === todayIdx;
                  return (
                    <div
                      key={i}
                      className={`h-14 flex flex-col items-center justify-center border-r last:border-r-0 border-border transition-colors ${
                        isToday ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                        {DAY_LABELS[i]}
                      </span>
                      <span
                        className={`font-playfair text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                          isToday ? "bg-primary text-white" : "text-foreground"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Hour rows */}
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="grid shrink-0"
                  style={{ height: ROW_H, gridTemplateColumns: "50px repeat(7, minmax(80px, 1fr))" }}
                >
                  <div className="border-r border-b border-border flex justify-center pt-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                  {weekDays.map((_, dayIdx) => {
                    const appts = visibleAppts.filter(
                      a => a.dayIndex === dayIdx && a.startHour === hour
                    );
                    return (
                      <div
                        key={dayIdx}
                        className="border-b border-border relative"
                        style={{ borderRight: dayIdx < 6 ? "1px solid hsl(var(--border))" : "none" }}
                      >
                        {appts.map(a => <ApptBlock key={a.id} appt={a} />)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right sidebar — hidden on mobile ── */}
          <aside className="hidden md:flex flex-col w-80 bg-[#090010] border-l border-border overflow-hidden shrink-0">
            <div className="p-6 border-b border-border flex justify-between items-center bg-black/20 shrink-0">
              <h3 className="font-playfair text-lg font-semibold text-foreground">Citas de hoy</h3>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              {todayAppts.length > 0 ? (
                todayAppts.map(a => (
                  <TodayCard key={a.id} appt={a} onStatusChange={handleStatusChange} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center pt-8">
                  {isCurrentWeek ? "Sin citas para hoy" : "Navega a la semana actual para ver el día de hoy"}
                </p>
              )}
            </div>

            {/* Artist legend */}
            {artists.length > 0 && (
              <div className="p-6 border-t border-border shrink-0">
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4">
                  Leyenda Artistas
                </p>
                <div className="space-y-3">
                  {artists.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: PALETTE[i % PALETTE.length].dot }}
                      />
                      <span className="text-sm text-foreground">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ── New cita modal ── */}
      {modalOpen && (
        <NewCitaModal
          artists={artists}
          onClose={closeModal}
          onCreated={handleApptCreated}
        />
      )}

      {/* ── Share modal ── */}
      {shareOpen && (
        <ShareModal bookingUrl={bookingUrl} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}
