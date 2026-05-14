"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Search,
  ChevronDown,
  Clock,
  MoreVertical,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROW_H = 80; // px per hour — matches h-20
const START_H = 9;
const END_H = 20;
const HOURS = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = "dia" | "semana" | "mes";
type ApptStatus = "confirmada" | "pendiente" | "noshow" | "realizada";

interface Appointment {
  id: string;
  clientName: string;
  style: string;
  dayIndex: number; // 0=Mon … 6=Sun
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  artistInitials: string;
  artistName: string;
  status: ApptStatus;
}

// ── Color maps ────────────────────────────────────────────────────────────────

const ARTIST_COLORS: Record<string, { bg: string; border: string; label: string; dot: string }> = {
  ML: { bg: "rgba(139,0,255,0.15)", border: "#8B00FF", label: "#C084FC", dot: "#8B00FF" },
  AR: { bg: "rgba(98,37,155,0.20)", border: "#62259b", label: "#ddb8ff", dot: "#62259b" },
  CV: { bg: "rgba(129,71,185,0.20)", border: "#8147b9", label: "#e0c8ff", dot: "#8147b9" },
};

const STATUS_CFG: Record<ApptStatus, { label: string; color: string; bg: string }> = {
  confirmada: { label: "CONFIRMADA", color: "#52C97A", bg: "#52C97A1A" },
  pendiente:  { label: "PENDIENTE",  color: "#E0B800", bg: "#E0B8001A" },
  noshow:     { label: "NO SHOW",    color: "#FF3B3B", bg: "#FF3B3B1A" },
  realizada:  { label: "REALIZADA",  color: "#988ca2", bg: "#988ca21A" },
};

// ── Appointment data ──────────────────────────────────────────────────────────

const APPOINTMENTS: Appointment[] = [
  {
    id: "1", clientName: "Ana Morales",   style: "Realismo",   dayIndex: 0,
    startHour: 10, startMinute: 0,  durationMinutes: 180,
    artistInitials: "ML", artistName: "Matías L.", status: "confirmada",
  },
  {
    id: "2", clientName: "Valentina Díaz", style: "Neo-trad", dayIndex: 2,
    startHour: 11, startMinute: 0,  durationMinutes: 180,
    artistInitials: "CV", artistName: "Carlos V.", status: "confirmada",
  },
  {
    id: "3", clientName: "Laura Peña",    style: "Minimalista", dayIndex: 1,
    startHour: 14, startMinute: 0,  durationMinutes: 120,
    artistInitials: "AR", artistName: "Ana R.",    status: "confirmada",
  },
  {
    id: "4", clientName: "Carlos Ruiz",   style: "Blackwork",  dayIndex: 0,
    startHour: 15, startMinute: 0,  durationMinutes: 120,
    artistInitials: "ML", artistName: "Matías L.", status: "pendiente",
  },
  {
    id: "5", clientName: "Marcos Solís",  style: "Japonés",    dayIndex: 3,
    startHour: 16, startMinute: 0,  durationMinutes: 180,
    artistInitials: "ML", artistName: "Matías L.", status: "confirmada",
  },
  {
    id: "6", clientName: "Javier K.",     style: "Lettering",  dayIndex: 0,
    startHour: 9,  startMinute: 30, durationMinutes: 120,
    artistInitials: "AR", artistName: "Ana R.",    status: "noshow",
  },
  {
    id: "7", clientName: "Sofía Reyes",   style: "Fine Line",  dayIndex: 4,
    startHour: 11, startMinute: 0,  durationMinutes: 120,
    artistInitials: "ML", artistName: "Matías L.", status: "confirmada",
  },
  {
    id: "8", clientName: "Diego Torres",  style: "Geometric",  dayIndex: 5,
    startHour: 14, startMinute: 0,  durationMinutes: 180,
    artistInitials: "AR", artistName: "Ana R.",    status: "pendiente",
  },
];

// ── Date helpers ──────────────────────────────────────────────────────────────

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function todayDayIndex(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;  // 0=Mon…6=Sun
}

function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const mD = monday.getDate();
  const sD = sunday.getDate();
  const mM = MONTHS[monday.getMonth()];
  const sM = MONTHS[sunday.getMonth()];
  const yr = sunday.getFullYear();
  return monday.getMonth() === sunday.getMonth()
    ? `Lun ${mD} - Dom ${sD} ${mM} ${yr}`
    : `Lun ${mD} ${mM} - Dom ${sD} ${sM} ${yr}`;
}

function fmtTime(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── Appointment block (rendered inside its start-hour cell) ───────────────────

function ApptBlock({ appt }: { appt: Appointment }) {
  const c = ARTIST_COLORS[appt.artistInitials] ?? ARTIST_COLORS.ML;
  const topPx  = (appt.startMinute / 60) * ROW_H;
  const highPx = (appt.durationMinutes / 60) * ROW_H;
  const dim    = appt.status === "noshow";
  const endH   = appt.startHour + Math.floor((appt.startMinute + appt.durationMinutes) / 60);
  const endM   = (appt.startMinute + appt.durationMinutes) % 60;

  return (
    <div
      className="absolute inset-x-1 rounded-r z-10 p-2.5 cursor-pointer hover:brightness-110 transition-all overflow-hidden select-none"
      style={{
        top: topPx,
        height: highPx,
        backgroundColor: dim ? "rgba(80,80,80,0.12)" : c.bg,
        borderLeft: `4px solid ${dim ? "#555" : c.border}`,
        opacity: dim ? 0.55 : 1,
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
      <p className="text-[10px] font-medium leading-tight" style={{ color: c.label }}>
        {appt.style}
      </p>
      {highPx >= 80 && (
        <div className="flex items-center gap-1.5 mt-2">
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

// ── Today sidebar card ────────────────────────────────────────────────────────

function TodayCard({ appt }: { appt: Appointment }) {
  const sc = STATUS_CFG[appt.status];
  const endH = appt.startHour + Math.floor((appt.startMinute + appt.durationMinutes) / 60);
  const endM = (appt.startMinute + appt.durationMinutes) % 60;
  const timeStr = `${fmtTime(appt.startHour, appt.startMinute)} - ${fmtTime(endH, endM)}`;

  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        background: "rgba(13, 0, 16, 0.8)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${appt.status === "pendiente" ? sc.color : "#2D0050"}`,
        borderLeft: `4px solid ${appt.status === "pendiente" ? sc.color : "#2D0050"}`,
        opacity: appt.status === "noshow" ? 0.6 : 1,
      }}
    >
      <div className="flex justify-between items-center">
        <span className="font-mono text-[10px] text-muted-foreground">{timeStr}</span>
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
          <button className="flex-1 py-2 text-[11px] font-bold bg-primary text-white rounded hover:opacity-90 transition-opacity">
            Check-in
          </button>
        </div>
      )}
    </div>
  );
}

// ── Nueva Cita Modal ──────────────────────────────────────────────────────────

function NewCitaModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: "rgba(13, 0, 16, 0.95)", border: "1px solid #2D0050" }}
      >
        {/* Header */}
        <div className="p-8 border-b border-border flex justify-between items-center shrink-0">
          <h3 className="font-playfair text-2xl font-semibold text-foreground">Nueva cita</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {/* Lead search */}
          <div className="space-y-2">
            <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
              Cliente (Lead)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Artista
              </label>
              <select className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none cursor-pointer">
                <option>Matías López</option>
                <option>Ana Ruiz</option>
                <option>Carlos V.</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Fecha
              </label>
              <input
                type="date"
                className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Hora inicio
              </label>
              <input
                type="time"
                defaultValue="10:00"
                className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Duración
              </label>
              <select
                defaultValue="3h 00m"
                className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none cursor-pointer"
              >
                <option>1h 00m</option>
                <option>2h 00m</option>
                <option>3h 00m</option>
                <option>Full day</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Depósito (€)
              </label>
              <input
                type="number"
                placeholder="50"
                className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
              Notas de la sesión
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre el diseño, zona del cuerpo, etc..."
              className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-card border-t border-border flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-bold text-sm border border-border hover:bg-secondary transition-colors text-foreground"
          >
            Cancelar
          </button>
          <button className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all">
            Guardar cita
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const [view, setView]           = useState<ViewMode>("semana");
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterArtist, setFilterArtist] = useState("todos");

  const openModal  = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  // Compute week dates
  const today  = new Date();
  const monday = getMondayOfWeek(addDays(today, weekOffset * 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const isCurrentWeek = weekOffset === 0;
  const todayIdx = todayDayIndex();

  // Filtered appointments for calendar grid
  const visibleAppts =
    filterArtist === "todos"
      ? APPOINTMENTS
      : APPOINTMENTS.filter((a) => a.artistInitials === filterArtist);

  // Today's appointments for sidebar (from static data, matched by day-of-week)
  const todayAppts = [...APPOINTMENTS]
    .filter((a) => a.dayIndex === todayIdx)
    .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Header ── */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-border bg-black/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-5">
          {/* Title */}
          <h2 className="font-playfair text-2xl font-semibold text-foreground">Agenda</h2>

          {/* View toggle */}
          <div className="flex bg-card rounded-lg p-1 border border-border gap-0.5">
            {(["dia", "semana", "mes"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm rounded transition-colors ${
                  view === v
                    ? "bg-primary text-white font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>

          {/* Week nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="text-primary hover:text-foreground transition-colors p-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-foreground min-w-[220px] text-center text-sm">
              {formatWeekRange(monday)}
            </span>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
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
              onChange={(e) => setFilterArtist(e.target.value)}
              className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground appearance-none pr-9 focus:border-primary outline-none cursor-pointer"
            >
              <option value="todos">Todos los artistas</option>
              <option value="ML">Matías López</option>
              <option value="AR">Ana Ruiz</option>
              <option value="CV">Carlos V.</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Nueva cita */}
          <button
            onClick={openModal}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-glow hover:shadow-glow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nueva cita
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Sticky day header row */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border sticky top-0 bg-black z-10 shrink-0">
            {/* Clock icon */}
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
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[80px_repeat(7,1fr)] shrink-0"
              style={{ height: ROW_H }}
            >
              {/* Time label */}
              <div className="border-r border-b border-border flex justify-center pt-2">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>

              {/* Day cells */}
              {weekDays.map((_, dayIdx) => {
                const appts = visibleAppts.filter(
                  (a) => a.dayIndex === dayIdx && a.startHour === hour
                );
                return (
                  <div
                    key={dayIdx}
                    className="border-b border-border relative"
                    style={{
                      borderRight: dayIdx < 6 ? "1px solid hsl(var(--border))" : "none",
                    }}
                  >
                    {appts.map((a) => (
                      <ApptBlock key={a.id} appt={a} />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right sidebar: Citas de hoy */}
        <aside className="w-80 bg-[#090010] border-l border-border flex flex-col overflow-hidden shrink-0">
          <div className="p-6 border-b border-border flex justify-between items-center bg-black/20 shrink-0">
            <h3 className="font-playfair text-lg font-semibold text-foreground">Citas de hoy</h3>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {todayAppts.length > 0 ? (
              todayAppts.map((a) => <TodayCard key={a.id} appt={a} />)
            ) : (
              <p className="text-muted-foreground text-sm text-center pt-8">
                Sin citas para hoy
              </p>
            )}
          </div>

          {/* Artist legend */}
          <div className="p-6 border-t border-border shrink-0">
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4">
              Leyenda Artistas
            </p>
            <div className="space-y-3">
              {[
                { initials: "ML", name: "Matías López" },
                { initials: "AR", name: "Ana Ruiz" },
                { initials: "CV", name: "Carlos V." },
              ].map(({ initials, name }) => (
                <div key={initials} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: ARTIST_COLORS[initials]?.dot }}
                  />
                  <span className="text-sm text-foreground">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modal ── */}
      {modalOpen && <NewCitaModal onClose={closeModal} />}
    </div>
  );
}
