"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, X, Target, Megaphone, Globe, MessageSquare, MapPin, Video,
  Upload, ChevronLeft, ChevronRight, Sparkles, Zap,
  Users, Rocket, Pause, Play, Edit, BarChart2,
  LayoutList, RefreshCw, AlertCircle, Check, Heart, ExternalLink,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DbCampaign {
  id:            string
  name:          string
  status:        string   // DB: draft | active | paused | completed | archived
  status_ui:     string   // UI: borrador | activa | pausada | realizada | archivada
  budget_daily:  number | null
  leads_count:   number
  spend:         number
  copy_headline: string | null
  copy_body:     string | null
  copy_cta:      string | null
  objective:     string | null
  start_date:    string | null
  end_date:      string | null
  ai_strategy:   { angle?: { id: string; name: string } } | null
  created_at:    string
}

interface AngleOption {
  id:          string
  name:        string
  description: string
  why:         string
  tone:        string
  audience:    string
  budget:      string
}

interface HeadlineOption { text: string }
interface BodyOption     { text: string; length: "Corto" | "Medio" | "Largo" }
interface CtaRecommendation {
  recommended: string
  reason:      string
  options:     string[]
}
interface CopyOptions {
  headlines: HeadlineOption[]
  bodies:    BodyOption[]
  cta:       CtaRecommendation
}

// ── Static data ───────────────────────────────────────────────────────────────

const OBJECTIVES = [
  { id: "leads",    icon: Target,        label: "Generación de leads",     desc: "Captura datos de clientes interesados" },
  { id: "brand",    icon: Megaphone,     label: "Reconocimiento de marca", desc: "Aumenta la visibilidad de tu estudio" },
  { id: "traffic",  icon: Globe,         label: "Tráfico al sitio web",    desc: "Dirige usuarios a tu portfolio online" },
  { id: "messages", icon: MessageSquare, label: "Mensajes directos",       desc: "Recibe consultas por Instagram DM" },
  { id: "visits",   icon: MapPin,        label: "Visitas a la tienda",     desc: "Atrae clientes a tu estudio físico" },
  { id: "video",    icon: Video,         label: "Reproducción de videos",  desc: "Muestra tu proceso de tatuaje" },
];

const STEP_LABELS = ["Objetivo", "Propuesta IA", "Copy", "Presupuesto", "Revisión"];

const PROGRESS_STEPS = [
  "Analizando tu negocio...",
  "Identificando tu público ideal...",
  "Evaluando ángulos estratégicos...",
  "Construyendo propuestas únicas...",
  "Calculando impacto estimado...",
  "Preparando tus opciones...",
];

const STEP_DURATIONS = [600, 800, 900, 1100, 800, 600];

const ANGLE_ICONS: Record<string, typeof Heart> = {
  emocional:    Heart,
  social_proof: Users,
  urgencia:     Zap,
};

const ANGLE_COLORS: Record<string, string> = {
  emocional:    "#E879A0",
  social_proof: "#60A5FA",
  urgencia:     "#FBBF24",
};

const BODY_LENGTH_COLORS: Record<string, string> = {
  Corto: "#52C97A",
  Medio: "#60A5FA",
  Largo: "#C084FC",
};

// ── Slide-in reveal wrapper ────────────────────────────────────────────────────

function RevealCard({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(22px)",
        boxShadow: visible ? "0 0 28px rgba(139,0,255,0.14)" : "0 0 0px rgba(139,0,255,0)",
        transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease-out",
        borderRadius: "12px",
      }}
    >
      {children}
    </div>
  );
}

// ── Angle card (Step 2) ────────────────────────────────────────────────────────

function AngleCard({ angle, selected, onSelect }: { angle: AngleOption; selected: boolean; onSelect: () => void }) {
  const Icon        = ANGLE_ICONS[angle.id] ?? Sparkles;
  const accentColor = ANGLE_COLORS[angle.id] ?? "#8B00FF";
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl border transition-all duration-300"
      style={{
        background: selected ? "rgba(139,0,255,0.10)" : "#0D0010",
        border:     selected ? "1px solid rgba(139,0,255,0.7)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow:  selected ? "0 0 24px rgba(139,0,255,0.18)" : "none",
        padding: "18px 20px",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}50` }}>
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-none mb-1">{angle.name}</p>
            <p className="text-[11px] text-muted-foreground">{angle.description}</p>
          </div>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200" style={{ background: selected ? "#8B00FF" : "transparent", border: selected ? "1px solid #8B00FF" : "1px solid rgba(255,255,255,0.2)" }}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
      <div className="mb-2.5 pl-12">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Por qué te lo recomendamos</p>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{angle.why}</p>
      </div>
      <div className="pl-12">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Tono y enfoque</p>
        <p className="text-[12px] text-foreground italic leading-relaxed">{angle.tone}</p>
      </div>
    </button>
  );
}

// ── Step 2: 3 Angle Selector ──────────────────────────────────────────────────

function Step2AiProposal({
  isGenerating, angles, error, selectedAngle, onSelectAngle, onRetry, onContinue,
}: {
  isGenerating: boolean; angles: AngleOption[] | null; error: string | null;
  selectedAngle: AngleOption | null; onSelectAngle: (a: AngleOption) => void;
  onRetry: () => void; onContinue: () => void;
}) {
  const [currentStep,    setCurrentStep]    = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [animDone,       setAnimDone]       = useState(false);
  const [showSections,   setShowSections]   = useState(false);
  const [revealPhase,    setRevealPhase]    = useState(0);
  const [showComplete,   setShowComplete]   = useState(false);

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    STEP_DURATIONS.forEach((dur, i) => {
      ids.push(setTimeout(() => setCurrentStep(i), elapsed));
      ids.push(setTimeout(() => setCompletedSteps(prev => [...prev, i]), elapsed + dur * 0.85));
      elapsed += dur;
    });
    ids.push(setTimeout(() => setAnimDone(true), elapsed));
    return () => ids.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!animDone || isGenerating || !angles || angles.length === 0) return;
    setRevealPhase(0);
    setShowComplete(false);
    setShowSections(true);
    const ids: ReturnType<typeof setTimeout>[] = [];
    [0, 350, 700].forEach((delay, i) => ids.push(setTimeout(() => setRevealPhase(i + 1), delay)));
    ids.push(setTimeout(() => setShowComplete(true), 1200));
    return () => ids.forEach(clearTimeout);
  }, [animDone, isGenerating, angles]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-destructive opacity-70" />
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
        <button onClick={onRetry} className="px-6 py-2 border border-primary text-primary rounded-lg font-bold text-sm hover:bg-primary/10 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSections ? (
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <h4 className="font-playfair text-xl font-semibold text-foreground">3 ángulos recomendados para tu campaña</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Selecciona el que mejor representa tu estudio</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h4 className="font-playfair text-xl font-semibold text-foreground">TattooVision AI está evaluando tus opciones…</h4>
        </div>
      )}

      {!showSections && (
        <div className="space-y-3 py-2">
          {PROGRESS_STEPS.map((label, i) => {
            const isDone    = completedSteps.includes(i);
            const isActive  = currentStep === i && !isDone;
            const isPending = currentStep < i;
            return (
              <div key={i} className="flex items-center gap-3 transition-all duration-300" style={{ opacity: isPending ? 0.28 : 1 }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-400"
                  style={{ background: isDone ? "rgba(82,201,122,0.25)" : isActive ? "rgba(139,0,255,0.18)" : "rgba(255,255,255,0.04)", border: isDone ? "1px solid #52C97A" : isActive ? "1px solid #8B00FF" : "1px solid rgba(255,255,255,0.08)", boxShadow: isActive ? "0 0 10px rgba(139,0,255,0.35)" : "none" }}>
                  {isDone ? <Check className="w-3.5 h-3.5 text-[#52C97A]" /> : isActive ? <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/25" />}
                </div>
                <span className="text-sm font-mono transition-all duration-300" style={{ color: isDone ? "#52C97A" : isActive ? "#C084FC" : "#4c4356", fontWeight: isActive ? 700 : 400, textShadow: isActive ? "0 0 12px rgba(139,0,255,0.5)" : "none" }}>
                  {label}
                </span>
              </div>
            );
          })}
          {animDone && isGenerating && (
            <div className="flex items-center gap-2 pt-1 pl-10">
              <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin" />
              <span className="text-xs text-muted-foreground font-mono">Finalizando análisis…</span>
            </div>
          )}
        </div>
      )}

      {showSections && isGenerating && (
        <div className="flex items-center gap-3 py-3">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
          <span className="text-sm text-muted-foreground">Regenerando ángulos…</span>
        </div>
      )}

      {showSections && !isGenerating && angles && (
        <div className="space-y-3">
          {angles.map((angle, i) => (
            <RevealCard key={angle.id} visible={revealPhase > i}>
              <AngleCard angle={angle} selected={selectedAngle?.id === angle.id} onSelect={() => onSelectAngle(angle)} />
            </RevealCard>
          ))}
          {showComplete && (
            <div className="flex items-center justify-between pt-1" style={{ animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
              <p className="text-xs text-muted-foreground">
                {selectedAngle ? `✓ Seleccionado: ${selectedAngle.name}` : "Selecciona un ángulo para continuar"}
              </p>
              <button onClick={onContinue} disabled={!selectedAngle} className="px-7 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                Continuar al paso 3 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ── Step 3: AI Copy Generator ─────────────────────────────────────────────────

function Step3CopyGen({
  isGenerating, copyOptions, error, selectedAngle,
  headline, setHeadline, body, setBody, cta, setCta, onRetry, onRegenerate,
}: {
  isGenerating: boolean; copyOptions: CopyOptions | null; error: string | null;
  selectedAngle: AngleOption | null; headline: string; setHeadline: (v: string) => void;
  body: string; setBody: (v: string) => void; cta: string; setCta: (v: string) => void;
  onRetry: () => void; onRegenerate: () => void;
}) {
  const [selectedHIdx, setSelectedHIdx] = useState<number | null>(null);
  const [selectedBIdx, setSelectedBIdx] = useState<number | null>(null);

  const prevCopyRef = useRef<CopyOptions | null>(null);
  useEffect(() => {
    if (copyOptions && copyOptions !== prevCopyRef.current) {
      prevCopyRef.current = copyOptions;
      setSelectedHIdx(0);
      setSelectedBIdx(0);
    }
  }, [copyOptions]);

  const accentColor = selectedAngle ? (ANGLE_COLORS[selectedAngle.id] ?? "#8B00FF") : "#8B00FF";
  const AngleIcon   = selectedAngle ? (ANGLE_ICONS[selectedAngle.id] ?? Sparkles)    : null;

  if (isGenerating || (!copyOptions && !error)) {
    return (
      <div className="space-y-5">
        {selectedAngle && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}45` }}>
              {AngleIcon && <AngleIcon className="w-3.5 h-3.5" style={{ color: accentColor }} />}
              <span className="text-xs font-bold" style={{ color: accentColor }}>{selectedAngle.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs text-muted-foreground">Generando copy…</span>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="h-4 w-36 bg-[#0D0010] rounded animate-pulse" />
          {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl border border-border/30 animate-pulse" style={{ background: "#0D0010", opacity: 1.1 - i * 0.2 }} />)}
        </div>
        <div className="space-y-2">
          <div className="h-4 w-44 bg-[#0D0010] rounded animate-pulse" />
          {[1,2,3].map(i => <div key={i} className="rounded-xl border border-border/30 animate-pulse" style={{ background: "#0D0010", height: `${52 + i * 12}px`, opacity: 1.1 - i * 0.2 }} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-destructive opacity-70" />
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
        <button onClick={onRetry} className="px-6 py-2 border border-primary text-primary rounded-lg font-bold text-sm hover:bg-primary/10 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  if (!copyOptions) return null;

  return (
    <div className="space-y-6">
      {selectedAngle && (
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}45` }}>
            {AngleIcon && <AngleIcon className="w-3.5 h-3.5" style={{ color: accentColor }} />}
            <span className="text-xs font-bold" style={{ color: accentColor }}>{selectedAngle.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">Copy adaptado a este ángulo</span>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">Titular — elige una opción</label>
        </div>
        <div className="space-y-2">
          {copyOptions.headlines.map((h, i) => {
            const chars    = h.text.length;
            const selected = selectedHIdx === i;
            const over     = chars > 40;
            return (
              <button key={i} onClick={() => { setSelectedHIdx(i); setHeadline(h.text); }}
                className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3"
                style={{ background: selected ? "rgba(139,0,255,0.10)" : "#0D0010", border: selected ? "1px solid rgba(139,0,255,0.65)" : "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-sm text-foreground flex-1 text-left">{h.text}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px]" style={{ color: over ? "#F87171" : "#6b7280" }}>{chars}/40</span>
                  {selected && <Check className="w-3.5 h-3.5 text-primary" />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="space-y-1">
          <input value={headline} onChange={e => setHeadline(e.target.value)} maxLength={40} placeholder="O escribe tu propio titular…"
            className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors" />
          <div className="flex justify-between items-center">
            <button onClick={onRegenerate} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="w-3 h-3" /> Generar más opciones
            </button>
            <p className="font-mono text-[10px] text-muted-foreground">{headline.length}/40</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">Cuerpo del anuncio — elige una variación</label>
        </div>
        <div className="space-y-2">
          {copyOptions.bodies.map((b, i) => {
            const chars    = b.text.length;
            const selected = selectedBIdx === i;
            const lc       = BODY_LENGTH_COLORS[b.length] ?? "#C084FC";
            return (
              <button key={i} onClick={() => { setSelectedBIdx(i); setBody(b.text); }}
                className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200"
                style={{ background: selected ? "rgba(139,0,255,0.08)" : "#0D0010", border: selected ? "1px solid rgba(139,0,255,0.65)" : "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: lc }}>{b.length}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{chars} chars</span>
                    {selected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed text-left">{b.text}</p>
              </button>
            );
          })}
        </div>
        <div className="space-y-1">
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} maxLength={200} placeholder="O edita el cuerpo de tu anuncio…"
            className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-none transition-colors" />
          <p className="text-right font-mono text-[10px] text-muted-foreground">{body.length}/200</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">Llamada a la acción</label>
        </div>
        <div className="px-4 py-3 rounded-xl flex items-start gap-3" style={{ background: "rgba(139,0,255,0.06)", border: "1px solid rgba(139,0,255,0.20)" }}>
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">{copyOptions.cta.reason}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {copyOptions.cta.options.map(option => {
            const active = cta === option;
            return (
              <button key={option} onClick={() => setCta(option)}
                className="px-4 py-2 rounded-lg border text-sm font-bold transition-all duration-200"
                style={{ background: active ? "rgba(139,0,255,0.15)" : "#0D0010", border: active ? "1px solid rgba(139,0,255,0.7)" : "1px solid rgba(255,255,255,0.12)", color: active ? "#C084FC" : "#6b7280", boxShadow: active ? "0 0 12px rgba(139,0,255,0.15)" : "none" }}>
                {option}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">Creativo (imagen / video)</label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Arrastra tu imagen o video aquí</p>
          <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG o MP4 · Máx 30MB</p>
          <button className="mt-4 px-4 py-2 text-xs font-bold border border-border rounded-lg hover:bg-secondary transition-colors text-foreground">Seleccionar archivo</button>
        </div>
      </section>
    </div>
  );
}

// ── Steps 1, 4, 5 ────────────────────────────────────────────────────────────

function Step1Objective({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">¿Cuál es el objetivo principal de esta campaña?</p>
      <div className="grid grid-cols-2 gap-3">
        {OBJECTIVES.map(({ id, icon: Icon, label, desc }) => (
          <button key={id} onClick={() => onSelect(id)}
            className={`p-4 rounded-lg border text-left transition-all ${selected === id ? "border-primary bg-primary/15 shadow-glow" : "border-border bg-[#0D0010] hover:border-primary/40"}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selected === id ? "bg-primary/30" : "bg-secondary"}`}>
                <Icon className={`w-5 h-5 ${selected === id ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <span className="font-bold text-sm text-foreground">{label}</span>
            </div>
            <p className="text-xs text-muted-foreground pl-12">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4Budget({ budget, setBudget, startDate, setStartDate, endDate, setEndDate }: {
  budget: number; setBudget: (v: number) => void;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string;   setEndDate:   (v: string) => void;
}) {
  const days = (() => {
    if (!startDate || !endDate) return 14;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.round(diff / 86400000));
  })();
  const total    = budget * days;
  const estLeads = Math.round((budget / 10) * days * 0.68);
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">Define el presupuesto diario y las fechas de tu campaña.</p>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">Presupuesto diario</label>
          <span className="font-mono text-2xl font-semibold text-primary">${budget}/día</span>
        </div>
        <input type="range" min={5} max={50} step={1} value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full accent-primary cursor-pointer" style={{ accentColor: "#8B00FF" }} />
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono"><span>$5/día</span><span>$50/día</span></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">Fecha inicio</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none font-mono" />
        </div>
        <div className="space-y-2">
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">Fecha fin</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none font-mono" />
        </div>
      </div>
      <div className="p-5 rounded-xl grid grid-cols-3 gap-6 text-center" style={{ background: "rgba(139,0,255,0.08)", border: "1px solid rgba(139,0,255,0.25)" }}>
        <div><p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Duración</p><p className="font-mono text-2xl font-semibold text-foreground">{days}d</p></div>
        <div><p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Gasto total</p><p className="font-mono text-2xl font-semibold text-primary">${total}</p></div>
        <div><p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Leads est.</p><p className="font-mono text-2xl font-semibold text-[#52C97A]">~{estLeads}</p></div>
      </div>
    </div>
  );
}

function Step5Review({ objective, selectedAngle, headline, body, cta, budget, startDate, endDate }: {
  objective: string; selectedAngle: AngleOption | null;
  headline: string; body: string; cta: string;
  budget: number; startDate: string; endDate: string;
}) {
  const obj = OBJECTIVES.find(o => o.id === objective);
  const days = (() => {
    if (!startDate || !endDate) return 14;
    return Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  })();
  const total    = budget * days;
  const estLeads = Math.round((budget / 10) * days * 0.68);
  const AngleIcon   = selectedAngle ? (ANGLE_ICONS[selectedAngle.id] ?? null) : null;
  const accentColor = selectedAngle ? (ANGLE_COLORS[selectedAngle.id] ?? "#8B00FF") : "#8B00FF";

  return (
    <div className="space-y-5">
      <p className="text-muted-foreground text-sm">Revisa los detalles antes de guardar tu campaña.</p>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0D0010] border border-border rounded-lg p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Objetivo</p>
            <div className="flex items-center gap-2">
              {obj && <obj.icon className="w-4 h-4 text-primary" />}
              <p className="text-sm font-bold text-foreground">{obj?.label ?? "—"}</p>
            </div>
          </div>
          {selectedAngle ? (
            <div className="bg-[#0D0010] border border-border rounded-lg p-4">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Ángulo</p>
              <div className="flex items-center gap-2">
                {AngleIcon && <AngleIcon className="w-4 h-4" style={{ color: accentColor }} />}
                <p className="text-sm font-bold text-foreground">{selectedAngle.name}</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#0D0010] border border-border rounded-lg p-4">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Presupuesto</p>
              <p className="font-mono text-sm font-bold text-foreground">${budget}/día · {days}d = <span className="text-primary">${total}</span></p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0D0010] border border-border rounded-lg p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Presupuesto</p>
            <p className="font-mono text-sm font-bold text-foreground">${budget}/día · {days}d = <span className="text-primary">${total}</span></p>
          </div>
          <div className="bg-[#0D0010] border border-border rounded-lg p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Leads estimados</p>
            <p className="font-mono text-sm font-bold text-[#52C97A]">~{estLeads} leads</p>
          </div>
        </div>
        <div className="p-5 rounded-lg" style={{ background: "rgba(139,0,255,0.08)", border: "1px solid rgba(139,0,255,0.25)" }}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">Vista previa del anuncio</p>
          <p className="font-bold text-foreground mb-2">{headline || "Sin titular"}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{body || "Sin cuerpo."}</p>
          <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30">{cta}</span>
        </div>
        <div className="flex items-center gap-3 bg-[#1A0025] border border-primary/25 rounded-lg p-4">
          <Zap className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Se guardarán como <span className="text-[#C084FC] font-bold">borrador</span>. Al lanzar en Meta se descuentan{" "}
            <span className="text-primary font-bold">25 TV Tokens</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Campaign Wizard Modal ──────────────────────────────────────────────────────

function CampaignWizard({ onClose }: { onClose: (saved?: boolean) => void }) {
  const [step, setStep] = useState(1);

  const [objective,          setObjective]          = useState("leads");
  const [isGeneratingAngles, setIsGeneratingAngles] = useState(false);
  const [aiAngles,           setAiAngles]           = useState<AngleOption[] | null>(null);
  const [anglesError,        setAnglesError]        = useState<string | null>(null);
  const [selectedAngle,      setSelectedAngle]      = useState<AngleOption | null>(null);
  const [isGeneratingCopy,   setIsGeneratingCopy]   = useState(false);
  const [copyOptions,        setCopyOptions]        = useState<CopyOptions | null>(null);
  const [copyError,          setCopyError]          = useState<string | null>(null);
  const [headline,           setHeadline]           = useState("");
  const [body,               setBody]               = useState("");
  const [cta,                setCta]                = useState("Enviar mensaje");
  const today    = new Date().toISOString().split("T")[0];
  const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  const [budget,    setBudget]    = useState(10);
  const [startDate, setStartDate] = useState(today);
  const [endDate,   setEndDate]   = useState(twoWeeks);

  // Save state
  const [isSaving,   setIsSaving]   = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);

  const generateAngles = useCallback(async (objectiveId: string) => {
    setIsGeneratingAngles(true); setAiAngles(null); setAnglesError(null);
    try {
      const res = await fetch("/api/ai/campanas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective: objectiveId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let fullText = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; fullText += decoder.decode(value, { stream: true }); }
      const parsed = JSON.parse(fullText);
      setAiAngles(parsed.angles ?? []);
    } catch (err: unknown) {
      setAnglesError(err instanceof Error ? err.message : "Error al generar propuesta");
    } finally { setIsGeneratingAngles(false); }
  }, []);

  const generateCopy = useCallback(async (angle: AngleOption, objectiveId: string) => {
    setIsGeneratingCopy(true); setCopyOptions(null); setCopyError(null); setHeadline(""); setBody("");
    try {
      const res = await fetch("/api/ai/campanas/copy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective: objectiveId, angleId: angle.id, angleName: angle.name, angleTone: angle.tone, angleDescription: angle.description }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let fullText = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; fullText += decoder.decode(value, { stream: true }); }
      const parsed: CopyOptions = JSON.parse(fullText);
      setCopyOptions(parsed);
      if (parsed.headlines?.[0]) setHeadline(parsed.headlines[0].text);
      if (parsed.bodies?.[0])    setBody(parsed.bodies[0].text);
      if (parsed.cta?.recommended) setCta(parsed.cta.recommended);
    } catch (err: unknown) {
      setCopyError(err instanceof Error ? err.message : "Error al generar copy");
    } finally { setIsGeneratingCopy(false); }
  }, []);

  const handleSaveCampaign = useCallback(async () => {
    setIsSaving(true); setSaveError(null);
    const obj  = OBJECTIVES.find(o => o.id === objective);
    const month = new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" });
    const campaignName = `${obj?.label ?? "Campaña"} — ${month.charAt(0).toUpperCase() + month.slice(1)}`;
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: campaignName, objective, selectedAngle, headline, body, cta, budget, startDate, endDate }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }
      onClose(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar la campaña");
    } finally { setIsSaving(false); }
  }, [objective, selectedAngle, headline, body, cta, budget, startDate, endDate, onClose]);

  useEffect(() => { setCopyOptions(null); setCopyError(null); setHeadline(""); setBody(""); }, [selectedAngle]);
  useEffect(() => { if (step === 2 && !aiAngles && !isGeneratingAngles && !anglesError) generateAngles(objective); }, [step, aiAngles, isGeneratingAngles, anglesError, objective, generateAngles]);
  useEffect(() => { if (step === 3 && selectedAngle && !copyOptions && !isGeneratingCopy && !copyError) generateCopy(selectedAngle, objective); }, [step, selectedAngle, copyOptions, isGeneratingCopy, copyError, objective, generateCopy]);
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);

  const isFirst = step === 1;
  const isLast  = step === 5;
  const nextDisabled = (step === 2 && (isGeneratingAngles || !selectedAngle)) || (step === 3 && isGeneratingCopy);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: "#1A0025", border: "1px solid #2D0050", boxShadow: "0 0 50px rgba(139,0,255,0.15)" }}>
        <div className="px-8 py-6 border-b border-border flex justify-between items-center shrink-0">
          <h3 className="font-playfair text-xl font-semibold text-foreground tracking-wide uppercase">Wizard de Nueva Campaña</h3>
          <button onClick={() => onClose()} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-8 py-3 bg-[#0D0010]/40 border-b border-border shrink-0">
          <div className="flex gap-2 items-center mb-1">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className="flex-1 relative">
                <div className="h-1 rounded-full transition-colors" style={{ background: i < step ? "#8B00FF" : "#2D0050" }} />
                {i + 1 === step && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary font-mono whitespace-nowrap">PASO {step}</div>}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEP_LABELS.map((label, i) => (
              <span key={i} className="text-[10px] font-mono tracking-wider transition-colors flex-1 text-center" style={{ color: i < step ? "#C084FC" : "#4c4356" }}>{label}</span>
            ))}
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          {step === 1 && <Step1Objective selected={objective} onSelect={setObjective} />}
          {step === 2 && <Step2AiProposal isGenerating={isGeneratingAngles} angles={aiAngles} error={anglesError} selectedAngle={selectedAngle} onSelectAngle={setSelectedAngle} onRetry={() => generateAngles(objective)} onContinue={() => setStep(3)} />}
          {step === 3 && <Step3CopyGen isGenerating={isGeneratingCopy} copyOptions={copyOptions} error={copyError} selectedAngle={selectedAngle} headline={headline} setHeadline={setHeadline} body={body} setBody={setBody} cta={cta} setCta={setCta} onRetry={() => selectedAngle && generateCopy(selectedAngle, objective)} onRegenerate={() => selectedAngle && generateCopy(selectedAngle, objective)} />}
          {step === 4 && <Step4Budget budget={budget} setBudget={setBudget} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />}
          {step === 5 && <Step5Review objective={objective} selectedAngle={selectedAngle} headline={headline} body={body} cta={cta} budget={budget} startDate={startDate} endDate={endDate} />}
          {saveError && (
            <div className="mt-4 flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{saveError}</p>
            </div>
          )}
        </div>

        <div className="px-8 py-5 bg-card border-t border-border flex justify-between items-center shrink-0">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={isFirst || isSaving}
            className="px-6 py-2 border border-border rounded-lg font-bold text-sm hover:bg-secondary transition-colors text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Atrás
          </button>
          <div className="flex gap-3">
            {step === 2 && !isGeneratingAngles && !anglesError && aiAngles && (
              <button onClick={() => { setSelectedAngle(null); generateAngles(objective); }}
                className="px-6 py-2 border border-primary text-primary rounded-lg font-bold text-sm hover:bg-primary/10 transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Regenerar
              </button>
            )}
            {isLast ? (
              <button onClick={handleSaveCampaign} disabled={isSaving}
                className="px-8 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2 disabled:opacity-60">
                {isSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando…</> : <><Rocket className="w-4 h-4" /> Guardar campaña</>}
              </button>
            ) : (
              <button onClick={() => setStep(s => Math.min(5, s + 1))} disabled={nextDisabled}
                className="px-8 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Campaign Card ─────────────────────────────────────────────────────────────

function CampaignCard({
  c, onLaunch, launching,
}: {
  c: DbCampaign;
  onLaunch: () => void;
  launching: boolean;
}) {
  const isActive  = c.status_ui === "activa";
  const isPaused  = c.status_ui === "pausada";
  const isDraft   = c.status_ui === "borrador";
  const cpl       = c.leads_count > 0 ? `$${(c.spend / c.leads_count).toFixed(2)}` : "—";
  const budgetStr = c.budget_daily != null ? `$${c.budget_daily}/día` : "N/A";
  const obj       = OBJECTIVES.find(o => o.id === c.objective);

  return (
    <div
      className={`bg-[#0D0010] border border-border rounded-lg overflow-hidden transition-all ${
        isActive ? "border-l-4 border-l-[#52C97A]" :
        isDraft  ? "border-l-4 border-l-[#C084FC]" :
        "border-l-4 border-l-border opacity-70"
      }`}
      style={isPaused ? { filter: "grayscale(0.4)" } : {}}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              {isActive && <span className="bg-[#52C97A1A] text-[#52C97A] border border-[#52C97A] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Activa</span>}
              {isPaused && <span className="bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Pausada</span>}
              {isDraft  && <span className="bg-[#C084FC1A] text-[#C084FC] border border-[#C084FC] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Borrador</span>}
              <h3 className="font-playfair text-xl font-semibold text-foreground">{c.name}</h3>
            </div>
            <p className="text-muted-foreground text-sm font-mono">
              {budgetStr}{obj ? ` · ${obj.label}` : ""}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {isActive && (
              <>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5"><Pause className="w-3.5 h-3.5" /> Pausar</button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5"><Edit className="w-3.5 h-3.5" /> Editar</button>
                <button className="px-4 py-2 bg-[#62259b] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Ver métricas</button>
              </>
            )}
            {isPaused && (
              <>
                <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg text-sm font-bold hover:bg-primary/30 transition-colors flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Activar</button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5"><LayoutList className="w-3.5 h-3.5" /> Duplicar</button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Ver métricas</button>
              </>
            )}
            {isDraft && (
              <button
                onClick={onLaunch}
                disabled={launching}
                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {launching
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Lanzando…</>
                  : <><ExternalLink className="w-3.5 h-3.5" /> Lanzar en Meta</>
                }
              </button>
            )}
          </div>
        </div>

        {isDraft && c.copy_headline && (
          <div className="mb-4 p-4 rounded-lg" style={{ background: "rgba(139,0,255,0.06)", border: "1px solid rgba(139,0,255,0.18)" }}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">Vista previa del anuncio</p>
            <p className="font-bold text-foreground text-sm mb-1">{c.copy_headline}</p>
            {c.copy_body && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.copy_body}</p>}
            {c.copy_cta  && <span className="inline-block mt-2 bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30">{c.copy_cta}</span>}
          </div>
        )}

        <div className="grid grid-cols-4 gap-6 bg-[#1A0025]/60 p-4 rounded-lg">
          {[
            { label: "Leads", value: String(c.leads_count) },
            { label: "Gasto",  value: c.spend > 0 ? `$${Math.round(c.spend)}` : "$0" },
            { label: "CPL",    value: cpl },
            { label: "CTR",    value: "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
              <p className="font-mono text-xl text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampanasPage() {
  const [campaigns,   setCampaigns]   = useState<DbCampaign[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [wizardOpen,  setWizardOpen]  = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
    } catch (err) {
      console.error("[CampanasPage] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const openWizard  = useCallback(() => setWizardOpen(true), []);
  const closeWizard = useCallback((saved?: boolean) => {
    setWizardOpen(false);
    if (saved) fetchCampaigns();
  }, [fetchCampaigns]);

  const handleLaunch = useCallback(async (campaignId: string) => {
    setLaunchingId(campaignId);
    setLaunchError(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/launch`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      fetchCampaigns();
    } catch (err: unknown) {
      setLaunchError(err instanceof Error ? err.message : "Error al lanzar la campaña");
    } finally {
      setLaunchingId(null);
    }
  }, [fetchCampaigns]);

  const activeCampaigns = campaigns.filter(c => c.status_ui === "activa");
  const totalLeads      = campaigns.reduce((s, c) => s + c.leads_count, 0);
  const totalSpend      = campaigns.reduce((s, c) => s + c.spend, 0);

  return (
    <div className="p-10 max-w-[1400px] mx-auto">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-playfair text-4xl font-bold text-foreground mb-2">Campañas</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#52C97A] inline-block" />
            <p className="text-muted-foreground text-sm">Meta Ads integrado</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1A0025] border border-primary/25 rounded-lg px-3 py-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-mono text-[11px] text-muted-foreground">Lanzar en Meta = </span>
            <span className="font-mono text-[11px] font-bold text-primary">25 tokens</span>
          </div>
          <button onClick={openWizard} className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-glow hover:shadow-glow-lg transition-all">
            <Plus className="w-4 h-4" /> Nueva campaña
          </button>
        </div>
      </header>

      {launchError && (
        <div className="mb-6 flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{launchError}</p>
          <button onClick={() => setLaunchError(null)} className="ml-auto text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#0D0010] border border-border p-6 rounded-lg">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-3">Campañas activas</p>
          <p className="font-mono text-4xl font-medium text-primary">{loading ? "—" : activeCampaigns.length}</p>
        </div>
        <div className="bg-[#0D0010] border border-border p-6 rounded-lg">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-3">Leads totales</p>
          <p className="font-mono text-4xl font-medium text-primary">{loading ? "—" : totalLeads}</p>
        </div>
        <div className="bg-[#0D0010] border border-border p-6 rounded-lg">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-3">Gasto total</p>
          <p className="font-mono text-4xl font-medium text-primary">{loading ? "—" : `$${Math.round(totalSpend)}`}</p>
        </div>
      </div>

      <section className="space-y-6">
        {loading ? (
          [0,1].map(i => (
            <div key={i} className="bg-[#0D0010] border border-border rounded-lg p-6 animate-pulse">
              <div className="h-6 w-64 bg-border rounded mb-4" />
              <div className="grid grid-cols-4 gap-6 bg-[#1A0025]/60 p-4 rounded-lg">
                {[0,1,2,3].map(j => <div key={j} className="h-8 bg-border rounded" />)}
              </div>
            </div>
          ))
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
            <p className="text-muted-foreground text-sm mb-4">No tienes campañas todavía.</p>
            <button onClick={openWizard} className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Crear primera campaña
            </button>
          </div>
        ) : (
          campaigns.map(c => (
            <CampaignCard
              key={c.id}
              c={c}
              onLaunch={() => handleLaunch(c.id)}
              launching={launchingId === c.id}
            />
          ))
        )}
      </section>

      {wizardOpen && <CampaignWizard onClose={closeWizard} />}
    </div>
  );
}
