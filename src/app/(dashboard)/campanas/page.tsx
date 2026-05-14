"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, X, Target, Megaphone, Globe, MessageSquare, MapPin, Video,
  Copy, Upload, ChevronLeft, ChevronRight, Sparkles, Zap, Tag,
  Lightbulb, Users, DollarSign, Rocket, Pause, Play, Edit, BarChart2,
  LayoutList,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type CampaignStatus = "activa" | "pausada";

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  budget: string;
  audience: string;
  leads: number;
  spend: string;
  cpl: string;
  ctr: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Consultas — Blackwork Mayo 2026",
    status: "activa",
    budget: "$10/día",
    audience: "25-40 años, Santiago",
    leads: 24,
    spend: "$145",
    cpl: "$6.04",
    ctr: "3.2%",
  },
  {
    id: "2",
    name: "Flash Tattoos — Fin de semana",
    status: "pausada",
    budget: "$15/día",
    audience: "18-30 años, Santiago",
    leads: 10,
    spend: "$95",
    cpl: "$9.50",
    ctr: "2.1%",
  },
];

const OBJECTIVES = [
  { id: "leads",     icon: Target,       label: "Generación de leads",    desc: "Captura datos de clientes interesados" },
  { id: "brand",     icon: Megaphone,    label: "Reconocimiento de marca", desc: "Aumenta la visibilidad de tu estudio" },
  { id: "traffic",   icon: Globe,        label: "Tráfico al sitio web",    desc: "Dirige usuarios a tu portfolio online" },
  { id: "messages",  icon: MessageSquare,label: "Mensajes directos",       desc: "Recibe consultas por Instagram DM" },
  { id: "visits",    icon: MapPin,       label: "Visitas a la tienda",     desc: "Atrae clientes a tu estudio físico" },
  { id: "video",     icon: Video,        label: "Reproducción de videos",  desc: "Muestra tu proceso de tatuaje" },
];

const CTA_OPTIONS = [
  "Saber más", "Enviar mensaje", "Reservar ahora", "Contáctanos", "Ver portfolio",
];

const STEP_LABELS = ["Objetivo", "Propuesta IA", "Copy", "Presupuesto", "Revisión"];

// ── Campaign card ─────────────────────────────────────────────────────────────

function CampaignCard({ c }: { c: Campaign }) {
  const active = c.status === "activa";
  return (
    <div
      className={`bg-[#0D0010] border border-border rounded-lg overflow-hidden transition-all ${
        active ? "border-l-4 border-l-[#52C97A]" : "border-l-4 border-l-border opacity-70"
      }`}
      style={active ? {} : { filter: "grayscale(0.4)" }}
    >
      <div className="p-6">
        {/* Top row */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              {active ? (
                <span className="bg-[#52C97A1A] text-[#52C97A] border border-[#52C97A] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Activa
                </span>
              ) : (
                <span className="bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Pausada
                </span>
              )}
              <h3 className="font-playfair text-xl font-semibold text-foreground">{c.name}</h3>
            </div>
            <p className="text-muted-foreground text-sm font-mono">
              Presupuesto: {c.budget} · Audiencia: {c.audience}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {active ? (
              <>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5">
                  <Pause className="w-3.5 h-3.5" /> Pausar
                </button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5">
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button className="px-4 py-2 bg-[#62259b] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> Ver métricas
                </button>
              </>
            ) : (
              <>
                <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg text-sm font-bold hover:bg-primary/30 transition-colors flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Activar
                </button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5">
                  <LayoutList className="w-3.5 h-3.5" /> Duplicar
                </button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> Ver métricas
                </button>
              </>
            )}
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-6 bg-[#1A0025]/60 p-4 rounded-lg">
          {[
            { label: "Leads",  value: String(c.leads) },
            { label: "Gasto",  value: c.spend },
            { label: "CPL",    value: c.cpl },
            { label: "CTR",    value: c.ctr },
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

// ── Wizard step content ───────────────────────────────────────────────────────

function Step1Objective({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        ¿Cuál es el objetivo principal de esta campaña?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {OBJECTIVES.map(({ id, icon: Icon, label, desc }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`p-4 rounded-lg border text-left transition-all ${
              selected === id
                ? "border-primary bg-primary/15 shadow-glow"
                : "border-border bg-[#0D0010] hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selected === id ? "bg-primary/30" : "bg-secondary"}`}>
                <Icon className={`w-5 h-5 ${selected === id ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <span className={`font-bold text-sm ${selected === id ? "text-foreground" : "text-foreground"}`}>
                {label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-12">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2AiProposal() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-primary">
        <Sparkles className="w-7 h-7" />
        <h4 className="font-playfair text-xl font-semibold text-foreground">
          💡 TattooVision AI recomienda:
        </h4>
      </div>

      <div className="space-y-3">
        {/* Offer */}
        <div className="p-4 rounded-lg bg-[#0D0010] border border-border/30 flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-1">Oferta Sugerida</p>
            <p className="text-sm text-foreground">Primera consulta gratis + diseño personalizado</p>
          </div>
        </div>

        {/* Angle */}
        <div className="p-4 rounded-lg bg-[#0D0010] border border-border/30 flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-1">Ángulo de Venta</p>
            <p className="text-sm text-foreground">Muestra el proceso completo: boceto → sesión → resultado</p>
          </div>
        </div>

        {/* Audience + Budget (2 col) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-[#0D0010] border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <p className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Audiencia</p>
            </div>
            <p className="text-sm text-foreground">Mujeres 22–35 años, interés en arte y tatuajes, Santiago</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0D0010] border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <p className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Presupuesto</p>
            </div>
            <p className="text-sm text-foreground">$8/día × 14 días = $112 total</p>
          </div>
        </div>

        {/* Generated copy */}
        <div
          className="p-5 rounded-lg relative"
          style={{ background: "rgba(139,0,255,0.08)", border: "1px solid rgba(139,0,255,0.35)" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">
            Copy Generado por IA
          </p>
          <h5 className="font-playfair text-lg font-semibold text-foreground mb-2">
            Tu próximo tatuaje empieza con una idea
          </h5>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ¿Buscas algo único que cuente tu historia? En Black Lotus Studio transformamos tus conceptos en arte eterno. Agenda tu diseño personalizado hoy.
          </p>
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 text-primary hover:text-foreground transition-colors"
            title="Copiar"
          >
            {copied ? (
              <span className="text-[#52C97A] text-xs font-bold">✓</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step3EditCopy({
  headline,
  setHeadline,
  body,
  setBody,
  cta,
  setCta,
}: {
  headline: string;
  setHeadline: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  cta: string;
  setCta: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-muted-foreground text-sm">
        Revisa y edita el copy generado por IA antes de continuar.
      </p>

      {/* Headline */}
      <div className="space-y-2">
        <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
          Titular
        </label>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          maxLength={40}
          className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
          placeholder="Tu próximo tatuaje empieza con una idea"
        />
        <p className="text-right text-[10px] text-muted-foreground">{headline.length}/40</p>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
          Cuerpo del anuncio
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={200}
          className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-none transition-colors"
          placeholder="¿Buscas algo único que cuente tu historia?..."
        />
        <p className="text-right text-[10px] text-muted-foreground">{body.length}/200</p>
      </div>

      {/* CTA */}
      <div className="space-y-2">
        <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
          Llamada a la acción (CTA)
        </label>
        <select
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none cursor-pointer"
        >
          {CTA_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Creative upload */}
      <div className="space-y-2">
        <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
          Creativo (imagen / video)
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Arrastra tu imagen o video aquí
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG o MP4 · Máx 30MB</p>
          <button className="mt-4 px-4 py-2 text-xs font-bold border border-border rounded-lg hover:bg-secondary transition-colors text-foreground">
            Seleccionar archivo
          </button>
        </div>
      </div>
    </div>
  );
}

function Step4Budget({
  budget,
  setBudget,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  budget: number;
  setBudget: (v: number) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
}) {
  const days = (() => {
    if (!startDate || !endDate) return 14;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.round(diff / 86400000));
  })();
  const total = budget * days;
  const estLeads = Math.round((budget / 10) * days * 0.68);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Define el presupuesto diario y las fechas de tu campaña.
      </p>

      {/* Budget slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
            Presupuesto diario
          </label>
          <span className="font-mono text-2xl font-semibold text-primary">${budget}/día</span>
        </div>
        <input
          type="range"
          min={5}
          max={50}
          step={1}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
          style={{ accentColor: "#8B00FF" }}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>$5/día</span>
          <span>$50/día</span>
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
            Fecha inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
            Fecha fin
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none font-mono"
          />
        </div>
      </div>

      {/* Estimate panel */}
      <div
        className="p-5 rounded-xl grid grid-cols-3 gap-6 text-center"
        style={{ background: "rgba(139,0,255,0.08)", border: "1px solid rgba(139,0,255,0.25)" }}
      >
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Duración</p>
          <p className="font-mono text-2xl font-semibold text-foreground">{days}d</p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Gasto total</p>
          <p className="font-mono text-2xl font-semibold text-primary">${total}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Leads est.</p>
          <p className="font-mono text-2xl font-semibold text-[#52C97A]">~{estLeads}</p>
        </div>
      </div>
    </div>
  );
}

function Step5Review({
  objective,
  headline,
  body,
  cta,
  budget,
  startDate,
  endDate,
}: {
  objective: string;
  headline: string;
  body: string;
  cta: string;
  budget: number;
  startDate: string;
  endDate: string;
}) {
  const obj = OBJECTIVES.find((o) => o.id === objective);
  const days = (() => {
    if (!startDate || !endDate) return 14;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.round(diff / 86400000));
  })();
  const total = budget * days;
  const estLeads = Math.round((budget / 10) * days * 0.68);

  return (
    <div className="space-y-5">
      <p className="text-muted-foreground text-sm">
        Revisa los detalles antes de lanzar tu campaña.
      </p>

      {/* Summary blocks */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0D0010] border border-border rounded-lg p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Objetivo</p>
            <div className="flex items-center gap-2">
              {obj && <obj.icon className="w-4 h-4 text-primary" />}
              <p className="text-sm font-bold text-foreground">{obj?.label ?? "—"}</p>
            </div>
          </div>
          <div className="bg-[#0D0010] border border-border rounded-lg p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Presupuesto</p>
            <p className="font-mono text-sm font-bold text-foreground">
              ${budget}/día · {days} días = <span className="text-primary">${total}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0D0010] border border-border rounded-lg p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Periodo</p>
            <p className="text-sm text-foreground font-mono">
              {startDate || "—"} → {endDate || "—"}
            </p>
          </div>
          <div className="bg-[#0D0010] border border-border rounded-lg p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Leads estimados</p>
            <p className="font-mono text-sm font-bold text-[#52C97A]">~{estLeads} leads</p>
          </div>
        </div>

        {/* Copy preview */}
        <div
          className="p-5 rounded-lg"
          style={{ background: "rgba(139,0,255,0.08)", border: "1px solid rgba(139,0,255,0.25)" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">Vista previa del anuncio</p>
          <p className="font-bold text-foreground mb-2">{headline || "Sin titular"}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{body || "Sin cuerpo."}</p>
          <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30">
            {cta}
          </span>
        </div>

        {/* Token warning */}
        <div className="flex items-center gap-3 bg-[#1A0025] border border-primary/25 rounded-lg p-4">
          <Zap className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Se descontarán <span className="text-primary font-bold">25 TV Tokens</span> al lanzar esta campaña. Saldo actual:{" "}
            <span className="text-foreground font-bold">147 tokens</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Campaign Wizard Modal ──────────────────────────────────────────────────────

function CampaignWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [objective, setObjective] = useState("leads");
  // Step 3
  const [headline, setHeadline] = useState("Tu próximo tatuaje empieza con una idea");
  const [body, setBody] = useState(
    "¿Buscas algo único que cuente tu historia? En Black Lotus Studio transformamos tus conceptos en arte eterno. Agenda tu diseño personalizado hoy."
  );
  const [cta, setCta] = useState("Saber más");
  // Step 4
  const [budget, setBudget] = useState(10);
  const today = new Date().toISOString().split("T")[0];
  const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(twoWeeks);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const isFirst = step === 1;
  const isLast  = step === 5;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: "#1A0025", border: "1px solid #2D0050", boxShadow: "0 0 50px rgba(139,0,255,0.15)" }}
      >
        {/* Modal header */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center shrink-0">
          <h3 className="font-playfair text-xl font-semibold text-foreground tracking-wide uppercase">
            Wizard de Nueva Campaña
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-8 py-3 bg-[#0D0010]/40 border-b border-border shrink-0">
          <div className="flex gap-2 items-center mb-1">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex-1 relative">
                <div
                  className="h-1 rounded-full transition-colors"
                  style={{ background: i < step ? "#8B00FF" : "#2D0050" }}
                />
                {i + 1 === step && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary font-mono whitespace-nowrap">
                    PASO {step}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEP_LABELS.map((label, i) => (
              <span
                key={i}
                className="text-[10px] font-mono tracking-wider transition-colors flex-1 text-center"
                style={{ color: i < step ? "#C084FC" : "#4c4356" }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-8 overflow-y-auto flex-1">
          {step === 1 && <Step1Objective selected={objective} onSelect={setObjective} />}
          {step === 2 && <Step2AiProposal />}
          {step === 3 && (
            <Step3EditCopy
              headline={headline} setHeadline={setHeadline}
              body={body} setBody={setBody}
              cta={cta} setCta={setCta}
            />
          )}
          {step === 4 && (
            <Step4Budget
              budget={budget} setBudget={setBudget}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
            />
          )}
          {step === 5 && (
            <Step5Review
              objective={objective} headline={headline} body={body}
              cta={cta} budget={budget} startDate={startDate} endDate={endDate}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-card border-t border-border flex justify-between items-center shrink-0">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={isFirst}
            className="px-6 py-2 border border-border rounded-lg font-bold text-sm hover:bg-secondary transition-colors text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Atrás
          </button>

          <div className="flex gap-3">
            {step === 2 && (
              <button className="px-6 py-2 border border-primary text-primary rounded-lg font-bold text-sm hover:bg-primary/10 transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Refinar
              </button>
            )}
            {isLast ? (
              <button
                onClick={onClose}
                className="px-8 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" /> Lanzar campaña
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                className="px-8 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampanasPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const openWizard  = useCallback(() => setWizardOpen(true), []);
  const closeWizard = useCallback(() => setWizardOpen(false), []);

  return (
    <div className="p-10 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-playfair text-4xl font-bold text-foreground mb-2">Campañas</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#52C97A] inline-block" />
            <p className="text-muted-foreground text-sm">Conectado a Black Lotus Studio Ads</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* TV Tokens reminder badge */}
          <div className="flex items-center gap-1.5 bg-[#1A0025] border border-primary/25 rounded-lg px-3 py-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-mono text-[11px] text-muted-foreground">Crear campaña = </span>
            <span className="font-mono text-[11px] font-bold text-primary">25 tokens</span>
          </div>

          <button
            onClick={openWizard}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva campaña
          </button>
        </div>
      </header>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#0D0010] border border-border p-6 rounded-lg">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-3">
            Campañas activas
          </p>
          <p className="font-mono text-4xl font-medium text-primary">2</p>
        </div>
        <div className="bg-[#0D0010] border border-border p-6 rounded-lg">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-3">
            Leads este mes
          </p>
          <p className="font-mono text-4xl font-medium text-primary">
            34{" "}
            <span className="text-sm font-normal opacity-60 ml-1">($7.06 CPL)</span>
          </p>
        </div>
        <div className="bg-[#0D0010] border border-border p-6 rounded-lg">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-3">
            Gasto total
          </p>
          <p className="font-mono text-4xl font-medium text-primary">
            $240{" "}
            <span className="text-sm font-normal opacity-60 ml-1">($8/día avg)</span>
          </p>
        </div>
      </div>

      {/* ── Campaign list ── */}
      <section className="space-y-6">
        {CAMPAIGNS.map((c) => <CampaignCard key={c.id} c={c} />)}
      </section>

      {/* ── Wizard modal ── */}
      {wizardOpen && <CampaignWizard onClose={closeWizard} />}
    </div>
  );
}
