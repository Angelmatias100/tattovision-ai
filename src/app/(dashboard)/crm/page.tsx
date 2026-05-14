"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  MoreVertical,
  Clock,
  MessageCircle,
  X,
  Send,
  MoveUp,
  CalendarPlus,
  ChevronDown,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type LeadStatus =
  | "nuevo"
  | "respondido"
  | "consulta"
  | "presupuesto"
  | "deposito"
  | "confirmado"
  | "realizado"
  | "reactivar";

interface HistoryEvent {
  time: string;
  title: string;
  desc: string;
  active?: boolean;
}

interface Lead {
  id: string;
  name: string;
  initials: string;
  instagram: string;
  style: string;
  budget?: string;
  daysAgo: string;
  messages: number;
  status: LeadStatus;
  artist: string;
  artistInitials: string;
  phone?: string;
  email?: string;
  bodyZone?: string;
  notes?: string;
  source?: string;
  history: HistoryEvent[];
}

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: {
  id: LeadStatus;
  label: string;
  color: string;
  badgeBg: string;
}[] = [
  { id: "nuevo", label: "NUEVO", color: "#5B8EF0", badgeBg: "#5B8EF01A" },
  { id: "respondido", label: "RESPONDIDO", color: "#8B00FF", badgeBg: "#8B00FF1A" },
  { id: "consulta", label: "CONSULTA", color: "#6A00C8", badgeBg: "#6A00C81A" },
  { id: "presupuesto", label: "PRESUPUESTO", color: "#FFB547", badgeBg: "#FFB5471A" },
  { id: "deposito", label: "DEPÓSITO", color: "#FF8C00", badgeBg: "#FF8C001A" },
  { id: "confirmado", label: "CONFIRMADO", color: "#52C97A", badgeBg: "#52C97A1A" },
  { id: "realizado", label: "REALIZADO", color: "#988ca2", badgeBg: "#988ca21A" },
  { id: "reactivar", label: "REACTIVAR", color: "#FF3B3B", badgeBg: "#FF3B3B1A" },
];

// ── Lead data ────────────────────────────────────────────────────────────────

const LEADS: Lead[] = [
  {
    id: "1", name: "Sofía Martínez", initials: "SM", instagram: "@sofi.ink",
    style: "BLACKWORK", budget: "$200–$350", daysAgo: "Hace 2d", messages: 0,
    status: "nuevo", artist: "Matías López", artistInitials: "ML",
    phone: "+34 612 345 678", email: "sofia.mtz@email.com",
    bodyZone: "Antebrazo exterior", source: "Instagram",
    notes: "Interesada en un diseño tipo mandala con sombreado de puntos. Prefiere citas por la tarde. Sin alergias reportadas.",
    history: [
      { time: "HOY", title: "Formulario recibido", desc: "Lead generado automáticamente vía Web Widget.", active: true },
      { time: "12:10", title: "Respuesta pendiente", desc: "El sistema notificó al artista asignado." },
    ],
  },
  {
    id: "2", name: "Marcos Díaz", initials: "MD", instagram: "@marcos_tatt",
    style: "REALISMO", budget: "$400–$600", daysAgo: "Hace 3d", messages: 1,
    status: "nuevo", artist: "Matías López", artistInitials: "ML",
    phone: "+34 611 222 333", email: "marcos.diaz@email.com",
    bodyZone: "Pecho", source: "Instagram",
    notes: "Quiere retrato de su mascota. Traerá fotos a la consulta.",
    history: [
      { time: "HOY", title: "Lead recibido", desc: "Mensaje directo en Instagram.", active: true },
    ],
  },
  {
    id: "3", name: "Ana Torres", initials: "AT", instagram: "@ana.tattoo",
    style: "FINE LINE", budget: "$150–$250", daysAgo: "Hace 1d", messages: 0,
    status: "nuevo", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Muñeca", source: "Web",
    history: [{ time: "AYER", title: "Formulario recibido", desc: "Lead generado vía formulario web.", active: true }],
  },
  {
    id: "4", name: "Carlos Ruiz", initials: "CR", instagram: "@crl.ink",
    style: "GEOMETRIC", budget: "$300–$500", daysAgo: "Hace 4d", messages: 2,
    status: "nuevo", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Espalda", source: "Referido",
    history: [{ time: "Hace 4d", title: "Lead captado", desc: "Referido por cliente anterior.", active: true }],
  },
  {
    id: "5", name: "Javier Rico", initials: "JR", instagram: "@javi.rico",
    style: "REALISMO", budget: "$500–$800", daysAgo: "Hace 1h", messages: 3,
    status: "respondido", artist: "Matías López", artistInitials: "ML",
    phone: "+34 644 555 666", email: "javier.rico@email.com",
    bodyZone: "Manga completa", source: "Instagram",
    history: [
      { time: "HOY", title: "Mensaje enviado", desc: "Primera respuesta enviada por el artista.", active: true },
      { time: "Hace 1d", title: "Lead recibido", desc: "DM en Instagram." },
    ],
  },
  {
    id: "6", name: "María Font", initials: "MF", instagram: "@maria.font",
    style: "WATERCOLOR", budget: "$200–$300", daysAgo: "Hace 3h", messages: 5,
    status: "respondido", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Costado", source: "Instagram",
    history: [{ time: "Hace 3h", title: "Respondido", desc: "Cliente solicitó fotos de portfolio.", active: true }],
  },
  {
    id: "7", name: "Luis Vera", initials: "LV", instagram: "@luisv.tatt",
    style: "TRADITIONAL", budget: "$150–$200", daysAgo: "Hace 5h", messages: 2,
    status: "respondido", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Tobillo", source: "Web",
    history: [{ time: "Hace 5h", title: "Respondido", desc: "Enviado catálogo de estilos.", active: true }],
  },
  {
    id: "8", name: "Elena Gil", initials: "EG", instagram: "@elena_art",
    style: "FINE LINE", budget: "$180–$280", daysAgo: "Hace 2d", messages: 4,
    status: "consulta", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Clavícula", source: "Instagram",
    notes: "Quiere algo minimalista. Consultó sobre tiempos de cicatrización.",
    history: [
      { time: "Hace 2d", title: "Consulta en curso", desc: "Intercambio de referencias de diseño.", active: true },
    ],
  },
  {
    id: "9", name: "Julian Ramos", initials: "JR", instagram: "@jul_ink",
    style: "TRADITIONAL", budget: "$200–$350", daysAgo: "Hace 1d", messages: 6,
    status: "consulta", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Pierna", source: "Referido",
    history: [{ time: "Hace 1d", title: "Consulta activa", desc: "Ajustando detalles del diseño.", active: true }],
  },
  {
    id: "10", name: "Beatriz Lara", initials: "BL", instagram: "@bea.lara",
    style: "NEO-TRAD", budget: "$350–$500", daysAgo: "Hace 3d", messages: 3,
    status: "consulta", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Hombro", source: "Instagram",
    history: [{ time: "Hace 3d", title: "Revisando referencias", desc: "Cliente envió imágenes de inspiración.", active: true }],
  },
  {
    id: "11", name: "Pedro Vega", initials: "PV", instagram: "@pedro.v",
    style: "BLACKWORK", budget: "$600–$900", daysAgo: "Hace 5d", messages: 8,
    status: "presupuesto", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Espalda completa", source: "Web",
    notes: "Presupuesto enviado. Esperando confirmación.",
    history: [
      { time: "Hace 5d", title: "Presupuesto enviado", desc: "PDF detallado enviado por email.", active: true },
      { time: "Hace 7d", title: "Consulta completada", desc: "Diseño aprobado tras dos revisiones." },
    ],
  },
  {
    id: "12", name: "Natalia Kim", initials: "NK", instagram: "@nati.kim",
    style: "JAPANESE", budget: "$400–$600", daysAgo: "Hace 4d", messages: 5,
    status: "presupuesto", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Manga", source: "Instagram",
    history: [{ time: "Hace 4d", title: "Presupuesto enviado", desc: "Cliente evaluando opciones.", active: true }],
  },
  {
    id: "13", name: "Roberto Cruz", initials: "RC", instagram: "@rob.cruz",
    style: "REALISMO", budget: "$350–$500", daysAgo: "Hace 6d", messages: 10,
    status: "deposito", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Antebrazo", source: "Referido",
    history: [
      { time: "Hace 6d", title: "Depósito recibido", desc: "$100 recibidos para reservar cita.", active: true },
    ],
  },
  {
    id: "14", name: "Isabel Nava", initials: "IN", instagram: "@isa.nava",
    style: "FINE LINE", budget: "$200–$300", daysAgo: "Hace 7d", messages: 7,
    status: "deposito", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Cuello", source: "Instagram",
    history: [{ time: "Hace 7d", title: "Depósito recibido", desc: "Pago parcial confirmado.", active: true }],
  },
  {
    id: "15", name: "Carla Moon", initials: "CM", instagram: "@carla_moon",
    style: "LETTERING", budget: "$150–$250", daysAgo: "Hace 8d", messages: 12,
    status: "confirmado", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Antebrazo interior", source: "Web",
    history: [{ time: "Hace 8d", title: "Cita confirmada", desc: "Agendado para el 30 de abril, 14:00.", active: true }],
  },
  {
    id: "16", name: "Pablo Sketch", initials: "PS", instagram: "@pablo_sketch",
    style: "GEOMETRIC", budget: "$280–$400", daysAgo: "Hace 9d", messages: 9,
    status: "confirmado", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Brazo", source: "Instagram",
    history: [{ time: "Hace 9d", title: "Cita confirmada", desc: "Agendado para el 2 de mayo, 11:00.", active: true }],
  },
  {
    id: "17", name: "Pedro V.", initials: "PV", instagram: "@pedrov",
    style: "BLACKWORK", budget: "$400", daysAgo: "22 Abr", messages: 15,
    status: "realizado", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Espalda", source: "Referido",
    history: [{ time: "22 Abr", title: "Tatuaje realizado", desc: "Sesión completada. Cliente satisfecho.", active: true }],
  },
  {
    id: "18", name: "Lucía O.", initials: "LO", instagram: "@luci.o",
    style: "WATERCOLOR", budget: "$350", daysAgo: "21 Abr", messages: 11,
    status: "realizado", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Pierna", source: "Instagram",
    history: [{ time: "21 Abr", title: "Tatuaje realizado", desc: "Trabajo finalizado en una sesión.", active: true }],
  },
  {
    id: "19", name: "Diego Fuentes", initials: "DF", instagram: "@diego.f",
    style: "TRADITIONAL", budget: "$200–$300", daysAgo: "Hace 14d", messages: 3,
    status: "reactivar", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Brazo", source: "Instagram",
    notes: "No respondió al último mensaje. Candidato para campaña de reactivación.",
    history: [
      { time: "Hace 14d", title: "Sin respuesta", desc: "Último mensaje sin reply.", active: true },
      { time: "Hace 20d", title: "Consulta iniciada", desc: "Interés inicial confirmado." },
    ],
  },
  {
    id: "20", name: "Laura Peña", initials: "LP", instagram: "@laura.p",
    style: "BLACKWORK", budget: "$500–$700", daysAgo: "Hace 21d", messages: 2,
    status: "reactivar", artist: "Matías López", artistInitials: "ML",
    bodyZone: "Espalda", source: "Web",
    notes: "Interesada hace 3 semanas. Sin actividad desde el primer contacto.",
    history: [
      { time: "Hace 21d", title: "Lead frío", desc: "Sin actividad desde contacto inicial.", active: true },
    ],
  },
];

// ── Shared pieces ─────────────────────────────────────────────────────────────

function Initials({ text, size = "sm" }: { text: string; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-16 h-16 text-xl" : "w-8 h-8 text-[10px]";
  return (
    <div
      className={`${dim} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0`}
    >
      {text}
    </div>
  );
}

function StyleBadge({ label }: { label: string }) {
  return (
    <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-1 rounded font-mono tracking-wider">
      {label}
    </span>
  );
}

// ── Lead card ─────────────────────────────────────────────────────────────────

function LeadCard({ lead, onOpen }: { lead: Lead; onOpen: (l: Lead) => void }) {
  return (
    <div
      onClick={() => onOpen(lead)}
      className="bg-[#0D0010] p-4 rounded-lg border border-border hover:border-primary/60 transition-all cursor-pointer group shadow-card"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Initials text={lead.initials} />
          <span className="font-semibold text-foreground text-sm leading-tight">{lead.name}</span>
        </div>
        <MoreVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      <div className="flex items-center gap-1 text-primary text-xs mb-3">
        <span className="text-muted-foreground text-[11px]">@</span>
        {lead.instagram.replace("@", "")}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <StyleBadge label={lead.style} />
        {lead.budget && (
          <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-1 rounded font-mono">
            {lead.budget}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] text-muted-foreground border-t border-border/30 pt-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {lead.daysAgo}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" /> {lead.messages}
        </span>
      </div>
    </div>
  );
}

// ── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  leads,
  onOpen,
}: {
  col: (typeof COLUMNS)[number];
  leads: Lead[];
  onOpen: (l: Lead) => void;
}) {
  return (
    <div className="flex flex-col shrink-0 w-[300px] h-full">
      <div
        className="flex items-center justify-between mb-4 pt-2"
        style={{ borderTop: `4px solid ${col.color}` }}
      >
        <h3 className="font-mono text-[11px] tracking-widest text-muted-foreground flex items-center gap-2">
          {col.label}
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: col.badgeBg, color: col.color }}
          >
            {leads.length}
          </span>
        </h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onOpen={onOpen} />
        ))}
        {leads.length === 0 && (
          <div className="border border-dashed border-border/40 rounded-lg p-6 text-center text-muted-foreground text-xs">
            Sin leads en esta etapa
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lead detail modal ─────────────────────────────────────────────────────────

function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const statusCol = COLUMNS.find((c) => c.id === lead.status);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1A0025] border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal header */}
        <div className="p-6 border-b border-border flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <Initials text={lead.initials} size="lg" />
            <div>
              <h2 className="font-playfair text-2xl font-semibold text-foreground">
                {lead.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-mono tracking-wider border"
                  style={{
                    background: statusCol?.badgeBg,
                    color: statusCol?.color,
                    borderColor: `${statusCol?.color}33`,
                  }}
                >
                  ESTADO: {lead.status.toUpperCase()}
                </span>
                {lead.source && (
                  <span className="text-muted-foreground text-xs italic">
                    Lead captado vía {lead.source}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-8">
          {/* Left: contact + project + notes */}
          <div className="col-span-12 md:col-span-7 space-y-8">
            {/* Contact */}
            <div>
              <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4 border-b border-border pb-2">
                Datos de Contacto
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {lead.phone && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Teléfono</p>
                    <p className="text-foreground text-sm">{lead.phone}</p>
                  </div>
                )}
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Instagram</p>
                  <p className="text-primary text-sm">{lead.instagram}</p>
                </div>
                {lead.email && (
                  <div className="col-span-2">
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Email</p>
                    <p className="text-foreground text-sm">{lead.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project */}
            <div>
              <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4 border-b border-border pb-2">
                Detalles del Proyecto
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Estilo</p>
                  <p className="font-playfair text-lg font-semibold text-foreground">{lead.style}</p>
                </div>
                {lead.bodyZone && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Zona del cuerpo</p>
                    <p className="font-playfair text-lg font-semibold text-foreground">{lead.bodyZone}</p>
                  </div>
                )}
                {lead.budget && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Presupuesto estimado</p>
                    <p className="font-mono text-xl font-medium text-primary">{lead.budget}</p>
                  </div>
                )}
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Artista asignado</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[8px] font-bold text-primary">
                      {lead.artistInitials}
                    </div>
                    <p className="text-foreground text-sm">{lead.artist}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div>
                <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4 border-b border-border pb-2">
                  Notas Internas
                </h4>
                <div className="bg-[#0D0010] p-4 rounded-lg border border-border italic text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{lead.notes}&rdquo;
                </div>
              </div>
            )}
          </div>

          {/* Right: history + actions */}
          <div className="col-span-12 md:col-span-5 bg-[#0D0010]/60 rounded-xl border border-border p-6 flex flex-col">
            <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-6 flex items-center justify-between">
              Historial de Contacto
              <Clock className="w-4 h-4" />
            </h4>

            <div className="space-y-6 flex-1">
              {lead.history.map((ev, i) => (
                <div key={i} className="flex gap-4">
                  <div className="min-w-[44px] text-[10px] text-muted-foreground font-mono pt-1 shrink-0">
                    {ev.time}
                  </div>
                  <div
                    className="relative pl-4"
                    style={{ borderLeft: `1px solid ${ev.active ? "#8B00FF" : "#2D0050"}` }}
                  >
                    <div
                      className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
                      style={{ background: ev.active ? "#8B00FF" : "#2D0050" }}
                    />
                    <p className="text-sm font-bold text-foreground">{ev.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
              <button className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg transition-all">
                <Send className="w-4 h-4" />
                Enviar mensaje
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-secondary border border-border text-foreground py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:border-primary/50 transition-colors">
                  <MoveUp className="w-4 h-4" />
                  Mover estado
                </button>
                <button className="bg-secondary border border-border text-foreground py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:border-primary/50 transition-colors">
                  <CalendarPlus className="w-4 h-4" />
                  Agendar cita
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-10 pb-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {["Lead", "Instagram", "Estilo", "Presupuesto", "Estado", "Artista", "Contacto"].map(
              (h) => (
                <th
                  key={h}
                  className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase py-3 pr-4"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const col = COLUMNS.find((c) => c.id === lead.status);
            return (
              <tr
                key={lead.id}
                onClick={() => onOpen(lead)}
                className="border-b border-border/30 hover:bg-secondary/30 cursor-pointer transition-colors"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Initials text={lead.initials} />
                    <span className="font-semibold text-foreground">{lead.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-primary">{lead.instagram}</td>
                <td className="py-3 pr-4">
                  <StyleBadge label={lead.style} />
                </td>
                <td className="py-3 pr-4 font-mono text-muted-foreground">{lead.budget ?? "—"}</td>
                <td className="py-3 pr-4">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-mono tracking-wider"
                    style={{ background: col?.badgeBg, color: col?.color }}
                  >
                    {lead.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{lead.artist}</td>
                <td className="py-3 pr-4 text-muted-foreground text-xs">{lead.daysAgo}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CrmPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [filterStyle, setFilterStyle] = useState("todos");

  const openLead = useCallback((lead: Lead) => setSelectedLead(lead), []);
  const closeLead = useCallback(() => setSelectedLead(null), []);

  const filteredLeads = LEADS.filter((lead) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      lead.name.toLowerCase().includes(q) ||
      lead.instagram.toLowerCase().includes(q) ||
      lead.style.toLowerCase().includes(q);
    const matchStyle = filterStyle === "todos" || lead.style === filterStyle;
    return matchSearch && matchStyle;
  });

  const leadsForColumn = (status: LeadStatus) =>
    filteredLeads.filter((l) => l.status === status);

  const allStyles = Array.from(new Set(LEADS.map((l) => l.style))).sort();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 pt-8 px-10 pb-0">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-playfair text-4xl font-bold text-foreground">CRM de Leads</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredLeads.length} leads activos en tu pipeline
            </p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all">
            <Plus className="w-4 h-4" />+ Nuevo lead
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3 py-4 border-y border-border/30">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A0025] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="bg-[#1A0025] border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer">
                <option>Todos los artistas</option>
                <option>Matías López</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="bg-[#1A0025] border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="todos">Todos los estilos</option>
                {allStyles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select className="bg-[#1A0025] border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer">
                <option>Esta semana</option>
                <option>Este mes</option>
                <option>Todo el tiempo</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* View toggle */}
          <div className="ml-auto flex bg-[#1A0025] border border-border rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                view === "kanban"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Vista kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                view === "list"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              Vista lista
            </button>
          </div>
        </div>
      </header>

      {/* ── Kanban / List ── */}
      {view === "kanban" ? (
        <section className="flex-1 overflow-x-auto overflow-y-hidden px-10 pb-8 pt-6">
          <div className="flex gap-5 h-full" style={{ minWidth: "max-content" }}>
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                leads={leadsForColumn(col.id)}
                onOpen={openLead}
              />
            ))}
          </div>
        </section>
      ) : (
        <ListView leads={filteredLeads} onOpen={openLead} />
      )}

      {/* ── Modal ── */}
      {selectedLead && <LeadModal lead={selectedLead} onClose={closeLead} />}
    </div>
  );
}
