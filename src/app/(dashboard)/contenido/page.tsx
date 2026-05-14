"use client";

import { useState, useCallback } from "react";
import {
  Film, BookOpen, Layers, FileText, Sparkles, Copy, Bookmark,
  PenLine, Plus, CalendarPlus, Zap, Filter, Trash2, LayoutGrid,
  Clock, CheckCircle, Globe, Search, ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "ideas" | "calendario" | "biblioteca";
type ContentType = "reel" | "historia" | "carrusel" | "post";
type ContentStatus = "borrador" | "aprobado" | "publicado";
type Objective =
  | "proceso" | "antesdespues" | "flash" | "estilo" | "testimonio" | "educativo";

interface LibraryItem {
  id: string;
  typeIcon: string;
  type: ContentType;
  title: string;
  status: ContentStatus;
  date: string;
  snippet: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const FORMAT_TYPES: { id: ContentType; icon: React.ElementType; label: string }[] = [
  { id: "reel",     icon: Film,     label: "Reel"     },
  { id: "historia", icon: BookOpen, label: "Historia" },
  { id: "carrusel", icon: Layers,   label: "Carrusel" },
  { id: "post",     icon: FileText, label: "Post"     },
];

const OBJECTIVES: { id: Objective; label: string }[] = [
  { id: "proceso",      label: "Mostrar proceso" },
  { id: "antesdespues", label: "Antes/después"   },
  { id: "flash",        label: "Flash tattoo"    },
  { id: "estilo",       label: "Estilo específico" },
  { id: "testimonio",   label: "Testimonio"      },
  { id: "educativo",    label: "Educativo"       },
];

const CAL_DAYS = [
  { label: "Lunes",   items: [{ type: "Reel",    title: "Reel: Realismo",    status: "publicado" as ContentStatus }] },
  { label: "Martes",  items: [{ type: "Post",    title: "Post: Cuidado",     status: "aprobado"  as ContentStatus }] },
  { label: "Miércoles", items: [{ type: "Historia", title: "Historia: Setup",  status: "borrador"  as ContentStatus }] },
  { label: "Jueves",  items: [] },
  { label: "Viernes", items: [{ type: "Carrusel", title: "Carrusel: Estilos", status: "aprobado"  as ContentStatus }] },
  { label: "Sábado",  items: [] },
  { label: "Domingo", items: [] },
];

const LIBRARY: LibraryItem[] = [
  {
    id: "1", typeIcon: "🎬", type: "reel", title: "Proceso completo — Realismo",
    status: "publicado", date: "20 Abr", snippet: "Lo que nadie te muestra de un tatuaje de realismo...",
  },
  {
    id: "2", typeIcon: "📖", type: "historia", title: "Detrás de Cámaras — Setup",
    status: "aprobado", date: "22 Abr", snippet: "Muestra la esterilización y el set up de hoy...",
  },
  {
    id: "3", typeIcon: "🖼️", type: "carrusel", title: "Evolución del Estilo 2022→2026",
    status: "borrador", date: "24 Abr", snippet: "Comparativa de tus trabajos de hace 3 años vs hoy...",
  },
  {
    id: "4", typeIcon: "📝", type: "post", title: "Guía: Cuidado del tatuaje nuevo",
    status: "publicado", date: "25 Abr", snippet: "Las primeras 72 horas son las más importantes...",
  },
  {
    id: "5", typeIcon: "🎬", type: "reel", title: "Flash Tattoos — Fin de semana",
    status: "aprobado", date: "26 Abr", snippet: "¿Quieres un flash este sábado? Últimos turnos disponibles...",
  },
  {
    id: "6", typeIcon: "📖", type: "historia", title: "Testimonio — Cliente satisfecha",
    status: "borrador", date: "28 Abr", snippet: "Sofía llegó con una idea y se fue con una obra de arte...",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ContentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  borrador:   { label: "Borrador",   color: "#988ca2", bg: "#988ca21A", icon: Clock       },
  aprobado:   { label: "Aprobado",   color: "#8B00FF", bg: "#8B00FF1A", icon: CheckCircle },
  publicado:  { label: "Publicado",  color: "#52C97A", bg: "#52C97A1A", icon: Globe       },
};

function StatusBadge({ status }: { status: ContentStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}50` }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── CSS Art Placeholder ───────────────────────────────────────────────────────

function ArtPlaceholder({ variant }: { variant: 1 | 2 }) {
  const grad = variant === 1
    ? "linear-gradient(135deg, #1A0025 0%, #3D0060 40%, #200030 70%, #0D0010 100%)"
    : "linear-gradient(135deg, #0D0010 0%, #1A0025 30%, #4B0082 60%, #200030 100%)";
  const accent = variant === 1 ? "#8B00FF" : "#6A00C8";
  return (
    <div className="h-48 relative overflow-hidden" style={{ background: grad }}>
      {/* Abstract circles */}
      <div className="absolute top-4 right-6 w-20 h-20 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />
      <div className="absolute bottom-8 left-4 w-28 h-28 rounded-full opacity-15"
        style={{ background: `radial-gradient(circle, #C084FC, transparent)` }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full opacity-30"
        style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
      {/* Fade to bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0010] to-transparent" />
    </div>
  );
}

// ── Tab: Ideas ────────────────────────────────────────────────────────────────

function TabIdeas() {
  const [selectedType, setSelectedType]       = useState<ContentType>("reel");
  const [selectedObjective, setSelectedObjective] = useState<Objective>("antesdespues");
  const [generating, setGenerating]           = useState(false);
  const [generated, setGenerated]             = useState(true); // show cards by default
  const [copiedId, setCopiedId]               = useState<string | null>(null);
  const [savedId, setSavedId]                 = useState<string | null>(null);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1400);
  }, []);

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSave = (id: string) => {
    setSavedId(id);
    setTimeout(() => setSavedId(null), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Generator card */}
      <section
        className="rounded-2xl p-8 relative overflow-hidden group"
        style={{ background: "rgba(26, 0, 37, 0.7)", backdropFilter: "blur(12px)", border: "1px solid #2D0050" }}
      >
        {/* Purple blur blob */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none transition-all duration-700 group-hover:scale-110"
          style={{ background: "rgba(139,0,255,0.1)", filter: "blur(80px)" }} />

        <div className="relative z-10 max-w-2xl">
          <h3 className="font-playfair text-2xl font-semibold text-foreground mb-6">
            ¿Qué tipo de contenido necesitas hoy?
          </h3>

          <div className="space-y-6">
            {/* Format type */}
            <div>
              <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest mb-3">
                Tipo de Formato
              </p>
              <div className="flex flex-wrap gap-2">
                {FORMAT_TYPES.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedType(id)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 transition-all ${
                      selectedType === id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Objective */}
            <div>
              <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest mb-3">
                Objetivo del contenido
              </p>
              <div className="flex flex-wrap gap-2">
                {OBJECTIVES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedObjective(id)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${
                      selectedObjective === id
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button + token badge */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-glow hover:shadow-glow-lg transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generando…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generar con IA ✨
                  </>
                )}
              </button>
              <div className="flex items-center gap-1.5 bg-[#1A0025] border border-primary/25 rounded-lg px-3 py-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono text-[11px] text-muted-foreground">5 tokens por idea</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generated idea cards */}
      {generated && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Full detail */}
          <div
            className="rounded-xl overflow-hidden flex flex-col border border-border hover:border-primary transition-colors"
            style={{ background: "rgba(26, 0, 37, 0.7)", backdropFilter: "blur(12px)" }}
          >
            <div className="p-4 border-b border-border bg-secondary/30">
              <span className="font-mono text-base text-primary">🎬 REEL — Proceso completo</span>
            </div>

            <div className="p-5 flex-1 space-y-4">
              {/* Hook */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Hook</p>
                <p className="font-semibold text-foreground text-sm leading-snug">
                  &ldquo;Lo que nadie te muestra de un tatuaje de realismo (el momento más difícil) 👀&rdquo;
                </p>
              </div>

              {/* Guion */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Guión</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground font-mono">
                  {[
                    ["0-3s",   "Hook visual — agujas en primer plano"],
                    ["3-8s",   "El cliente nervioso antes de empezar"],
                    ["8-20s",  "Time-lapse del proceso"],
                    ["20-25s", "Resultado final + reacción"],
                    ["25-30s", "CTA — \"¿Quieres el tuyo?\""],
                  ].map(([time, desc]) => (
                    <li key={time} className="flex gap-2">
                      <span className="text-primary shrink-0 w-12">{time}:</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Caption */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Caption</p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  &ldquo;Un proceso de 6 horas resumido en 30 segundos. El realismo requiere paciencia, técnica y una conexión especial con la piel…&rdquo;
                </p>
              </div>

              {/* Hashtags */}
              <p className="text-primary text-xs font-mono">
                #tatuaje #realismo #blacklotus #tattoovision
              </p>
            </div>

            <div className="p-3 bg-black/20 flex gap-2 border-t border-border">
              <button
                onClick={() => handleCopy("1")}
                title="Copiar"
                className={`p-2 rounded-lg bg-secondary flex-1 flex justify-center items-center transition-colors ${
                  copiedId === "1" ? "text-[#52C97A]" : "text-foreground hover:text-primary"
                }`}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSave("1")}
                title="Guardar"
                className={`p-2 rounded-lg bg-secondary flex-1 flex justify-center items-center transition-colors ${
                  savedId === "1" ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary font-bold text-xs flex-[2] flex items-center justify-center gap-1.5 hover:bg-primary/30 transition-colors">
                <PenLine className="w-3.5 h-3.5" /> Editar con IA
              </button>
            </div>
          </div>

          {/* Card 2: Teaser */}
          <div
            className="rounded-xl overflow-hidden flex flex-col border border-border opacity-85 hover:opacity-100 transition-opacity"
            style={{ background: "rgba(26, 0, 37, 0.7)", backdropFilter: "blur(12px)" }}
          >
            <div className="relative">
              <ArtPlaceholder variant={1} />
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                  Próxima Idea
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 space-y-3">
              <h4 className="font-playfair text-lg font-semibold text-foreground">
                📖 Story — Detrás de Cámaras
              </h4>
              <p className="text-sm text-muted-foreground font-mono">
                Muestra la esterilización y el set up de hoy para generar confianza absoluta en tu cliente.
              </p>
            </div>
            <div className="p-4 border-t border-border">
              <button className="w-full border border-primary text-primary py-2 rounded-lg font-bold text-sm hover:bg-primary/10 transition-colors">
                Desarrollar idea
              </button>
            </div>
          </div>

          {/* Card 3: Teaser */}
          <div
            className="rounded-xl overflow-hidden flex flex-col border border-border opacity-85 hover:opacity-100 transition-opacity"
            style={{ background: "rgba(26, 0, 37, 0.7)", backdropFilter: "blur(12px)" }}
          >
            <div className="relative">
              <ArtPlaceholder variant={2} />
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 rounded bg-[#62259b] text-white text-[10px] font-bold uppercase tracking-wider">
                  Tendencia
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 space-y-3">
              <h4 className="font-playfair text-lg font-semibold text-foreground">
                🖼️ Carrusel — Evolución del Estilo
              </h4>
              <p className="text-sm text-muted-foreground font-mono">
                Comparativa de tus trabajos de hace 3 años vs hoy. El storytelling del progreso nunca falla.
              </p>
            </div>
            <div className="p-4 border-t border-border">
              <button className="w-full border border-primary text-primary py-2 rounded-lg font-bold text-sm hover:bg-primary/10 transition-colors">
                Desarrollar idea
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ── Tab: Calendario ───────────────────────────────────────────────────────────

const CAL_STATUS_COLORS: Record<ContentStatus, string> = {
  publicado: "#52C97A",
  aprobado:  "#8B00FF",
  borrador:  "#988ca2",
};

function TabCalendario() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-playfair text-xl font-semibold text-foreground">Calendario Semanal</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1A0025] border border-primary/25 rounded-lg px-3 py-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[11px] text-muted-foreground">15 tokens</span>
          </div>
          <button className="border border-primary text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 shadow-glow-sm">
            <CalendarPlus className="w-4 h-4" />
            Generar semana completa con IA
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-4">
        {CAL_DAYS.map(({ label, items }) => (
          <div
            key={label}
            className={`min-w-[140px] p-3 rounded-lg border h-52 flex flex-col ${
              items.length === 0
                ? "border-dashed border-border/50 bg-card/40"
                : "bg-card border-border"
            }`}
          >
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center mb-3">
              {label}
            </p>

            <div className="flex-1 space-y-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="bg-secondary p-2 rounded"
                  style={{ borderLeft: `4px solid ${CAL_STATUS_COLORS[item.status]}` }}
                >
                  <p
                    className="text-[10px] font-bold mb-0.5"
                    style={{ color: CAL_STATUS_COLORS[item.status] }}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </p>
                  <p className="text-[11px] text-foreground truncate">{item.title}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto flex justify-center pt-2">
              <button className="text-primary hover:text-foreground transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Estado:</p>
        {(["publicado", "aprobado", "borrador"] as ContentStatus[]).map((s) => {
          const cfg = STATUS_CFG[s];
          return (
            <div key={s} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-xs text-muted-foreground">{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Biblioteca ───────────────────────────────────────────────────────────

function TabBiblioteca() {
  const [search, setSearch]          = useState("");
  const [filterType, setFilterType]  = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filtered = LIBRARY.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q);
    const matchType   = filterType   === "todos" || item.type   === filterType;
    const matchStatus = filterStatus === "todos" || item.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A0025] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#1A0025] border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer"
          >
            <option value="todos">Todos los tipos</option>
            <option value="reel">Reel</option>
            <option value="historia">Historia</option>
            <option value="carrusel">Carrusel</option>
            <option value="post">Post</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1A0025] border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="aprobado">Aprobado</option>
            <option value="publicado">Publicado</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <p className="text-xs text-muted-foreground ml-auto font-mono">
          {filtered.length} piezas
        </p>
      </div>

      {/* Content grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border hover:border-primary/50 transition-colors overflow-hidden flex flex-col group"
              style={{ background: "rgba(26, 0, 37, 0.7)", backdropFilter: "blur(12px)" }}
            >
              {/* Type header */}
              <div className="px-4 py-3 border-b border-border bg-secondary/20 flex items-center justify-between">
                <span className="text-sm font-mono text-foreground">{item.typeIcon} {item.title}</span>
              </div>

              <div className="p-4 flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-[10px] text-muted-foreground font-mono">{item.date}</span>
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                  &ldquo;{item.snippet}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-border flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-bold border border-border rounded hover:bg-secondary hover:border-primary/40 transition-colors text-foreground flex items-center justify-center gap-1">
                  <PenLine className="w-3.5 h-3.5" /> Editar
                </button>
                <button className="flex-1 py-1.5 text-xs font-bold border border-border rounded hover:bg-secondary hover:border-primary/40 transition-colors text-foreground flex items-center justify-center gap-1">
                  <LayoutGrid className="w-3.5 h-3.5" /> Duplicar
                </button>
                <button className="py-1.5 px-3 text-xs font-bold border border-destructive/30 rounded hover:bg-destructive/10 transition-colors text-destructive flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Filter className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-sm">No se encontró contenido con esos filtros.</p>
          <button
            onClick={() => { setSearch(""); setFilterType("todos"); setFilterStatus("todos"); }}
            className="mt-3 text-primary text-xs hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContenidoPage() {
  const [tab, setTab] = useState<Tab>("ideas");

  return (
    <div className="p-10 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-playfair text-4xl font-bold text-foreground">Contenido</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Crea, organiza y distribuye tu arte digitalmente.
          </p>
        </div>
        <button
          onClick={() => setTab("ideas")}
          className="bg-primary text-white flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-glow hover:shadow-glow-lg transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Generar ideas
        </button>
      </header>

      {/* ── Tabs ── */}
      <div className="flex gap-8 border-b border-border mb-8">
        {(["ideas", "calendario", "biblioteca"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-primary"
            }`}
          >
            {t === "ideas" ? "Ideas" : t === "calendario" ? "Calendario" : "Biblioteca"}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === "ideas"      && <TabIdeas />}
      {tab === "calendario" && <TabCalendario />}
      {tab === "biblioteca" && <TabBiblioteca />}

      {/* ── Footer ── */}
      <footer className="mt-12 border-t border-border py-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
        <p>© 2024 TattooVision AI. Todos los derechos reservados.</p>
        <div className="flex gap-6 mt-3 md:mt-0">
          {["Privacidad", "Términos", "Soporte", "Contacto"].map((item) => (
            <a key={item} href="#" className="hover:text-foreground transition-colors">
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
