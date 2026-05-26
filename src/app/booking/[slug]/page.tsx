"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Check, Loader2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

interface Studio {
  name: string;
  city: string | null;
  styles: string[];
}

interface BookingForm {
  name: string;
  phone: string;
  email: string;
  styleInterest: string;
  bodyPart: string;
  budget: string;
  notes: string;
}

const HOUR_SLOTS = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
const DAY_LABELS = ["Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const BUDGET_OPTIONS = [
  { value: "", label: "Sin presupuesto definido" },
  { value: "hasta-100",   label: "Hasta $100" },
  { value: "100-300",     label: "$100 – $300" },
  { value: "300-500",     label: "$300 – $500" },
  { value: "500-1000",    label: "$500 – $1.000" },
  { value: "mas-de-1000", label: "Más de $1.000" },
];

const BODY_PARTS = [
  "Brazo","Antebrazo","Hombro","Espalda","Pecho",
  "Pierna","Muslo","Cuello","Costillas","Mano","Pie","Otro",
];

// ── Helpers ───────────────────────────────────────────────────────

function getWeekStart(base: Date): Date {
  const d = new Date(base);
  const day = d.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function isPast(dateStr: string, time: string): boolean {
  const now = new Date();
  const dt = new Date(`${dateStr}T${time}:00`);
  return dt <= now;
}

// ── Page ──────────────────────────────────────────────────────────

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();

  const [studio,      setStudio]      = useState<Studio | null>(null);
  const [bookedSet,   setBookedSet]   = useState<Set<string>>(new Set());
  const [loadError,   setLoadError]   = useState<string | null>(null);

  const [weekStart,   setWeekStart]   = useState<Date>(() => getWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime,setSelectedTime]= useState<string | null>(null);

  const [form, setForm] = useState<BookingForm>({
    name: "", phone: "", email: "",
    styleInterest: "", bodyPart: "", budget: "", notes: "",
  });

  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const weekDays = getWeekDays(weekStart);
  const firstDay = weekDays[0];
  const lastDay  = weekDays[5];
  const rangeLabel = `${firstDay.getDate()} – ${lastDay.getDate()} ${MONTH_NAMES[lastDay.getMonth()]} ${lastDay.getFullYear()}`;

  // Fetch studio data
  const loadStudio = useCallback(async () => {
    try {
      const res = await fetch(`/api/booking/${slug}`);
      if (!res.ok) { setLoadError("Estudio no encontrado."); return; }
      const data = await res.json();
      setStudio(data.business);
      setBookedSet(new Set<string>(data.bookedSlots as string[]));
    } catch {
      setLoadError("Error al cargar el estudio.");
    }
  }, [slug]);

  useEffect(() => { loadStudio(); }, [loadStudio]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(prev => prev === dateStr ? null : dateStr);
    setSelectedTime(null);
  };

  const handleSlotClick = (time: string) => {
    setSelectedTime(prev => prev === time ? null : time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !selectedTime) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/booking/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: selectedDay,
          time: selectedTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar solicitud");
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setSubmitting(false);
    }
  };

  const today = toDateStr(new Date());

  // ── Loading / Error ──────────────────────────────────────────────
  if (loadError) {
    return (
      <main className="min-h-screen bg-[#080010] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">{loadError}</p>
          <p className="text-muted-foreground text-sm mt-2">Verifica el link compartido por el estudio.</p>
        </div>
      </main>
    );
  }

  if (!studio) {
    return (
      <main className="min-h-screen bg-[#080010] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    );
  }

  // ── Confirmation ─────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#080010] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "rgba(82,201,122,0.15)", border: "2px solid rgba(82,201,122,0.4)" }}
          >
            <Check className="w-10 h-10" style={{ color: "#52C97A" }} />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-white">¡Solicitud enviada!</h1>
          <p className="text-[#988ca2] leading-relaxed">
            Te contactaremos pronto para confirmar tu cita en{" "}
            <span className="text-white font-semibold">{studio.name}</span>.
            <br />
            <span className="text-sm mt-2 block">
              Fecha: <strong className="text-[#C084FC]">{selectedDay}</strong> a las{" "}
              <strong className="text-[#C084FC]">{selectedTime}</strong>
            </span>
          </p>
          <p className="text-xs text-[#5a4a6a]">
            Reserva realizada con TattooVision AI
          </p>
        </div>
      </main>
    );
  }

  // ── Main page ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#080010] text-white">
      {/* Top bar */}
      <div className="border-b border-[#2D0050]/60 px-6 py-4 flex items-center justify-between">
        <span className="font-playfair text-sm font-bold tracking-wide text-[#C084FC] uppercase">
          TattooVision AI
        </span>
        <span className="text-xs text-[#5a4a6a]">Reserva online</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">

        {/* ── Studio header ── */}
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 font-playfair font-bold text-xl text-white"
            style={{ background: "linear-gradient(135deg, #8B00FF, #4B0082)" }}
          >
            {studio.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-white">{studio.name}</h1>
            {studio.city && (
              <p className="flex items-center gap-1 text-sm text-[#988ca2] mt-0.5">
                <MapPin className="w-3.5 h-3.5" /> {studio.city}
              </p>
            )}
            {studio.styles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {studio.styles.map(s => (
                  <span
                    key={s}
                    className="px-2 py-0.5 text-[10px] font-bold rounded"
                    style={{ background: "rgba(139,0,255,0.15)", color: "#C084FC", border: "1px solid rgba(139,0,255,0.25)" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Calendar ── */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "rgba(26,0,37,0.8)", border: "1px solid rgba(45,0,80,0.6)" }}
        >
          <h2 className="font-playfair text-lg font-semibold text-white mb-5">
            Elige una fecha disponible
          </h2>

          {/* Week navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevWeek}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[#988ca2] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-white">{rangeLabel}</span>
            <button
              onClick={nextWeek}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[#988ca2] hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            {weekDays.map((day, i) => {
              const dateStr  = toDateStr(day);
              const isPastDay = dateStr < today;
              const isSelected = selectedDay === dateStr;
              const isToday   = dateStr === today;

              return (
                <button
                  key={dateStr}
                  onClick={() => !isPastDay && handleDayClick(dateStr)}
                  disabled={isPastDay}
                  className="flex flex-col items-center py-3 rounded-xl text-center transition-all duration-150"
                  style={{
                    background: isSelected
                      ? "rgba(139,0,255,0.25)"
                      : "rgba(255,255,255,0.03)",
                    border: isSelected
                      ? "1px solid rgba(139,0,255,0.6)"
                      : isToday
                      ? "1px solid rgba(139,0,255,0.25)"
                      : "1px solid rgba(255,255,255,0.06)",
                    opacity: isPastDay ? 0.3 : 1,
                    cursor: isPastDay ? "not-allowed" : "pointer",
                  }}
                >
                  <span className="text-[10px] font-bold text-[#988ca2] uppercase tracking-wider">
                    {DAY_LABELS[i]}
                  </span>
                  <span
                    className="text-lg font-bold mt-0.5"
                    style={{ color: isSelected ? "#C084FC" : isToday ? "#8B00FF" : "#fff" }}
                  >
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          {selectedDay && (
            <div className="border-t border-[#2D0050]/50 pt-4">
              <p className="text-xs font-bold text-[#988ca2] uppercase tracking-widest mb-3">
                Horarios disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {HOUR_SLOTS.map(time => {
                  const key       = `${selectedDay}_${time}`;
                  const isBooked  = bookedSet.has(key);
                  const pastSlot  = isPast(selectedDay, time);
                  const unavail   = isBooked || pastSlot;
                  const isSelTime = selectedTime === time;

                  return (
                    <button
                      key={time}
                      onClick={() => !unavail && handleSlotClick(time)}
                      disabled={unavail}
                      className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
                      style={{
                        background: isSelTime
                          ? "rgba(139,0,255,0.3)"
                          : unavail
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(255,255,255,0.06)",
                        border: isSelTime
                          ? "1px solid rgba(139,0,255,0.7)"
                          : "1px solid rgba(255,255,255,0.08)",
                        color: isSelTime
                          ? "#C084FC"
                          : unavail
                          ? "#3a2a4a"
                          : "#ccc",
                        cursor: unavail ? "not-allowed" : "pointer",
                        textDecoration: unavail ? "line-through" : "none",
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── Booking form ── */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "rgba(26,0,37,0.8)", border: "1px solid rgba(45,0,80,0.6)" }}
        >
          <h2 className="font-playfair text-lg font-semibold text-white mb-5">
            Tu información
          </h2>

          {(!selectedDay || !selectedTime) && (
            <p className="text-sm text-[#988ca2] mb-4">
              ← Selecciona una fecha y hora en el calendario para continuar.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#988ca2] uppercase tracking-wider mb-1.5">
                  Nombre <span className="text-primary">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Tu nombre completo"
                  className="w-full bg-[#0D0010] border border-[#2D0050] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#4a3060] focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#988ca2] uppercase tracking-wider mb-1.5">
                  Teléfono / WhatsApp <span className="text-primary">*</span>
                </label>
                <input
                  required
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+54 9 11 1234 5678"
                  className="w-full bg-[#0D0010] border border-[#2D0050] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#4a3060] focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#988ca2] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com"
                className="w-full bg-[#0D0010] border border-[#2D0050] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#4a3060] focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#988ca2] uppercase tracking-wider mb-1.5">
                  Estilo de tatuaje
                </label>
                <select
                  value={form.styleInterest}
                  onChange={e => setForm(p => ({ ...p, styleInterest: e.target.value }))}
                  className="w-full bg-[#0D0010] border border-[#2D0050] rounded-lg px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-colors"
                >
                  <option value="">Seleccionar estilo</option>
                  {studio.styles.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#988ca2] uppercase tracking-wider mb-1.5">
                  Parte del cuerpo
                </label>
                <select
                  value={form.bodyPart}
                  onChange={e => setForm(p => ({ ...p, bodyPart: e.target.value }))}
                  className="w-full bg-[#0D0010] border border-[#2D0050] rounded-lg px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-colors"
                >
                  <option value="">Seleccionar zona</option>
                  {BODY_PARTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#988ca2] uppercase tracking-wider mb-1.5">
                Presupuesto aproximado
              </label>
              <select
                value={form.budget}
                onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                className="w-full bg-[#0D0010] border border-[#2D0050] rounded-lg px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-colors"
              >
                {BUDGET_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#988ca2] uppercase tracking-wider mb-1.5">
                Descripción / referencia
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Describe tu idea, tamaño aproximado, colores, referencias..."
                className="w-full bg-[#0D0010] border border-[#2D0050] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#4a3060] focus:border-primary outline-none transition-colors resize-none"
              />
            </div>

            {/* Selected slot summary */}
            {selectedDay && selectedTime && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ background: "rgba(139,0,255,0.1)", border: "1px solid rgba(139,0,255,0.25)" }}
              >
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-white">
                  Fecha seleccionada: <strong className="text-[#C084FC]">{selectedDay}</strong>{" "}
                  a las <strong className="text-[#C084FC]">{selectedTime}</strong>
                </span>
              </div>
            )}

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={!selectedDay || !selectedTime || submitting}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #8B00FF 0%, #6200B3 100%)",
                boxShadow: selectedDay && selectedTime ? "0 0 24px rgba(139,0,255,0.45)" : "none",
                color: "#fff",
              }}
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Enviando…</>
              ) : (
                "Solicitar cita"
              )}
            </button>
          </form>
        </section>

        <p className="text-center text-xs text-[#3a2a4a] pb-6">
          Reserva gestionada con TattooVision AI
        </p>
      </div>
    </main>
  );
}
