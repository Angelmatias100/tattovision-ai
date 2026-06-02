import Link from "next/link";
import {
  Users,
  Calendar,
  Megaphone,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { PricingCards } from "@/components/PricingCards";

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-border">
      <nav className="flex justify-between items-center h-16 px-5 md:px-10 max-w-[1440px] mx-auto">
        <span className="font-playfair text-xl font-bold text-foreground uppercase tracking-wide">
          TattooVision AI
        </span>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors text-sm">
            Características
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
            Precios
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/sign-up"
            className="bg-primary text-white text-sm font-bold px-5 py-2 rounded transition-shadow hover:shadow-glow active:opacity-80"
          >
            Prueba gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}

// ── Dashboard Mockup ──────────────────────────────────────────
function DashboardMockup() {
  const kpis = [
    { label: "LEADS", value: "24", delta: "+8 hoy" },
    { label: "TOKENS", value: "148", delta: "52 rest." },
    { label: "CITAS", value: "6", delta: "2 pend." },
    { label: "ROI", value: "+32%", delta: "vs mes ant." },
  ];
  const bars = [85, 62, 91, 48, 74, 55, 88];

  return (
    <div className="relative max-w-5xl mx-auto mt-12">
      <div className="absolute -inset-6 bg-primary/15 blur-[80px] rounded-full" />
      <div className="relative bg-tv-surface border border-tv-border rounded-xl overflow-hidden shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-tv-border bg-tv-elevated">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
          <div className="ml-4 flex-1 bg-tv-border/40 rounded text-center">
            <span className="font-mono text-[10px] text-muted-foreground">
              app.tattoovision.ai/dashboard
            </span>
          </div>
        </div>

        <div className="p-5">
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {kpis.map(({ label, value, delta }) => (
              <div
                key={label}
                className="bg-tv-elevated border border-tv-border rounded-lg p-3"
              >
                <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1">
                  {label}
                </p>
                <p className="font-mono text-2xl font-semibold text-foreground leading-none">
                  {value}
                </p>
                <p className="font-mono text-[10px] text-tv-lavender mt-1">
                  {delta}
                </p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Bar chart */}
            <div className="col-span-2 bg-tv-elevated border border-tv-border rounded-lg p-4">
              <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-4">
                Leads / Semana
              </p>
              <div className="flex items-end gap-2 h-20">
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div
                      className="rounded-sm"
                      style={{
                        height: `${h}%`,
                        background:
                          i === 4
                            ? "#8B00FF"
                            : "rgba(139,0,255,0.3)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline mini */}
            <div className="bg-tv-elevated border border-tv-border rounded-lg p-4">
              <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-3">
                Pipeline
              </p>
              {[
                { label: "Nuevos", w: "w-full", color: "bg-primary" },
                { label: "Contactados", w: "w-4/5", color: "bg-primary/70" },
                { label: "Reservados", w: "w-1/2", color: "bg-primary/40" },
              ].map(({ label, w, color }) => (
                <div key={label} className="mb-2">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-tv-border rounded-full">
                    <div className={`h-full rounded-full ${w} ${color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden px-5 md:px-10">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto text-center relative z-10">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-primary mb-4">
          TattooVision AI
        </p>

        <h1 className="font-playfair text-4xl md:text-6xl font-bold text-foreground mb-4 max-w-4xl mx-auto leading-tight tracking-tight">
          El estratega de marketing para tu estudio de tatuaje
        </h1>

        <p className="font-sans text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Consigue más citas de forma predecible con IA. Sin perder tiempo, sin
          improvisar campañas.
        </p>

        <div className="flex justify-center mb-4">
          <Link
            href="/sign-up"
            className="bg-primary text-white px-8 py-4 rounded-lg font-sans font-bold text-base transition-shadow hover:shadow-glow active:scale-95 inline-flex items-center justify-center gap-2"
          >
            Prueba gratis
            <ChevronRight size={18} />
          </Link>
        </div>

        <p className="font-mono text-xs text-muted-foreground mb-12">
          Sin tarjeta de crédito · Configura en 5 minutos
        </p>

        <DashboardMockup />
      </div>
    </section>
  );
}

// ── Pain Points ───────────────────────────────────────────────
function PainPoints() {
  const points = [
    {
      icon: "💬",
      title: "Leads que se pierden en Instagram",
      body: "Los mensajes llegan, se entierran en el buzón y nunca se convierten en citas reales.",
    },
    {
      icon: "📅",
      title: "Sin sistema para conseguir citas",
      body: "Tu agenda depende de que alguien te escriba. Algunos meses llenos, otros vacíos y sin control.",
    },
    {
      icon: "📢",
      title: "No sabes hacer campañas en Meta",
      body: "Invertiste en anuncios y no funcionaron. No sabes qué cambiar ni por qué falla tu estrategia.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-5 md:px-10 bg-background">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-center text-foreground mb-16">
          ¿Te identificas con esto?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {points.map(({ icon, title, body }) => (
            <div
              key={title}
              className="p-8 bg-card border border-border rounded-xl hover:border-primary transition-colors duration-300"
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-playfair text-xl font-semibold text-foreground mb-3">
                {title}
              </h3>
              <p className="font-sans text-base text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────
const features = [
  {
    icon: Users,
    title: "CRM de Leads",
    body: "Gestiona todos tus prospectos desde una sola bandeja de entrada inteligente que prioriza el interés.",
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    body: "Optimiza tus huecos libres automáticamente y envía recordatorios para reducir el no-show al mínimo.",
  },
  {
    icon: Megaphone,
    title: "Campañas Meta con IA",
    body: "Nuestra IA diseña y ajusta tus anuncios en Facebook e Instagram para maximizar el retorno de inversión.",
  },
  {
    icon: Sparkles,
    title: "Generador de Contenido",
    body: "Crea descripciones, copies y ganchos para tus tatuajes que realmente conecten con tu audiencia ideal.",
  },
];

function Features() {
  return (
    <section id="features" className="py-16 md:py-24 px-5 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-primary mb-2">
            Herramientas Elite
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-foreground">
            Todo lo que necesitas para crecer
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="p-10 bg-card border border-border rounded-xl flex items-start gap-6 hover:border-primary/50 transition-colors duration-300"
            >
              <Icon className="text-primary shrink-0 mt-0.5" size={32} strokeWidth={1.5} />
              <div>
                <h3 className="font-playfair text-xl font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="font-sans text-base text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────
const tokenCosts = [
  { action: "Crear campaña publicitaria",        cost: 25 },
  { action: "Estrategia mensual personalizada",  cost: 10 },
  { action: "Idea de contenido (Copy + Hook)",   cost: 5  },
  { action: "Automatización enviada (Lead)",     cost: 2  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 px-5 md:px-10 bg-background">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-foreground">
            Planes que crecen contigo
          </h2>
        </div>

        {/* Free tier banner */}
        <div className="flex items-center justify-between gap-4 mb-8 px-6 py-4 rounded-xl border border-border bg-card/50">
          <div>
            <p className="text-sm font-medium text-foreground">
              ¿Quieres explorar primero?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Accede con funcionalidades limitadas, sin tarjeta de crédito.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Prueba gratis
            <ChevronRight size={15} />
          </Link>
        </div>

        <PricingCards />

        {/* TV Token explainer */}
        <div className="grid md:grid-cols-2 gap-6 items-center pt-10 border-t border-border/30">
          <div className="p-8 bg-card border border-border rounded-xl">
            <h4 className="font-playfair text-xl font-semibold text-foreground mb-4">
              ¿Qué es un TV Token?
            </h4>
            <p className="font-sans text-base text-muted-foreground leading-relaxed">
              Los TV Tokens son la energía de TattooVision que permite a nuestra
              IA realizar acciones automáticas por ti. Un sistema flexible donde
              solo pagas por la potencia que usas para escalar tu estudio.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-tv-elevated text-primary text-[10px] uppercase tracking-widest font-mono font-bold">
                <tr>
                  <th className="px-6 py-3">Acción IA</th>
                  <th className="px-6 py-3 text-right">Costo (tokens)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {tokenCosts.map(({ action, cost }) => (
                  <tr key={action}>
                    <td className="px-6 py-4 font-sans text-foreground">
                      {action}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-primary">
                      {cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-32 px-5 md:px-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black to-primary/10 opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="font-playfair text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
          Empieza a llenar tu agenda hoy
        </h2>
        <p className="font-sans text-lg text-muted-foreground mb-8 leading-relaxed">
          Sin tarjeta de crédito. Configura en 5 minutos y empieza a ver
          resultados esta semana.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-primary text-white px-12 py-5 rounded-lg font-playfair text-xl font-semibold hover:shadow-glow transition-shadow active:scale-95 mb-6"
        >
          Crear cuenta gratis
          <ChevronRight size={20} />
        </Link>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Probado por artistas de todo el mundo
        </p>
      </div>
    </section>
  );
}

// ── WhatsApp floating button ──────────────────────────────────
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/56936119298"
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-50"
      aria-label="Chatea con nosotros por WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:bg-[#1fbe5a] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </span>
      <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chatea con nosotros
      </span>
    </a>
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border bg-tv-surface">
      <div className="flex flex-col md:flex-row justify-between items-center px-5 md:px-10 max-w-[1440px] mx-auto py-8 gap-6">
        <div>
          <span className="font-playfair text-xl font-bold text-foreground uppercase">
            TattooVision AI
          </span>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            © {new Date().getFullYear()} TattooVision AI. Todos los derechos
            reservados.
          </p>
        </div>
        <div className="flex gap-8">
          <a href="/privacy" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">Privacidad</a>
          <a href="/terms" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">Términos</a>
          <a href="mailto:support@tattoovision.ai" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">Soporte</a>
          <a href="mailto:support@tattoovision.ai" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 overflow-x-hidden">
        <Hero />
        <PainPoints />
        <Features />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
