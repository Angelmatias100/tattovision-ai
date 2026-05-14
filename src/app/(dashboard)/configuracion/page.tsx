"use client";

import { useState } from "react";
import {
  Building2, Users, Link2, CreditCard, Plus, Check, X,
  ToggleLeft, ToggleRight, Eye, EyeOff, Zap,
  ExternalLink, CheckCircle, AtSign,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "negocio" | "artistas" | "integraciones" | "plan";

interface Artist {
  id: string;
  initials: string;
  name: string;
  styles: string[];
  active: boolean;
}

// ── Static data ───────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "negocio",       label: "Negocio",       icon: Building2  },
  { id: "artistas",      label: "Artistas",      icon: Users      },
  { id: "integraciones", label: "Integraciones", icon: Link2      },
  { id: "plan",          label: "Plan",          icon: CreditCard },
];

const STYLE_OPTIONS = [
  "Realismo", "Tradicional", "Neotradicional", "Blackwork",
  "Acuarela", "Geométrico", "Japonés", "Minimalismo",
  "Tribal", "Old School",
];

const INITIAL_ARTISTS: Artist[] = [
  { id: "ar1", initials: "ML", name: "Matías López",   styles: ["Realismo", "Blackwork"],          active: true  },
  { id: "ar2", initials: "AR", name: "Ana Ríos",       styles: ["Acuarela", "Neotradicional"],      active: true  },
  { id: "ar3", initials: "CV", name: "Carlos Vera",    styles: ["Japonés", "Geométrico"],           active: true  },
  { id: "ar4", initials: "SP", name: "Sofía Paredes",  styles: ["Minimalismo", "Old School"],       active: false },
];

const BILLING_HISTORY = [
  { id: "b1", date: "1 May 2026",  amount: "$49.00", plan: "Pro",   status: "Pagado" },
  { id: "b2", date: "1 Abr 2026",  amount: "$49.00", plan: "Pro",   status: "Pagado" },
  { id: "b3", date: "1 Mar 2026",  amount: "$49.00", plan: "Pro",   status: "Pagado" },
  { id: "b4", date: "1 Feb 2026",  amount: "$19.00", plan: "Starter", status: "Pagado" },
];

const PLAN_OPTIONS = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    tokens: 50,
    features: ["50 TV Tokens / mes", "3 automatizaciones", "CRM básico", "1 artista"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    tokens: 200,
    features: ["200 TV Tokens / mes", "6 automatizaciones", "CRM completo", "Artistas ilimitados", "Campañas Meta Ads"],
    current: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$99",
    tokens: 600,
    features: ["600 TV Tokens / mes", "Automatizaciones ilimitadas", "Multi-estudio", "Soporte prioritario", "API access"],
  },
];

// ── Small shared pieces ───────────────────────────────────────────────────────

function ArtistToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-pressed={active}>
      {active ? (
        <ToggleRight className="w-8 h-8 text-primary drop-shadow-[0_0_6px_rgba(139,0,255,0.5)]" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-muted-foreground" />
      )}
    </button>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-border p-6 ${className}`}
      style={{ background: "rgba(26,0,37,0.7)", backdropFilter: "blur(12px)" }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
    />
  );
}

// ── Tab: Negocio ──────────────────────────────────────────────────────────────

function TabNegocio() {
  const [studioName,  setStudioName]  = useState("TattooVision Studio");
  const [city,        setCity]        = useState("Buenos Aires");
  const [instagram,   setInstagram]   = useState("@tattoovision.ar");
  const [avgTicket,   setAvgTicket]   = useState("85000");
  const [monthlyGoal, setMonthlyGoal] = useState("800000");
  const [styles,      setStyles]      = useState<string[]>(["Realismo", "Blackwork", "Japonés"]);
  const [saved,       setSaved]       = useState(false);

  const toggleStyle = (s: string) =>
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionCard>
        <h3 className="text-sm font-bold text-foreground mb-5">Información del estudio</h3>
        <div className="space-y-4">
          <div>
            <Label>Nombre del estudio</Label>
            <TextInput value={studioName} onChange={setStudioName} placeholder="Mi estudio" />
          </div>
          <div>
            <Label>Ciudad</Label>
            <TextInput value={city} onChange={setCity} placeholder="Buenos Aires" />
          </div>
          <div>
            <Label>Instagram</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@estudio"
                className="w-full bg-[#1A0025] border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="text-sm font-bold text-foreground mb-5">Objetivos financieros</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ticket promedio (ARS)</Label>
            <TextInput value={avgTicket} onChange={setAvgTicket} placeholder="85000" />
          </div>
          <div>
            <Label>Meta mensual (ARS)</Label>
            <TextInput value={monthlyGoal} onChange={setMonthlyGoal} placeholder="800000" />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="text-sm font-bold text-foreground mb-5">Estilos del estudio</h3>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((s) => {
            const selected = styles.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleStyle(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150"
                style={{
                  background:   selected ? "rgba(139,0,255,0.15)" : "rgba(255,255,255,0.03)",
                  borderColor:  selected ? "rgba(139,0,255,0.4)"  : "rgba(255,255,255,0.1)",
                  color:        selected ? "#C084FC"              : "#988ca2",
                }}
              >
                {selected && <Check className="w-3 h-3 inline mr-1" />}
                {s}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <button
        onClick={handleSave}
        className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-150"
        style={{
          background: saved ? "#52C97A" : "#8B00FF",
          color: "#fff",
          boxShadow: saved ? "0 0 20px rgba(82,201,122,0.3)" : "0 0 20px rgba(139,0,255,0.3)",
        }}
      >
        {saved ? (
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Guardado</span>
        ) : (
          "Guardar cambios"
        )}
      </button>
    </div>
  );
}

// ── Tab: Artistas ─────────────────────────────────────────────────────────────

function TabArtistas() {
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);

  const toggleArtist = (id: string) =>
    setArtists((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );

  const AVATAR_COLORS: Record<string, string> = {
    ML: "#8B00FF", AR: "#62259b", CV: "#8147b9", SP: "#6A00C8",
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {artists.map((artist) => (
        <SectionCard key={artist.id}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style={{ background: AVATAR_COLORS[artist.initials] ?? "#8B00FF" }}
              >
                {artist.initials}
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{artist.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {artist.styles.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded border"
                      style={{
                        color: "#C084FC",
                        background: "rgba(139,0,255,0.08)",
                        borderColor: "rgba(139,0,255,0.2)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <ArtistToggle active={artist.active} onToggle={() => toggleArtist(artist.id)} />
          </div>
        </SectionCard>
      ))}

      <button
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-dashed border-primary/40 text-primary text-sm font-bold hover:bg-primary/5 transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Agregar artista
      </button>
    </div>
  );
}

// ── Tab: Integraciones ────────────────────────────────────────────────────────

function TabIntegraciones() {
  const [metaConnected,  setMetaConnected]  = useState(false);
  const [resendKey,      setResendKey]      = useState("re_••••••••••••••••");
  const [showKey,        setShowKey]        = useState(false);
  const [keySaved,       setKeySaved]       = useState(false);

  const handleKeySave = () => {
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Meta Business */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0082FB, #0D47A1)", border: "1px solid rgba(0,130,251,0.3)" }}
            >
              <span className="text-white font-black text-sm">f</span>
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Meta Business</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Conecta tu cuenta de Facebook e Instagram Ads para lanzar campañas directamente.
              </p>
            </div>
          </div>
          {metaConnected ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border"
                style={{ color: "#52C97A", background: "#52C97A1A", borderColor: "#52C97A40" }}
              >
                <CheckCircle className="w-3 h-3" />
                Conectado
              </span>
              <button
                onClick={() => setMetaConnected(false)}
                className="p-1 rounded hover:bg-white/5 text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMetaConnected(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-[#0082FB]/40 text-[#0082FB] hover:bg-[#0082FB]/10 transition-colors flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Conectar vía OAuth
            </button>
          )}
        </div>
      </SectionCard>

      {/* Supabase */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1A1A2E, #3ECF8E22)", border: "1px solid rgba(62,207,142,0.3)" }}
            >
              <span className="text-[#3ECF8E] font-black text-sm">S</span>
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Supabase</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Base de datos en tiempo real para leads, citas y contenido del estudio.
              </p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0"
            style={{ color: "#52C97A", background: "#52C97A1A", borderColor: "#52C97A40" }}
          >
            <CheckCircle className="w-3 h-3" />
            Conectado
          </span>
        </div>
      </SectionCard>

      {/* Resend */}
      <SectionCard>
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <span className="text-foreground font-black text-sm">@</span>
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">Resend</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Proveedor de email transaccional para notificaciones y recordatorios.
            </p>
          </div>
        </div>
        <div>
          <Label>API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                className="w-full bg-[#1A0025] border border-border rounded-lg px-4 py-2.5 text-sm text-foreground pr-10 focus:border-primary outline-none transition-colors font-mono"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleKeySave}
              className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 flex-shrink-0"
              style={{
                background:  keySaved ? "#52C97A" : "#8B00FF",
                color:       "#fff",
                boxShadow:   keySaved ? "0 0 16px rgba(82,201,122,0.3)" : "0 0 16px rgba(139,0,255,0.3)",
              }}
            >
              {keySaved ? <CheckCircle className="w-4 h-4" /> : "Guardar"}
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab: Plan ─────────────────────────────────────────────────────────────────

function TabPlan() {
  const TOKEN_USED = 147;
  const TOKEN_MAX  = 200;
  const tokenPct   = (TOKEN_USED / TOKEN_MAX) * 100;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-4">
        {PLAN_OPTIONS.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border p-5 flex flex-col gap-4 transition-all duration-200"
            style={{
              background:  plan.current ? "rgba(139,0,255,0.1)"   : "rgba(26,0,37,0.7)",
              borderColor: plan.current ? "rgba(139,0,255,0.5)"   : "rgba(45,0,80,0.6)",
              boxShadow:   plan.current ? "0 0 30px rgba(139,0,255,0.12)" : "none",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">{plan.name}</span>
              {plan.current && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ background: "rgba(139,0,255,0.2)", color: "#C084FC" }}
                >
                  ACTUAL
                </span>
              )}
            </div>

            <div>
              <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              <span className="text-xs text-muted-foreground"> / mes</span>
            </div>

            <ul className="space-y-1.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {!plan.current && (
              <button
                className="w-full py-2 rounded-lg text-xs font-bold border transition-colors"
                style={{
                  borderColor: plan.id === "agency" ? "rgba(139,0,255,0.4)" : "rgba(255,255,255,0.1)",
                  color:       plan.id === "agency" ? "#C084FC"             : "#988ca2",
                  background:  plan.id === "agency" ? "rgba(139,0,255,0.08)" : "rgba(255,255,255,0.03)",
                }}
              >
                {plan.id === "agency" ? "Actualizar" : "Downgrade"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Token usage */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">TV Tokens este mes</span>
          </div>
          <span className="text-sm font-mono text-foreground">
            <span className="text-primary font-bold">{TOKEN_USED}</span>
            <span className="text-muted-foreground"> / {TOKEN_MAX}</span>
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(45,0,80,0.6)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${tokenPct}%`,
              background: "linear-gradient(90deg, #8B00FF, #C084FC)",
              boxShadow: "0 0 8px rgba(139,0,255,0.5)",
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {TOKEN_MAX - TOKEN_USED} tokens restantes. Se renuevan el 1 de junio.
        </p>
      </SectionCard>

      {/* Billing history */}
      <section>
        <h3 className="text-sm font-bold text-foreground mb-4">Historial de facturación</h3>
        <div
          className="rounded-xl border border-border overflow-hidden"
          style={{ background: "rgba(13,0,16,0.8)" }}
        >
          <div className="grid grid-cols-[1fr_80px_100px_80px] gap-4 px-5 py-3 border-b border-border">
            {["Fecha", "Monto", "Plan", "Estado"].map((h) => (
              <span
                key={h}
                className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
              >
                {h}
              </span>
            ))}
          </div>
          {BILLING_HISTORY.map((row, i) => (
            <div
              key={row.id}
              className={`grid grid-cols-[1fr_80px_100px_80px] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors ${
                i < BILLING_HISTORY.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-sm text-foreground">{row.date}</span>
              <span className="text-sm font-mono text-foreground">{row.amount}</span>
              <span className="text-xs text-muted-foreground">{row.plan}</span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border w-fit"
                style={{ color: "#52C97A", background: "#52C97A1A", borderColor: "#52C97A40" }}
              >
                <CheckCircle className="w-3 h-3" />
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>("negocio");

  return (
    <div className="p-10 max-w-[1200px] mx-auto">
      {/* ── Header ── */}
      <header className="mb-8">
        <h2 className="font-playfair text-4xl font-bold text-foreground">Configuración</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona tu estudio, equipo e integraciones.
        </p>
      </header>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: "rgba(13,0,16,0.8)", border: "1px solid rgba(45,0,80,0.6)" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-150"
            style={{
              background:   tab === id ? "rgba(139,0,255,0.15)" : "transparent",
              color:        tab === id ? "#C084FC"              : "#988ca2",
              border:       tab === id ? "1px solid rgba(139,0,255,0.3)" : "1px solid transparent",
              boxShadow:    tab === id ? "0 0 12px rgba(139,0,255,0.1)" : "none",
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === "negocio"       && <TabNegocio />}
      {tab === "artistas"      && <TabArtistas />}
      {tab === "integraciones" && <TabIntegraciones />}
      {tab === "plan"          && <TabPlan />}
    </div>
  );
}
