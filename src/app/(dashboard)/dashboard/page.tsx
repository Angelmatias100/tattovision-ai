"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Plus, CalendarPlus, Zap, PenLine, Bell, ArrowRight,
  Calendar, Sparkles, UserPlus,
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PipelineLead { name: string; instagram: string | null; style: string }
interface PipelineCol  { id: string; label: string; count: number; dim: boolean; leads: PipelineLead[] }
interface ApptItem     { time: string; name: string; detail: string }

interface DashboardData {
  business_name:         string
  tv_tokens_balance:     number
  tv_tokens_limit:       number
  leads_this_month:      number
  appointments_today:    number
  pipeline_value:        number
  pipeline:              PipelineCol[]
  today_appointments:    ApptItem[]
  tomorrow_appointments: ApptItem[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

function formatDate() {
  return new Date().toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long",
  }).replace(/^\w/, c => c.toUpperCase());
}

// ── Metric Cards ──────────────────────────────────────────────────────────────

function MetricCard({
  label, value, badge, badgeVariant = "success", children,
}: {
  label: string; value: string; badge?: string;
  badgeVariant?: "success" | "neutral"; children?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <span className="font-mono text-4xl font-medium text-foreground">{value}</span>
        {badge && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded border ${
              badgeVariant === "success"
                ? "bg-[#52C97A1A] border-[#52C97A] text-[#52C97A]"
                : "text-muted-foreground border-transparent italic"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Pipeline column dot colors ────────────────────────────────────────────────

const COLUMN_DOT: Record<string, string> = {
  nuevo:      "bg-primary",
  consulta:   "bg-[#C084FC]",
  confirmado: "bg-green-500/80",
  realizado:  "bg-muted-foreground",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const greeting = getGreeting();
  const { user }  = useUser();
  const firstName = user?.firstName ?? "Artista";

  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const tokens    = data?.tv_tokens_balance ?? 0;
  const tokensMax = data?.tv_tokens_limit   ?? 500;
  const tokensPct = Math.min(100, Math.round((tokens / tokensMax) * 100));

  const businessName = data?.business_name ?? "Mi Estudio";

  const isNewUser =
    !loading &&
    !error &&
    data !== null &&
    data.leads_this_month === 0 &&
    data.pipeline.every((col) => col.count === 0);

  return (
    <div className="p-10 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="font-playfair text-3xl font-semibold text-foreground">
            {greeting}, {firstName} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {formatDate()} · {businessName}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-[10px] text-white font-bold rounded-full flex items-center justify-center border-2 border-background">
              3
            </span>
          </button>
          <div className="w-12 h-12 rounded-full border-2 border-primary/60 bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
            {firstName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/crm">
          <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo lead
          </button>
        </Link>
        <Link href="/agenda">
          <button className="border border-border bg-card text-[#C084FC] px-5 py-2.5 rounded-lg font-bold text-sm hover:border-primary transition-all flex items-center gap-2">
            <CalendarPlus className="w-4 h-4" /> Nueva cita
          </button>
        </Link>
        <Link href="/campanas">
          <button className="border border-border bg-card text-foreground px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-secondary transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" /> Crear campaña
          </button>
        </Link>
        <Link href="/contenido">
          <button className="border border-border bg-card text-foreground px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-secondary transition-all flex items-center gap-2">
            <PenLine className="w-4 h-4" /> Generar contenido
          </button>
        </Link>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Leads este mes"
          value={loading ? "—" : String(data!.leads_this_month)}
          badge={loading ? "" : undefined}
        />
        <MetricCard
          label="Citas hoy"
          value={loading ? "—" : String(data!.appointments_today)}
          badge={loading ? "" : undefined}
        />
        <MetricCard
          label="Pipeline"
          value={loading ? "—" : `$${Math.round(data!.pipeline_value).toLocaleString("es-CL")}`}
          badge="Valor activo"
          badgeVariant="neutral"
        />
        <MetricCard
          label="TV Tokens"
          value={loading ? "—" : `${tokens}/${tokensMax}`}
          badge={loading ? "" : `${tokensPct}%`}
          badgeVariant="neutral"
        >
          {!loading && (
            <div className="mt-3 w-full h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${tokensPct}%` }} />
            </div>
          )}
        </MetricCard>
      </div>

      {/* ── Main Grid: Pipeline + Citas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
        {/* Pipeline (60%) */}
        <section className="lg:col-span-6 bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-playfair text-xl font-semibold text-foreground">
              Pipeline de leads
            </h4>
            <Link href="/crm" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              Ver todos los leads <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {[0,1,2,3].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-border rounded animate-pulse mb-4" />
                  {[0,1].map(j => (
                    <div key={j} className="h-16 bg-[#1A0025] rounded border border-border/30 animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {(data?.pipeline ?? []).map((col) => (
                <div key={col.id} className={col.dim ? "space-y-3 opacity-60" : "space-y-3"}>
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <span className={`w-2 h-2 rounded-full ${COLUMN_DOT[col.id] ?? "bg-muted-foreground"}`} />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                      {col.label} ({col.count})
                    </span>
                  </div>
                  {col.leads.map((lead) => (
                    <div
                      key={lead.name}
                      className="bg-[#1A0025] p-3 rounded border border-border/30 text-xs space-y-1 cursor-pointer hover:border-primary/40 transition-colors"
                    >
                      <p className={`font-bold text-foreground ${col.dim ? "line-through" : ""}`}>
                        {lead.name}
                      </p>
                      {col.dim ? (
                        <p className="text-[10px] text-muted-foreground">Completado</p>
                      ) : (
                        <>
                          {lead.instagram && <p className="text-primary/80">{lead.instagram}</p>}
                          {lead.style && (
                            <p className="text-[10px] text-muted-foreground">{lead.style}</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {col.leads.length === 0 && (
                    <p className="text-[10px] text-muted-foreground/40 italic text-center pt-2">
                      Sin leads
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Próximas citas (40%) */}
        <section className="lg:col-span-4 bg-card border border-border rounded-lg p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-playfair text-xl font-semibold text-foreground">
              Próximas citas
            </h4>
            <Link href="/agenda" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              Ver agenda <Calendar className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-6 flex-1">
            {/* Today */}
            <div>
              <p className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase mb-3">HOY</p>
              {loading ? (
                <div className="space-y-3">
                  {[0,1].map(i => (
                    <div key={i} className="h-16 bg-secondary/40 rounded animate-pulse" />
                  ))}
                </div>
              ) : (data?.today_appointments ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Sin citas para hoy</p>
              ) : (
                <div className="space-y-3">
                  {(data?.today_appointments ?? []).map((cita, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-secondary/40 p-4 rounded border-l-2 border-primary"
                    >
                      <span className="font-mono text-base text-foreground w-14 shrink-0">{cita.time}</span>
                      <div>
                        <p className="font-bold text-foreground text-sm">{cita.name}</p>
                        {cita.detail && (
                          <p className="text-xs text-muted-foreground">{cita.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tomorrow */}
            <div>
              <p className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-3">MAÑANA</p>
              {loading ? (
                <div className="h-16 bg-card rounded animate-pulse" />
              ) : (data?.tomorrow_appointments ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Sin citas para mañana</p>
              ) : (
                <div className="space-y-3">
                  {(data?.tomorrow_appointments ?? []).map((cita, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-card p-4 rounded border border-border/30"
                    >
                      <span className="font-mono text-base text-muted-foreground w-14 shrink-0">{cita.time}</span>
                      <div>
                        <p className="font-bold text-foreground text-sm">{cita.name}</p>
                        {cita.detail && (
                          <p className="text-xs text-muted-foreground">{cita.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Link href="/agenda">
            <button className="mt-6 w-full py-2.5 text-sm font-bold text-muted-foreground border border-border rounded hover:border-primary hover:text-foreground transition-all">
              Ver agenda completa →
            </button>
          </Link>
        </section>
      </div>

      {/* ── Bottom card: onboarding tips for new users / AI card for active users ── */}
      {isNewUser ? (
        <section
          className="bg-card border border-border rounded-xl p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-5 h-5 text-primary" />
            <h5 className="font-playfair text-xl font-semibold text-foreground">
              Primeros pasos
            </h5>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: 1,
                title: "Agrega tu primer lead",
                desc: "Registra un prospecto del CRM para empezar a gestionar tus clientes.",
                href: "/crm",
                cta: "Ir al CRM",
              },
              {
                step: 2,
                title: "Agenda una cita",
                desc: "Organiza tus sesiones y evita huecos en tu calendario.",
                href: "/agenda",
                cta: "Ver agenda",
              },
              {
                step: 3,
                title: "Crea contenido con IA",
                desc: "Genera reels, historias y posts optimizados para tu estudio.",
                href: "/contenido",
                cta: "Generar contenido",
              },
              {
                step: 4,
                title: "Lanza tu primera campaña",
                desc: "Conecta Meta Ads y lanza anuncios dirigidos a tu audiencia ideal.",
                href: "/campanas",
                cta: "Ver campañas",
              },
            ].map(({ step, title, desc, href, cta }) => (
              <div
                key={step}
                className="flex flex-col gap-3 p-5 rounded-lg border border-border/60 hover:border-primary/40 transition-colors"
                style={{ background: "rgba(26,0,37,0.4)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "rgba(139,0,255,0.15)", color: "#C084FC", border: "1px solid rgba(139,0,255,0.3)" }}
                  >
                    {step}
                  </span>
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{desc}</p>
                <Link href={href} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  {cta} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section
          className="relative bg-card border border-primary/40 rounded-xl p-8 overflow-hidden"
          style={{ boxShadow: "0 0 40px rgba(139,0,255,0.15)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h5 className="font-playfair text-xl font-semibold text-foreground">
                  Recomendación de TattooVision AI
                </h5>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Revisa tu{" "}
                <Link href="/crm" className="text-primary font-bold hover:underline">
                  pipeline de leads
                </Link>{" "}
                y lanza una campaña de reactivación para leads sin respuesta hace más de 48 horas.
                Una automatización puede aumentar tu tasa de conversión en un{" "}
                <span className="text-[#C084FC] font-bold">15%</span> esta semana.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/campanas">
                  <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Generar campaña con IA
                  </button>
                </Link>
                <Link href="/crm">
                  <button className="border border-border bg-transparent text-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/10 transition-all">
                    Ver leads sin respuesta
                  </button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex w-56 h-56 shrink-0 items-center justify-center opacity-40">
              <AiOrb />
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="mt-8 border-t border-border py-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
        <p>© 2024 TattooVision AI. Todos los derechos reservados.</p>
        <div className="flex gap-6 mt-3 md:mt-0">
          {["Privacidad", "Términos", "Soporte", "Contacto"].map((item) => (
            <a key={item} href="#" className="hover:text-foreground transition-colors">{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ── Decorative AI Orb ─────────────────────────────────────────────────────────

function AiOrb() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="orbGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#8B00FF" stopOpacity="0.6" />
          <stop offset="60%"  stopColor="#4B0082" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0"   />
        </radialGradient>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#C084FC" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8B00FF" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#orbGrad)" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="#8B00FF" strokeWidth="0.5" strokeOpacity="0.6" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="#C084FC" strokeWidth="0.5" strokeOpacity="0.4" />
      <circle cx="100" cy="100" r="30" fill="none" stroke="#8B00FF" strokeWidth="0.5" strokeOpacity="0.5" />
      <circle cx="100" cy="100" r="22" fill="url(#coreGrad)" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return <circle key={deg} cx={100 + 70 * Math.cos(rad)} cy={100 + 70 * Math.sin(rad)} r="3" fill="#C084FC" fillOpacity="0.7" />;
      })}
      <path d="M70 40 Q100 70 130 100 Q100 130 70 160" fill="none" stroke="#8B00FF" strokeWidth="1.5" strokeOpacity="0.5" />
      <path d="M130 40 Q100 70 70 100 Q100 130 130 160" fill="none" stroke="#C084FC" strokeWidth="1.5" strokeOpacity="0.4" />
      {[55, 70, 85, 100, 115, 130, 145].map((y) => {
        const t = (y - 40) / 120;
        return <line key={y} x1={70 + 30 * Math.sin(t * Math.PI)} y1={y} x2={130 - 30 * Math.sin(t * Math.PI)} y2={y} stroke="#8B00FF" strokeWidth="0.8" strokeOpacity="0.3" />;
      })}
      <circle cx="100" cy="100" r="5" fill="#ffffff" fillOpacity="0.9" />
    </svg>
  );
}
