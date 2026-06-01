'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X, Clock, FileText, ArrowLeftRight, Phone, ChevronDown,
  Plus, Check, Send, Calendar, MessageCircle,
  Link2, Mail,
} from 'lucide-react'
import {
  TAGS, COLUMNS, PRIORITY_CONFIG, dbToUiLead,
  relativeTime, getInitials,
  type Lead, type Artist, type ActivityRecord, type Priority, type LeadStatus,
} from '@/lib/crm'

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  lead:           Lead
  artists:        Artist[]
  onClose:        () => void
  onLeadUpdated:  (lead: Lead) => void
  autoFocusNote?: boolean
}

// ── Activity timeline ─────────────────────────────────────────────────────────

function activityIcon(type: string) {
  switch (type) {
    case 'note':           return <FileText className="w-3.5 h-3.5" />
    case 'whatsapp':       return <MessageCircle className="w-3.5 h-3.5" />
    case 'call':           return <Phone className="w-3.5 h-3.5" />
    case 'email':          return <Mail className="w-3.5 h-3.5" />
    case 'instagram_dm':   return <Link2 className="w-3.5 h-3.5" />
    case 'status_change':  return <ArrowLeftRight className="w-3.5 h-3.5" />
    case 'booking_created':return <Calendar className="w-3.5 h-3.5" />
    default:               return <Clock className="w-3.5 h-3.5" />
  }
}

function activityColor(type: string): string {
  switch (type) {
    case 'note':           return '#8B00FF'
    case 'whatsapp':       return '#22c55e'
    case 'call':           return '#3b82f6'
    case 'email':          return '#f59e0b'
    case 'instagram_dm':   return '#ec4899'
    case 'status_change':  return '#6b7280'
    case 'booking_created':return '#52C97A'
    default:               return '#6b7280'
  }
}

function stageLabel(status: string | null): string {
  if (!status) return '—'
  return COLUMNS.find(c => c.id === status)?.label ?? status.toUpperCase()
}

function ActivityItem({ activity }: { activity: ActivityRecord }) {
  const color = activityColor(activity.type)

  return (
    <div className="flex gap-3">
      {/* Icon bubble */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${color}1a`, color }}
      >
        {activityIcon(activity.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {activity.type === 'status_change' ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Movido de{' '}
            <span className="font-bold text-foreground">{stageLabel(activity.old_status)}</span>
            {' → '}
            <span className="font-bold" style={{ color }}>
              {stageLabel(activity.new_status)}
            </span>
          </p>
        ) : (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {activity.content}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
          {relativeTime(activity.created_at)}
        </p>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-b border-border/40">
      <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-3">
        {title}
      </h4>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LeadSidePanel({
  lead,
  artists,
  onClose,
  onLeadUpdated,
  autoFocusNote = false,
}: Props) {
  const [visible, setVisible]             = useState(false)
  const [current, setCurrent]             = useState<Lead>(lead)
  const [activities, setActivities]       = useState<ActivityRecord[]>([])
  const [loadingActs, setLoadingActs]     = useState(true)
  const [noteText, setNoteText]           = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [stageOpen, setStageOpen]         = useState(false)
  const [artistOpen, setArtistOpen]       = useState(false)
  const [tagOpen, setTagOpen]             = useState(false)
  const [updatingField, setUpdatingField] = useState<string | null>(null)
  const noteRef  = useRef<HTMLTextAreaElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-focus note textarea
  useEffect(() => {
    if (autoFocusNote && noteRef.current) {
      const t = setTimeout(() => {
        noteRef.current?.focus()
        noteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
      return () => clearTimeout(t)
    }
  }, [autoFocusNote])

  // Load activities
  useEffect(() => {
    ;(async () => {
      setLoadingActs(true)
      try {
        const res  = await fetch(`/api/leads/${lead.id}/activities`)
        const json = await res.json()
        if (res.ok) setActivities(json.activities ?? [])
      } finally {
        setLoadingActs(false)
      }
    })()
  }, [lead.id])

  // Close outside click for stage dropdown
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

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  const patchLead = useCallback(async (
    payload: Record<string, unknown>,
    field: string
  ) => {
    setUpdatingField(field)
    try {
      const res  = await fetch('/api/leads', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: current.id, ...payload }),
      })
      if (res.ok) {
        const json    = await res.json()
        const updated = dbToUiLead(json.lead)
        setCurrent(updated)
        onLeadUpdated(updated)
      }
    } finally {
      setUpdatingField(null)
    }
  }, [current.id, onLeadUpdated])

  async function handleAddNote() {
    const text = noteText.trim()
    if (!text) return
    setSubmitting(true)
    try {
      const res  = await fetch(`/api/leads/${current.id}/activities`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type: 'note', content: text }),
      })
      if (res.ok) {
        const json = await res.json()
        setActivities(prev => [...prev, json.activity])
        setNoteText('')
        // Optimistically reflect last_contacted_at update
        const now     = new Date().toISOString()
        const updated = { ...current, lastContactedAt: now, daysSinceContact: 0, lastContactDisplay: 'Ahora' }
        setCurrent(updated)
        onLeadUpdated(updated)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMoveStage(status: LeadStatus) {
    setStageOpen(false)
    await patchLead({ status }, 'status')
    // Reload activities to show the new status_change event
    const res  = await fetch(`/api/leads/${current.id}/activities`)
    const json = await res.json()
    if (res.ok) setActivities(json.activities ?? [])
  }

  function handleToggleTag(tagId: string) {
    const newTags = current.tags.includes(tagId)
      ? current.tags.filter(t => t !== tagId)
      : [...current.tags, tagId]
    patchLead({ tags: newTags }, 'tags')
  }

  const statusCol      = COLUMNS.find(c => c.id === current.status)
  const artistInitials = getInitials(current.artistName)

  const whatsappHref = current.phone
    ? `https://wa.me/${current.phone.replace(/\D/g, '')}?text=Hola ${encodeURIComponent(current.name)}`
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity duration-250"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-screen w-full max-w-[520px] bg-[#0D0010] border-l border-border z-50 flex flex-col shadow-2xl"
        style={{
          transform:  visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 flex items-start gap-4 px-6 py-5 border-b border-border bg-[#1A0025]">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0 text-sm">
            {current.initials}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-playfair text-xl font-semibold text-foreground leading-tight truncate">
              {current.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="text-[10px] px-2 py-0.5 rounded font-mono tracking-wider border"
                style={{
                  background:  statusCol?.badgeBg,
                  color:       statusCol?.color,
                  borderColor: `${statusCol?.color}40`,
                }}
              >
                {statusCol?.label ?? current.status.toUpperCase()}
              </span>
              {current.source && (
                <span className="text-muted-foreground text-[10px]">
                  vía {current.source}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>

          {/* Contact info */}
          <Section title="Contacto">
            <div className="grid grid-cols-2 gap-3">
              {current.phone && (
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Teléfono</p>
                  <p className="text-sm text-foreground">{current.phone}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Instagram</p>
                <p className="text-sm text-primary">{current.instagram}</p>
              </div>
              {current.email && (
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Email</p>
                  <p className="text-sm text-foreground">{current.email}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Presupuesto</p>
                <p className="text-sm font-mono text-primary">{current.budget}</p>
              </div>
              {current.bodyZone && (
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Zona</p>
                  <p className="text-sm text-foreground">{current.bodyZone}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Priority + Artist */}
          <Section title="Configuración">
            <div className="space-y-4">
              {/* Priority */}
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase mb-2">Prioridad</p>
                <div className="flex gap-2">
                  {(Object.entries(PRIORITY_CONFIG) as [Priority, { color: string; label: string }][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => patchLead({ priority: key }, 'priority')}
                      disabled={updatingField === 'priority'}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all"
                      style={
                        current.priority === key
                          ? { background: `${cfg.color}22`, color: cfg.color, borderColor: `${cfg.color}60` }
                          : { background: 'transparent', color: '#6b7280', borderColor: '#2D0050' }
                      }
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Artist */}
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase mb-2">Artista asignado</p>
                <div className="relative">
                  <button
                    onClick={() => setArtistOpen(v => !v)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A0025] border border-border hover:border-primary/40 transition-colors text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                      {artistInitials}
                    </div>
                    <span className="flex-1 text-left text-foreground">{current.artistName}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>

                  {artistOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A0025] border border-border rounded-xl shadow-2xl z-10 overflow-hidden">
                      <button
                        onClick={() => { patchLead({ artist_id: null }, 'artist'); setArtistOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary transition-colors text-sm text-muted-foreground"
                      >
                        Sin asignar
                      </button>
                      {artists.map(a => (
                        <button
                          key={a.id}
                          onClick={() => { patchLead({ artist_id: a.id }, 'artist'); setArtistOpen(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary transition-colors text-sm"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                            {getInitials(a.name)}
                          </div>
                          <span className="text-foreground">{a.name}</span>
                          {current.artistId === a.id && (
                            <Check className="w-3.5 h-3.5 text-primary ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Tags */}
          <Section title="Etiquetas">
            <div className="flex flex-wrap gap-2">
              {current.tags.map(tagId => {
                const def = TAGS.find(t => t.id === tagId)
                if (!def) return null
                return (
                  <span
                    key={tagId}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium cursor-pointer transition-opacity hover:opacity-70"
                    style={{ background: def.bg, color: def.color, border: `1px solid ${def.color}40` }}
                    onClick={() => handleToggleTag(tagId)}
                  >
                    {def.label}
                    <X className="w-2.5 h-2.5" />
                  </span>
                )
              })}

              {/* Add tag dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTagOpen(v => !v)}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Añadir
                </button>

                {tagOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-[#1A0025] border border-border rounded-xl shadow-2xl z-10 py-2 min-w-[180px]">
                    {TAGS.map(tag => {
                      const active = current.tags.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          onClick={() => { handleToggleTag(tag.id); setTagOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-xs"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: tag.color }}
                          />
                          <span className="flex-1 text-left" style={{ color: active ? tag.color : undefined }}>
                            {tag.label}
                          </span>
                          {active && <Check className="w-3 h-3 shrink-0" style={{ color: tag.color }} />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Activity timeline */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4 flex items-center gap-2">
              Actividad
              <Clock className="w-3.5 h-3.5" />
            </h4>

            {loadingActs ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-white/5 shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                      <div className="h-2 bg-white/5 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-xs">Sin actividad registrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map(act => (
                  <ActivityItem key={act.id} activity={act} />
                ))}
              </div>
            )}
          </div>

          {/* Note form */}
          <div className="px-6 pt-4 pb-6">
            <div
              className="rounded-xl border transition-colors"
              style={{ borderColor: noteText ? '#8B00FF60' : undefined }}
            >
              <textarea
                ref={noteRef}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote()
                }}
                placeholder="Agregar nota... (Ctrl+Enter para guardar)"
                rows={3}
                className="w-full bg-[#1A0025] rounded-t-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
              />
              <div className="flex justify-end px-3 pb-3 bg-[#1A0025] rounded-b-xl border-t border-border/40">
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || submitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #8B00FF, #6A00C8)',
                    boxShadow:  noteText.trim() ? '0 0 14px rgba(139,0,255,0.35)' : 'none',
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Guardando…' : 'Guardar nota'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky footer actions ── */}
        <div className="shrink-0 px-6 py-4 border-t border-border bg-[#0D0010] flex gap-3">
          {/* Mover etapa */}
          <div ref={stageRef} className="relative flex-1">
            <button
              onClick={() => setStageOpen(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-border bg-[#1A0025] text-foreground hover:border-primary/50 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Mover etapa
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {stageOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A0025] border border-border rounded-xl shadow-2xl z-10 py-2 overflow-hidden">
                {COLUMNS.map(col => (
                  <button
                    key={col.id}
                    onClick={() => handleMoveStage(col.id)}
                    disabled={col.id === current.status}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: col.color }}
                    />
                    <span style={{ color: col.id === current.status ? col.color : undefined }}>
                      {col.label}
                    </span>
                    {col.id === current.status && (
                      <Check className="w-3 h-3 ml-auto" style={{ color: col.color }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agendar cita */}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border border-border bg-[#1A0025] text-foreground hover:border-primary/50 transition-colors">
            <Calendar className="w-4 h-4" />
            Agendar
          </button>

          {/* WhatsApp */}
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                boxShadow: '0 0 14px rgba(34,197,94,0.3)',
              }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border border-border text-muted-foreground opacity-40 cursor-not-allowed"
              title="Sin número de teléfono"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </>
  )
}
