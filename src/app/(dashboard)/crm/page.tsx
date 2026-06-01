'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Plus, Search, LayoutGrid, List, MoreHorizontal,
  Clock, X, ChevronDown, UserRound, AlertCircle,
  MessageCircle, FileText, ArrowRight, Filter, SortAsc,
} from 'lucide-react'
import LeadSidePanel from '@/components/crm/LeadSidePanel'
import {
  COLUMNS, TAGS, PRIORITY_CONFIG, dbToUiLead,
  getInitials, contactColor,
  type Lead, type LeadStatus, type Artist, type DbLead,
} from '@/lib/crm'

// ── Constants ─────────────────────────────────────────────────────────────────

const STYLES = [
  'Blackwork', 'Realismo', 'Japonés', 'Neo-trad',
  'Minimalista', 'Acuarela', 'Old school', 'Lettering',
  'Geometric', 'Fine Line', 'Traditional', 'Watercolor',
]

// ── Shared UI primitives ──────────────────────────────────────────────────────

function Initials({ text, size = 'sm' }: { text: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-8 h-8 text-[10px]'
  return (
    <div
      className={`${dim} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0`}
    >
      {text}
    </div>
  )
}

function StyleBadge({ label }: { label: string }) {
  return (
    <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-1 rounded font-mono tracking-wider">
      {label}
    </span>
  )
}

function TagPill({ tagId }: { tagId: string }) {
  const def = TAGS.find(t => t.id === tagId)
  if (!def) return null
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: def.bg, color: def.color, border: `1px solid ${def.color}30` }}
    >
      {def.label}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#0D0010] p-4 rounded-lg border border-border animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-white/5" />
        <div className="h-3 w-28 rounded bg-white/5" />
      </div>
      <div className="h-2 w-20 rounded bg-white/5 mb-3" />
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 rounded bg-white/5" />
        <div className="h-5 w-20 rounded bg-white/5" />
      </div>
      <div className="border-t border-border/30 pt-3 flex justify-between">
        <div className="h-2 w-14 rounded bg-white/5" />
        <div className="h-2 w-8  rounded bg-white/5" />
      </div>
    </div>
  )
}

function KanbanSkeleton() {
  const counts = [2, 1, 2, 1, 1, 2, 1, 1]
  return (
    <div className="flex gap-5 h-full" style={{ minWidth: 'max-content' }}>
      {COLUMNS.map((col, ci) => (
        <div key={col.id} className="flex flex-col shrink-0 w-[300px]">
          <div className="mb-4 pt-2" style={{ borderTop: `4px solid ${col.color}` }}>
            <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: counts[ci] }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 pb-20">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(139,0,255,0.08)', border: '1px solid rgba(139,0,255,0.2)' }}
      >
        <UserRound className="w-9 h-9" style={{ color: '#8B00FF' }} />
      </div>
      <div className="text-center max-w-sm">
        <h3 className="font-playfair text-2xl font-bold text-foreground mb-3">
          Aún no tienes leads
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Agrega tu primer lead para empezar a gestionar tus clientes.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white transition-all"
        style={{
          background: 'linear-gradient(135deg, #8B00FF, #6A00C8)',
          boxShadow:  '0 0 24px rgba(139,0,255,0.35)',
        }}
      >
        <Plus className="w-4 h-4" /> Agregar primer lead
      </button>
    </div>
  )
}

// ── New lead modal ────────────────────────────────────────────────────────────

interface NewLeadForm {
  name: string; instagram: string; phone: string
  styleInterest: string; budgetMin: string; budgetMax: string; notes: string
}

const EMPTY_FORM: NewLeadForm = {
  name: '', instagram: '', phone: '',
  styleInterest: '', budgetMin: '', budgetMax: '', notes: '',
}

function NewLeadModal({
  onClose,
  onCreated,
}: {
  onClose:   () => void
  onCreated: (lead: Lead) => void
}) {
  const [form, setForm]         = useState<NewLeadForm>(EMPTY_FORM)
  const [isSubmitting, setSub]  = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const patch = (p: Partial<NewLeadForm>) => setForm(prev => ({ ...prev, ...p }))

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSub(true); setError(null)
    try {
      const res  = await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:          form.name.trim(),
          instagram:     form.instagram.trim() || null,
          phone:         form.phone.trim()     || null,
          styleInterest: form.styleInterest    || null,
          budgetMin:     form.budgetMin        || null,
          budgetMax:     form.budgetMax        || null,
          notes:         form.notes.trim()     || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      onCreated(dbToUiLead(json.lead as DbLead))
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el lead')
      setSub(false)
    }
  }

  const inputCls =
    'w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none transition-colors bg-[#0D0010] border border-border focus:border-primary'

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1A0025] border border-border rounded-xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="font-playfair text-xl font-semibold text-foreground">Nuevo Lead</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text" required autoFocus
              value={form.name}
              onChange={e => patch({ name: e.target.value })}
              placeholder="Nombre del cliente"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Instagram</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input type="text" value={form.instagram} onChange={e => patch({ instagram: e.target.value })} placeholder="handle" className={`${inputCls} pl-7`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Teléfono</label>
              <input type="tel" value={form.phone} onChange={e => patch({ phone: e.target.value })} placeholder="+1 234 567 890" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Estilo de interés</label>
            <div className="relative">
              <select value={form.styleInterest} onChange={e => patch({ styleInterest: e.target.value })} className={`${inputCls} appearance-none pr-8 cursor-pointer`}>
                <option value="">Selecciona un estilo</option>
                {STYLES.map(s => <option key={s} value={s} style={{ background: '#0D0010' }}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Presupuesto mín.</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                <input type="number" min="0" value={form.budgetMin} onChange={e => patch({ budgetMin: e.target.value })} placeholder="100" className={`${inputCls} pl-7`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Presupuesto máx.</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                <input type="number" min="0" value={form.budgetMax} onChange={e => patch({ budgetMax: e.target.value })} placeholder="500" className={`${inputCls} pl-7`} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Notas</label>
            <textarea value={form.notes} onChange={e => patch({ notes: e.target.value })} placeholder="Detalles del proyecto…" rows={3} className={`${inputCls} resize-none`} />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,80,80,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-muted-foreground border border-border hover:border-primary/50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #8B00FF, #6A00C8)', boxShadow: '0 0 20px rgba(139,0,255,0.3)' }}
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {isSubmitting ? 'Guardando…' : 'Crear lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Enhanced lead card ────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onOpen,
  onDragStart,
  onMoveStage,
  onAddNote,
}: {
  lead:        Lead
  onOpen:      (l: Lead) => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onMoveStage: (id: string, status: LeadStatus) => Promise<void>
  onAddNote:   (l: Lead) => void
}) {
  const [stageOpen, setStageOpen] = useState(false)
  const stageRef                  = useRef<HTMLDivElement>(null)
  const days                      = lead.daysSinceContact
  const contactClr                = contactColor(days)
  const isCritical                = days !== null && days > 5
  const isWarning                 = days !== null && days > 2

  // Close stage picker when clicking outside
  useEffect(() => {
    if (!stageOpen) return
    const handler = (e: MouseEvent) => {
      if (stageRef.current && !stageRef.current.contains(e.target as Node)) {
        setStageOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [stageOpen])

  const visibleTags = lead.tags.slice(0, 2)
  const extraTags   = lead.tags.length - 2

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      onClick={() => onOpen(lead)}
      className="relative bg-[#0D0010] p-4 rounded-lg border border-border hover:border-primary/60 transition-all cursor-pointer group shadow-card select-none overflow-hidden"
    >
      {/* Priority dot — top right */}
      <div
        className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
        style={{ background: PRIORITY_CONFIG[lead.priority].color }}
        title={`Prioridad ${PRIORITY_CONFIG[lead.priority].label}`}
      />

      {/* Name + avatar */}
      <div className="flex items-center gap-2 mb-2 pr-5">
        <Initials text={lead.initials} />
        <span className="font-semibold text-foreground text-sm leading-tight truncate">{lead.name}</span>
      </div>

      {/* Instagram */}
      <div className="flex items-center gap-1 text-primary text-xs mb-2">
        <span className="text-muted-foreground text-[11px]">@</span>
        {lead.instagram.replace('@', '')}
      </div>

      {/* Style + body zone badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <StyleBadge label={lead.style} />
        {lead.bodyZone && (
          <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-1 rounded font-mono">
            {lead.bodyZone}
          </span>
        )}
      </div>

      {/* Budget */}
      {lead.budget !== '—' && (
        <div className="text-[11px] font-mono text-muted-foreground mb-2">
          {lead.budget}
        </div>
      )}

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {visibleTags.map(tagId => <TagPill key={tagId} tagId={tagId} />)}
          {extraTags > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              +{extraTags}
            </span>
          )}
        </div>
      )}

      {/* Footer: artist + contact time + stale badge */}
      <div className="flex items-center justify-between text-[11px] border-t border-border/30 pt-2.5 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
            {getInitials(lead.artistName)}
          </div>
          <span className="text-muted-foreground truncate max-w-[80px]">{lead.artistName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCritical && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: '#ef44441a', color: '#ef4444' }}
            >
              Sin contacto
            </span>
          )}
          <span className="flex items-center gap-1 font-mono" style={{ color: contactClr }}>
            <Clock className="w-3 h-3" style={{ color: isWarning ? contactClr : undefined }} />
            {lead.lastContactDisplay}
          </span>
        </div>
      </div>

      {/* Hover quick actions overlay */}
      <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
        <div
          className="flex items-center justify-end gap-1 px-3 py-2"
          style={{ background: 'linear-gradient(to top, #0D0010 60%, transparent)' }}
        >
          {/* WhatsApp */}
          {lead.phone ? (
            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hola ${encodeURIComponent(lead.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-[#22c55e20] transition-colors text-muted-foreground hover:text-[#22c55e]"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          ) : (
            <button
              disabled
              className="p-1.5 rounded-lg text-muted-foreground/30 cursor-not-allowed"
              title="Sin teléfono"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}

          {/* Add note */}
          <button
            onClick={e => { e.stopPropagation(); onAddNote(lead) }}
            className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors text-muted-foreground hover:text-primary"
            title="Agregar nota"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Move stage */}
          <div ref={stageRef} className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setStageOpen(v => !v)}
              className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors text-muted-foreground hover:text-primary"
              title="Mover etapa"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            {stageOpen && (
              <div className="absolute bottom-8 right-0 bg-[#1A0025] border border-border rounded-xl shadow-2xl z-20 py-2 w-44">
                {COLUMNS.map(col => (
                  <button
                    key={col.id}
                    onClick={async () => {
                      setStageOpen(false)
                      await onMoveStage(lead.id, col.id)
                    }}
                    disabled={col.id === lead.status}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-[11px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
                    <span style={{ color: col.id === lead.status ? col.color : undefined }}>
                      {col.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  col, leads, onOpen, onDragStart, onDrop, onMoveStage, onAddNote,
}: {
  col:         (typeof COLUMNS)[number]
  leads:       Lead[]
  onOpen:      (l: Lead) => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDrop:      (e: React.DragEvent, status: LeadStatus) => void
  onMoveStage: (id: string, status: LeadStatus) => Promise<void>
  onAddNote:   (l: Lead) => void
}) {
  const [isDragOver, setOver] = useState(false)

  return (
    <div
      className="flex flex-col shrink-0 w-[300px] h-full"
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { setOver(false); onDrop(e, col.id) }}
    >
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

      <div
        className={`flex-1 space-y-4 overflow-y-auto pr-1 rounded-lg p-1 transition-colors ${
          isDragOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''
        }`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onOpen={onOpen}
            onDragStart={onDragStart}
            onMoveStage={onMoveStage}
            onAddNote={onAddNote}
          />
        ))}
        {leads.length === 0 && (
          <div
            className={`border border-dashed rounded-lg p-6 text-center text-xs transition-colors ${
              isDragOver
                ? 'border-primary/50 text-primary/70'
                : 'border-border/40 text-muted-foreground'
            }`}
          >
            {isDragOver ? 'Soltar aquí' : 'Sin leads en esta etapa'}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Filters bar ───────────────────────────────────────────────────────────────

type SortKey = 'date' | 'last_contact' | 'budget'

interface FiltersState {
  search:         string
  filterArtist:   string
  filterTags:     string[]
  filterPriority: string
  sortBy:         SortKey
}

function FiltersBar({
  filters,
  artists,
  onChange,
  onClear,
  view,
  onViewChange,
  onAdd,
}: {
  filters:      FiltersState
  artists:      Artist[]
  onChange:     (p: Partial<FiltersState>) => void
  onClear:      () => void
  view:         'kanban' | 'list'
  onViewChange: (v: 'kanban' | 'list') => void
  onAdd:        () => void
}) {
  const [tagMenuOpen, setTagMenuOpen] = useState(false)
  const tagRef                        = useRef<HTMLDivElement>(null)

  const hasActive =
    !!filters.search ||
    filters.filterArtist !== 'all' ||
    filters.filterTags.length > 0 ||
    filters.filterPriority !== 'all'

  // Close tag menu on outside click
  useEffect(() => {
    if (!tagMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setTagMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tagMenuOpen])

  const toggleTag = (id: string) => {
    const next = filters.filterTags.includes(id)
      ? filters.filterTags.filter(t => t !== id)
      : [...filters.filterTags, id]
    onChange({ filterTags: next })
  }

  const selectCls =
    'bg-[#1A0025] border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none appearance-none pr-8 cursor-pointer'

  return (
    <div className="shrink-0 px-10 py-3 border-b border-border/30 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre o @instagram…"
          value={filters.search}
          onChange={e => onChange({ search: e.target.value })}
          className="w-full bg-[#1A0025] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
        />
      </div>

      {/* Artist filter */}
      <div className="relative">
        <select
          value={filters.filterArtist}
          onChange={e => onChange({ filterArtist: e.target.value })}
          className={selectCls}
        >
          <option value="all">Todos los artistas</option>
          {artists.map(a => (
            <option key={a.id} value={a.id} style={{ background: '#1A0025' }}>{a.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Tags multi-select */}
      <div ref={tagRef} className="relative">
        <button
          onClick={() => setTagMenuOpen(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
            filters.filterTags.length > 0
              ? 'border-primary/60 text-primary bg-primary/10'
              : 'border-border text-foreground bg-[#1A0025] hover:border-primary/40'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          {filters.filterTags.length > 0
            ? `${filters.filterTags.length} etiqueta${filters.filterTags.length > 1 ? 's' : ''}`
            : 'Etiquetas'}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {tagMenuOpen && (
          <div className="absolute top-full left-0 mt-1 bg-[#1A0025] border border-border rounded-xl shadow-2xl z-30 py-2 min-w-[200px]">
            {TAGS.map(tag => {
              const active = filters.filterTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-xs"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tag.color }} />
                  <span className="flex-1 text-left" style={{ color: active ? tag.color : undefined }}>
                    {tag.label}
                  </span>
                  {active && (
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                      style={{ background: `${tag.color}30` }}
                    >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 12 12" style={{ color: tag.color }}>
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Priority filter */}
      <div className="relative">
        <select
          value={filters.filterPriority}
          onChange={e => onChange({ filterPriority: e.target.value })}
          className={selectCls}
        >
          <option value="all">Todas las prioridades</option>
          <option value="high"   style={{ background: '#1A0025' }}>🔴 Alta</option>
          <option value="medium" style={{ background: '#1A0025' }}>🟡 Media</option>
          <option value="low"    style={{ background: '#1A0025' }}>🟢 Baja</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Sort */}
      <div className="relative">
        <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <select
          value={filters.sortBy}
          onChange={e => onChange({ sortBy: e.target.value as SortKey })}
          className={`${selectCls} pl-8`}
        >
          <option value="date"         style={{ background: '#1A0025' }}>Fecha de creación</option>
          <option value="last_contact" style={{ background: '#1A0025' }}>Último contacto</option>
          <option value="budget"       style={{ background: '#1A0025' }}>Presupuesto</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Clear filters */}
      {hasActive && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}

      {/* Spacer + view toggle + add button */}
      <div className="ml-auto flex items-center gap-3">
        <div className="flex bg-[#1A0025] border border-border rounded-lg p-1 gap-0.5">
          <button
            onClick={() => onViewChange('kanban')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              view === 'kanban' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kanban
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              view === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Lista
          </button>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo lead
        </button>
      </div>
    </div>
  )
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-10 pb-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {['Lead', 'Instagram', 'Estilo', 'Presupuesto', 'Estado', 'Prioridad', 'Artista', 'Contacto'].map(h => (
              <th key={h} className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase py-3 pr-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => {
            const col   = COLUMNS.find(c => c.id === lead.status)
            const days  = lead.daysSinceContact
            const clr   = contactColor(days)
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
                <td className="py-3 pr-4"><StyleBadge label={lead.style} /></td>
                <td className="py-3 pr-4 font-mono text-muted-foreground">{lead.budget}</td>
                <td className="py-3 pr-4">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-mono tracking-wider"
                    style={{ background: col?.badgeBg, color: col?.color }}
                  >
                    {lead.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: PRIORITY_CONFIG[lead.priority].color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {PRIORITY_CONFIG[lead.priority].label}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground text-xs">{lead.artistName}</td>
                <td className="py-3 pr-4">
                  <span className="text-xs font-mono flex items-center gap-1" style={{ color: clr }}>
                    <Clock className="w-3 h-3" />
                    {lead.lastContactDisplay}
                    {days !== null && days > 5 && (
                      <AlertCircle className="w-3 h-3 ml-1" />
                    )}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FiltersState = {
  search:         '',
  filterArtist:   'all',
  filterTags:     [],
  filterPriority: 'all',
  sortBy:         'date',
}

export default function CrmPage() {
  const [leads, setLeads]           = useState<Lead[]>([])
  const [artists, setArtists]       = useState<Artist[]>([])
  const [isLoading, setLoading]     = useState(true)
  const [selectedLead, setSelected] = useState<Lead | null>(null)
  const [focusNote, setFocusNote]   = useState(false)
  const [showNewModal, setNewModal] = useState(false)
  const [view, setView]             = useState<'kanban' | 'list'>('kanban')
  const [filters, setFilters]       = useState<FiltersState>(DEFAULT_FILTERS)

  const draggingId = useRef<string | null>(null)

  // ── Data fetching ──
  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()),
      fetch('/api/artists').then(r => r.json()),
    ]).then(([leadsJson, artistsJson]) => {
      if (leadsJson.leads)   setLeads((leadsJson.leads as DbLead[]).map(dbToUiLead))
      if (artistsJson.artists) setArtists(artistsJson.artists as Artist[])
    }).catch(err => {
      console.error('[CRM] load error:', err)
    }).finally(() => setLoading(false))
  }, [])

  // ── Callbacks ──
  const openLead = useCallback((lead: Lead, focusNoteInput = false) => {
    setSelected(lead)
    setFocusNote(focusNoteInput)
  }, [])

  const closeLead = useCallback(() => {
    setSelected(null)
    setFocusNote(false)
  }, [])

  const handleLeadUpdated = useCallback((updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    setSelected(prev => prev?.id === updated.id ? updated : prev)
  }, [])

  const handleLeadCreated = useCallback((lead: Lead) => {
    setLeads(prev => [lead, ...prev])
  }, [])

  // ── Status change (drag + card quick-action) ──
  const updateLeadStatus = useCallback(async (leadId: string, targetStatus: LeadStatus) => {
    setLeads(prev => {
      const lead = prev.find(l => l.id === leadId)
      if (!lead || lead.status === targetStatus) return prev
      return prev.map(l => l.id === leadId ? { ...l, status: targetStatus } : l)
    })

    try {
      const res  = await fetch('/api/leads', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: leadId, status: targetStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const json = await res.json()
      const updated = dbToUiLead(json.lead as DbLead)
      setLeads(prev => prev.map(l => l.id === leadId ? updated : l))
    } catch (err) {
      console.error('[CRM] status update error:', err)
      const res  = await fetch('/api/leads')
      const json = await res.json()
      if (res.ok) setLeads((json.leads as DbLead[]).map(dbToUiLead))
    }
  }, [])

  // ── Drag-and-drop ──
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    draggingId.current           = id
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault()
    const id = draggingId.current ?? e.dataTransfer.getData('text/plain')
    draggingId.current = null
    if (id) updateLeadStatus(id, targetStatus)
  }, [updateLeadStatus])

  // ── Filters ──
  const patchFilters = useCallback((partial: Partial<FiltersState>) => {
    setFilters(prev => ({ ...prev, ...partial }))
  }, [])

  const filteredLeads = leads
    .filter(lead => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!lead.name.toLowerCase().includes(q) && !lead.instagram.toLowerCase().includes(q)) return false
      }
      if (filters.filterArtist !== 'all' && lead.artistId !== filters.filterArtist) return false
      if (filters.filterPriority !== 'all' && lead.priority !== filters.filterPriority) return false
      if (filters.filterTags.length > 0) {
        const hasAny = filters.filterTags.some(t => lead.tags.includes(t))
        if (!hasAny) return false
      }
      return true
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'last_contact': {
          const aRef = a.lastContactedAt ?? a.createdAt
          const bRef = b.lastContactedAt ?? b.createdAt
          return new Date(bRef).getTime() - new Date(aRef).getTime()
        }
        case 'budget': {
          const aBudget = a.budgetMin ?? 0
          const bBudget = b.budgetMin ?? 0
          return bBudget - aBudget
        }
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const leadsForColumn = (status: LeadStatus) =>
    filteredLeads.filter(l => l.status === status)

  const showEmpty = !isLoading && leads.length === 0

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Page header ── */}
      <header className="shrink-0 pt-8 px-10 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-playfair text-4xl font-bold text-foreground">CRM de Leads</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isLoading
                ? 'Cargando leads…'
                : `${filteredLeads.length} de ${leads.length} leads en pipeline`}
            </p>
          </div>
        </div>
      </header>

      {/* ── Filters bar ── */}
      <FiltersBar
        filters={filters}
        artists={artists}
        onChange={patchFilters}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        view={view}
        onViewChange={setView}
        onAdd={() => setNewModal(true)}
      />

      {/* ── Main content ── */}
      {isLoading ? (
        <section className="flex-1 overflow-x-auto overflow-y-hidden px-10 pb-8 pt-6">
          <KanbanSkeleton />
        </section>
      ) : showEmpty ? (
        <EmptyState onAdd={() => setNewModal(true)} />
      ) : view === 'kanban' ? (
        <section className="flex-1 overflow-x-auto overflow-y-hidden px-10 pb-8 pt-6">
          <div className="flex gap-5 h-full" style={{ minWidth: 'max-content' }}>
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                col={col}
                leads={leadsForColumn(col.id)}
                onOpen={lead => openLead(lead)}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onMoveStage={updateLeadStatus}
                onAddNote={lead => openLead(lead, true)}
              />
            ))}
          </div>
        </section>
      ) : (
        <ListView leads={filteredLeads} onOpen={lead => openLead(lead)} />
      )}

      {/* ── Modals / panels ── */}
      {showNewModal && (
        <NewLeadModal
          onClose={() => setNewModal(false)}
          onCreated={handleLeadCreated}
        />
      )}

      {selectedLead && (
        <LeadSidePanel
          lead={selectedLead}
          artists={artists}
          onClose={closeLead}
          onLeadUpdated={handleLeadUpdated}
          autoFocusNote={focusNote}
        />
      )}
    </div>
  )
}
