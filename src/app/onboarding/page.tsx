"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, AtSign, ToggleLeft, ToggleRight,
  Building2, MapPin, User,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — business type
  businessType: "independiente" | "estudio" | "";
  // Step 2
  studioName: string;
  city: string;
  country: string;
  // Step 3
  styles: string[];
  avgTicket: string;
  // Step 4
  citasPerMonth: number;
  mainProblem: string;
  // Step 5
  instagram: string;
  hasMeta: boolean;
}

// ── Static data ───────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "MX", flag: "🇲🇽", name: "México" },
  { code: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "PE", flag: "🇵🇪", name: "Perú" },
  { code: "UY", flag: "🇺🇾", name: "Uruguay" },
  { code: "ES", flag: "🇪🇸", name: "España" },
  { code: "BR", flag: "🇧🇷", name: "Brasil" },
  { code: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "BO", flag: "🇧🇴", name: "Bolivia" },
  { code: "PY", flag: "🇵🇾", name: "Paraguay" },
  { code: "OTHER", flag: "🌎", name: "Otro país" },
];

const TZ_TO_COUNTRY: Record<string, string> = {
  "America/Santiago":               "Chile",
  "America/Argentina/Buenos_Aires": "Argentina",
  "America/Argentina/Cordoba":      "Argentina",
  "America/Argentina/Mendoza":      "Argentina",
  "America/Argentina/Tucuman":      "Argentina",
  "America/Mexico_City":            "México",
  "America/Monterrey":              "México",
  "America/Cancun":                 "México",
  "America/Bogota":                 "Colombia",
  "America/Lima":                   "Perú",
  "America/Montevideo":             "Uruguay",
  "Europe/Madrid":                  "España",
  "America/Sao_Paulo":              "Brasil",
  "America/Manaus":                 "Brasil",
  "America/Caracas":                "Venezuela",
  "America/Guayaquil":              "Ecuador",
  "America/La_Paz":                 "Bolivia",
  "America/Asuncion":               "Paraguay",
};

function detectCountryName(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_TO_COUNTRY[tz] ?? "Chile";
  } catch {
    return "Chile";
  }
}

const STYLES = [
  "Blackwork", "Realismo", "Japonés", "Neo-trad",
  "Minimalista", "Acuarela", "Old school", "Lettering",
];

const PROBLEMS = [
  "Conseguir nuevos clientes",
  "Organizar mis leads",
  "Llenar mi agenda",
  "Hacer mejores campañas",
];

const STEP_LABELS = [
  "Tipo",
  "Negocio",
  "Especialidad",
  "Objetivo",
  "Redes",
  "¡Listo!",
];


// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-10">
      {/* Row: circles connected by lines */}
      <div className="flex items-center">
        {STEP_LABELS.map((label, i) => {
          const num  = i + 1;
          const done = num < step;
          const active = num === step;
          const isLast = i === STEP_LABELS.length - 1;

          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              {/* Circle + label column */}
              <div className="flex flex-col items-center gap-1.5 flex-none">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: done
                      ? "#8B00FF"
                      : active
                      ? "rgba(139,0,255,0.18)"
                      : "rgba(45,0,80,0.45)",
                    border: `2px solid ${done || active ? "#8B00FF" : "rgba(45,0,80,0.7)"}`,
                    boxShadow: active ? "0 0 14px rgba(139,0,255,0.55)" : "none",
                    color: done || active ? "#fff" : "#4a3060",
                  }}
                >
                  {done ? <Check className="w-4 h-4" strokeWidth={3} /> : num}
                </div>
                <span
                  className="text-[10px] font-bold whitespace-nowrap"
                  style={{
                    color: active ? "#C084FC" : done ? "#8B00FF" : "#4a3060",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Connector line — fills the gap between circles */}
              {!isLast && (
                <div
                  className="flex-1 h-px mx-2 transition-all duration-500"
                  style={{
                    background: done
                      ? "linear-gradient(90deg, #8B00FF, #8B00FF)"
                      : "rgba(45,0,80,0.5)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-playfair text-3xl font-bold text-white mb-2">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-muted-foreground outline-none transition-colors"
        style={{
          background: "#1A0025",
          border: "1px solid rgba(45,0,80,0.8)",
          paddingLeft: prefix ? "2.5rem" : undefined,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#8B00FF")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(45,0,80,0.8)")}
      />
    </div>
  );
}

function NextButton({ onClick, label = "Siguiente →", disabled = false, loading = false }: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 mt-8 flex items-center justify-center gap-2"
      style={{
        background: isDisabled ? "rgba(45,0,80,0.4)" : "linear-gradient(135deg, #8B00FF, #6A00C8)",
        boxShadow: isDisabled ? "none" : "0 0 24px rgba(139,0,255,0.35)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {loading && (
        <svg
          className="animate-spin w-4 h-4 text-white flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {label}
    </button>
  );
}

// ── Step 1 — Business type ────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  {
    value:    "independiente" as const,
    label:    "Tatuador independiente",
    subtitle: "Trabajo solo o en espacio compartido",
    Icon:     User,
  },
  {
    value:    "estudio" as const,
    label:    "Estudio de tatuaje",
    subtitle: "Tengo uno o más artistas en mi equipo",
    Icon:     Building2,
  },
];

function Step1({
  value,
  onChange,
  onNext,
}: {
  value: FormData["businessType"];
  onChange: (v: "independiente" | "estudio") => void;
  onNext: () => void;
}) {
  return (
    <div>
      <StepHeading
        title="¿Cómo describes tu negocio?"
        subtitle="Esto nos ayuda a personalizar la plataforma para ti."
      />
      <div className="space-y-4">
        {BUSINESS_TYPES.map(({ value: opt, label, subtitle, Icon }) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="w-full flex items-center gap-5 px-6 py-5 rounded-xl text-left transition-all duration-150"
              style={{
                background: selected ? "rgba(139,0,255,0.12)" : "rgba(26,0,37,0.8)",
                border: `1px solid ${selected ? "rgba(139,0,255,0.5)" : "rgba(45,0,80,0.6)"}`,
                boxShadow: selected ? "0 0 14px rgba(139,0,255,0.15)" : "none",
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: selected ? "rgba(139,0,255,0.2)" : "rgba(45,0,80,0.3)" }}
              >
                <Icon
                  className="w-6 h-6"
                  style={{ color: selected ? "#C084FC" : "#4a3060" }}
                />
              </div>
              <div className="flex-1">
                <p
                  className="font-bold text-sm"
                  style={{ color: selected ? "#C084FC" : "#988ca2" }}
                >
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#4a3060" }}>
                  {subtitle}
                </p>
              </div>
              {selected && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#8B00FF" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <NextButton onClick={onNext} disabled={!value} />
    </div>
  );
}

// ── Step 2 — Studio info ──────────────────────────────────────────────────────

function Step2({
  data,
  onChange,
  onNext,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
  onNext: () => void;
}) {
  const canAdvance = data.studioName.trim().length > 0 && data.city.trim().length > 0;

  return (
    <div>
      <StepHeading
        title="Datos del negocio"
        subtitle="Cuéntanos sobre tu estudio para personalizar la plataforma."
      />
      <div className="space-y-5">
        <div>
          <FieldLabel>Nombre del estudio</FieldLabel>
          <TextInput
            value={data.studioName}
            onChange={(v) => onChange({ studioName: v })}
            placeholder="Ej: Dark Ink Studio"
            prefix={<Building2 className="w-4 h-4" />}
          />
        </div>
        <div>
          <FieldLabel>Ciudad</FieldLabel>
          <TextInput
            value={data.city}
            onChange={(v) => onChange({ city: v })}
            placeholder="Ej: Santiago de Chile"
            prefix={<MapPin className="w-4 h-4" />}
          />
        </div>
        <div>
          <FieldLabel>País</FieldLabel>
          <select
            value={data.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none transition-colors appearance-none cursor-pointer"
            style={{
              background: "#1A0025",
              border: "1px solid rgba(45,0,80,0.8)",
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name} style={{ background: "#1A0025" }}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <NextButton onClick={onNext} disabled={!canAdvance} />
    </div>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function Step3({
  data,
  onChange,
  onNext,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
  onNext: () => void;
}) {
  const toggleStyle = (s: string) => {
    const next = data.styles.includes(s)
      ? data.styles.filter((x) => x !== s)
      : [...data.styles, s];
    onChange({ styles: next });
  };

  const canAdvance = data.styles.length > 0;

  return (
    <div>
      <StepHeading
        title="Tu especialidad"
        subtitle="Selecciona los estilos que trabajas en tu estudio."
      />
      <div className="space-y-6">
        <div>
          <FieldLabel>Estilos de tatuaje</FieldLabel>
          <div className="grid grid-cols-3 gap-2.5 mt-2">
            {STYLES.map((s) => {
              const selected = data.styles.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStyle(s)}
                  className="relative flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all duration-150"
                  style={{
                    background: selected ? "rgba(139,0,255,0.15)" : "rgba(26,0,37,0.8)",
                    border: `1px solid ${selected ? "rgba(139,0,255,0.5)" : "rgba(45,0,80,0.6)"}`,
                    color: selected ? "#C084FC" : "#988ca2",
                    boxShadow: selected ? "0 0 10px rgba(139,0,255,0.15)" : "none",
                  }}
                >
                  {selected && (
                    <span
                      className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: "#8B00FF" }}
                    >
                      <Check className="w-2 h-2 text-white" />
                    </span>
                  )}
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <FieldLabel>Ticket promedio por sesión (USD)</FieldLabel>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
              $
            </span>
            <input
              type="number"
              min="0"
              value={data.avgTicket}
              onChange={(e) => onChange({ avgTicket: e.target.value })}
              placeholder="150"
              className="w-full rounded-lg pl-8 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground outline-none transition-colors"
              style={{
                background: "#1A0025",
                border: "1px solid rgba(45,0,80,0.8)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#8B00FF")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(45,0,80,0.8)")}
            />
          </div>
        </div>
      </div>
      <NextButton onClick={onNext} disabled={!canAdvance} />
    </div>
  );
}

// ── Step 4 ────────────────────────────────────────────────────────────────────

function Step4({
  data,
  onChange,
  onNext,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
  onNext: () => void;
}) {
  const canAdvance = data.mainProblem.length > 0;

  return (
    <div>
      <StepHeading
        title="Tu objetivo"
        subtitle="Personalizamos TattooVision AI según lo que más necesitas."
      />
      <div className="space-y-8">
        {/* Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Meta de citas por mes</FieldLabel>
            <span className="text-2xl font-bold font-playfair" style={{ color: "#8B00FF" }}>
              {data.citasPerMonth}
            </span>
          </div>
          <div className="relative py-2">
            <input
              type="range"
              min={1}
              max={50}
              value={data.citasPerMonth}
              onChange={(e) => onChange({ citasPerMonth: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "#8B00FF", background: `linear-gradient(to right, #8B00FF ${((data.citasPerMonth - 1) / 49) * 100}%, rgba(45,0,80,0.6) ${((data.citasPerMonth - 1) / 49) * 100}%)` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>1 cita</span>
            <span>50 citas</span>
          </div>
        </div>

        {/* Radio group */}
        <div>
          <FieldLabel>¿Cuál es tu mayor problema?</FieldLabel>
          <div className="space-y-3 mt-2">
            {PROBLEMS.map((p) => {
              const selected = data.mainProblem === p;
              return (
                <button
                  key={p}
                  onClick={() => onChange({ mainProblem: p })}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm text-left transition-all duration-150"
                  style={{
                    background: selected ? "rgba(139,0,255,0.12)" : "rgba(26,0,37,0.6)",
                    border: `1px solid ${selected ? "rgba(139,0,255,0.45)" : "rgba(45,0,80,0.5)"}`,
                    color: selected ? "#C084FC" : "#988ca2",
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: selected ? "#8B00FF" : "rgba(45,0,80,0.8)",
                      background: selected ? "#8B00FF" : "transparent",
                    }}
                  >
                    {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <NextButton onClick={onNext} disabled={!canAdvance} />
    </div>
  );
}

// ── Step 5 ────────────────────────────────────────────────────────────────────

function Step5({
  data,
  onChange,
  onNext,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <StepHeading
        title="Tus redes"
        subtitle="Conecta tu presencia digital para potenciar tus campañas."
      />
      <div className="space-y-6">
        <div>
          <FieldLabel>Instagram handle</FieldLabel>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={data.instagram}
              onChange={(e) => onChange({ instagram: e.target.value })}
              placeholder="@tuestudio"
              className="w-full rounded-lg pl-9 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground outline-none transition-colors"
              style={{
                background: "#1A0025",
                border: "1px solid rgba(45,0,80,0.8)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#8B00FF")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(45,0,80,0.8)")}
            />
          </div>
        </div>

        <div>
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: "rgba(26,0,37,0.8)", border: "1px solid rgba(45,0,80,0.6)" }}
          >
            <div>
              <p className="text-sm font-bold text-white">Cuenta publicitaria en Meta</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ¿Ya tienes Facebook Ads / Instagram Ads activos?
              </p>
            </div>
            <button
              onClick={() => onChange({ hasMeta: !data.hasMeta })}
              aria-pressed={data.hasMeta}
            >
              {data.hasMeta ? (
                <ToggleRight className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(139,0,255,0.6)]" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-muted-foreground" />
              )}
            </button>
          </div>

          {data.hasMeta && (
            <div
              className="mt-3 px-4 py-3 rounded-xl text-xs leading-relaxed"
              style={{
                background: "rgba(139,0,255,0.08)",
                border: "1px solid rgba(139,0,255,0.25)",
                color: "#C084FC",
              }}
            >
              <span className="font-bold">Perfecto.</span> En la sección{" "}
              <span className="font-bold">Integraciones</span> podrás conectar tu cuenta de Meta
              Business Suite mediante OAuth para lanzar campañas directamente desde TattooVision.
            </div>
          )}
        </div>
      </div>
      <NextButton onClick={onNext} />
    </div>
  );
}

// ── Step 6 ────────────────────────────────────────────────────────────────────

function Step6({
  data,
  onFinish,
  isLoading = false,
  error = null,
}: {
  data: FormData;
  onFinish: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  const summaryItems = [
    { label: "Estudio", value: data.studioName || "—" },
    { label: "Ciudad", value: `${data.city || "—"}, ${data.country}` },
    {
      label: "Estilos",
      value: data.styles.length > 0 ? data.styles.join(", ") : "—",
    },
    { label: "Meta de citas", value: `${data.citasPerMonth} por mes` },
    { label: "Instagram", value: data.instagram || "—" },
    {
      label: "Meta Ads",
      value: data.hasMeta ? "Conectar en Integraciones" : "No configurado",
    },
  ];

  return (
    <div className="text-center">
      {/* Checkmark */}
      <div className="flex justify-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(139,0,255,0.15)",
            border: "2px solid rgba(139,0,255,0.5)",
            boxShadow: "0 0 40px rgba(139,0,255,0.3)",
          }}
        >
          <Check className="w-10 h-10" style={{ color: "#8B00FF" }} strokeWidth={3} />
        </div>
      </div>

      <h2 className="font-playfair text-3xl font-bold text-white mb-2">
        ¡Tu plataforma está lista! 🎉
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Esto es lo que configuramos para ti:
      </p>

      {/* Summary card */}
      <div
        className="rounded-xl text-left overflow-hidden mb-2"
        style={{ background: "rgba(26,0,37,0.8)", border: "1px solid rgba(45,0,80,0.6)" }}
      >
        {summaryItems.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-start justify-between gap-4 px-5 py-3.5 ${
              i < summaryItems.length - 1 ? "border-b" : ""
            }`}
            style={{ borderColor: "rgba(45,0,80,0.5)" }}
          >
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex-shrink-0 pt-0.5">
              {item.label}
            </span>
            <span className="text-sm text-white text-right">{item.value}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground mb-2">
        Puedes editar todo esto en{" "}
        <span style={{ color: "#C084FC" }}>Configuración</span> en cualquier momento.
      </p>

      {error && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-xs text-left leading-relaxed"
          style={{
            background: "rgba(255,50,50,0.08)",
            border: "1px solid rgba(255,80,80,0.3)",
            color: "#f87171",
          }}
        >
          <span className="font-bold">Error al guardar: </span>{error}
        </div>
      )}

      <NextButton
        onClick={onFinish}
        label={isLoading ? "Guardando…" : "Ir al dashboard →"}
        loading={isLoading}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  businessType: "",
  studioName: "",
  city: "",
  country: "Chile",
  styles: [],
  avgTicket: "",
  citasPerMonth: 15,
  mainProblem: "",
  instagram: "",
  hasMeta: false,
};

// Initializer used in useState — runs once on client, safe to call Intl
function makeInitial(): FormData {
  return { ...INITIAL, country: detectCountryName() };
}

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [data, setData]         = useState<FormData>(makeInitial);
  const [isLoading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const patch = (p: Partial<FormData>) => setData((prev) => ({ ...prev, ...p }));
  const next  = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const handleFinish = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType:  data.businessType,
          studioName:    data.studioName,
          city:          data.city,
          country:       data.country,
          styles:        data.styles,
          avgTicket:     data.avgTicket,
          citasPerMonth: data.citasPerMonth,
          instagram:     data.instagram,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error desconocido. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#000000" }}
    >
      {/* Centered column — max 560px */}
      <div className="w-full" style={{ maxWidth: 560 }}>
        {/* Logo */}
        <div className="mb-8 text-center">
          <span
            className="font-playfair text-xl font-bold tracking-tight"
            style={{ color: "#8B00FF" }}
          >
            TattooVision
          </span>
          <span className="font-playfair text-xl font-bold tracking-tight text-white"> AI</span>
        </div>

        {/* Progress bar — sits above the card */}
        <ProgressBar step={step} />

        {/* Card */}
        <div
          className="w-full rounded-2xl p-8"
          style={{
            background: "#0D0010",
            border: "1px solid rgba(45,0,80,0.7)",
            boxShadow: "0 0 60px rgba(139,0,255,0.08)",
          }}
        >

          {step === 1 && (
            <Step1
              value={data.businessType}
              onChange={(v) => patch({ businessType: v })}
              onNext={next}
            />
          )}
          {step === 2 && <Step2 data={data} onChange={patch} onNext={next} />}
          {step === 3 && <Step3 data={data} onChange={patch} onNext={next} />}
          {step === 4 && <Step4 data={data} onChange={patch} onNext={next} />}
          {step === 5 && <Step5 data={data} onChange={patch} onNext={next} />}
          {step === 6 && (
            <Step6
              data={data}
              onFinish={handleFinish}
              isLoading={isLoading}
              error={apiError}
            />
          )}
        </div>

        {/* Step counter */}
        <p className="mt-5 text-center text-xs text-muted-foreground font-mono">
          Paso {step} de {TOTAL_STEPS}
        </p>
      </div>
    </div>
  );
}
