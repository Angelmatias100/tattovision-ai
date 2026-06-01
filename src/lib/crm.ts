// Shared CRM types, constants, and pure helpers.
// Imported by both the CRM page and the LeadSidePanel component.

// ── Stage pipeline ────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'nuevo' | 'respondido' | 'consulta' | 'presupuesto'
  | 'deposito' | 'confirmado' | 'realizado' | 'reactivar'

export const COLUMNS: {
  id: LeadStatus
  label: string
  color: string
  badgeBg: string
}[] = [
  { id: 'nuevo',       label: 'NUEVO',       color: '#5B8EF0', badgeBg: '#5B8EF01A' },
  { id: 'respondido',  label: 'RESPONDIDO',  color: '#8B00FF', badgeBg: '#8B00FF1A' },
  { id: 'consulta',    label: 'CONSULTA',    color: '#6A00C8', badgeBg: '#6A00C81A' },
  { id: 'presupuesto', label: 'PRESUPUESTO', color: '#FFB547', badgeBg: '#FFB5471A' },
  { id: 'deposito',    label: 'DEPÓSITO',    color: '#FF8C00', badgeBg: '#FF8C001A' },
  { id: 'confirmado',  label: 'CONFIRMADO',  color: '#52C97A', badgeBg: '#52C97A1A' },
  { id: 'realizado',   label: 'REALIZADO',   color: '#988ca2', badgeBg: '#988ca21A' },
  { id: 'reactivar',   label: 'REACTIVAR',   color: '#FF3B3B', badgeBg: '#FF3B3B1A' },
]

// ── Tags ──────────────────────────────────────────────────────────────────────

export interface TagDef {
  id: string
  label: string
  color: string
  bg: string
}

export const TAGS: TagDef[] = [
  { id: 'interesado',        label: 'Interesado',        color: '#22c55e', bg: '#22c55e1a' },
  { id: 'presupuesto_alto',  label: 'Presupuesto alto',  color: '#a855f7', bg: '#a855f71a' },
  { id: 'sin_respuesta',     label: 'Sin respuesta',     color: '#ef4444', bg: '#ef44441a' },
  { id: 'cliente_frecuente', label: 'Cliente frecuente', color: '#3b82f6', bg: '#3b82f61a' },
  { id: 'referido',          label: 'Referido',          color: '#eab308', bg: '#eab3081a' },
  { id: 'flash_tattoo',      label: 'Flash tattoo',      color: '#f97316', bg: '#f973161a' },
  { id: 'proyecto_grande',   label: 'Proyecto grande',   color: '#ec4899', bg: '#ec48991a' },
]

// ── Priority ──────────────────────────────────────────────────────────────────

export type Priority = 'high' | 'medium' | 'low'

export const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
  high:   { color: '#ef4444', label: 'Alta' },
  medium: { color: '#f59e0b', label: 'Media' },
  low:    { color: '#22c55e', label: 'Baja' },
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DbLead {
  id:                string
  business_id:       string
  artist_id:         string | null
  name:              string
  instagram:         string | null
  phone:             string | null
  email:             string | null
  source:            string | null
  status:            string
  style_interest:    string[]
  body_part:         string | null
  budget_min:        number | null
  budget_max:        number | null
  notes:             string | null
  tags:              string[]
  priority:          Priority
  last_contacted_at: string | null
  created_at:        string
  updated_at:        string
  artist?:           { id: string; name: string } | null
}

export interface Lead {
  id:                 string
  name:               string
  initials:           string
  instagram:          string
  style:              string
  bodyZone?:          string
  budget:             string
  budgetMin?:         number
  budgetMax?:         number
  status:             LeadStatus
  artistId?:          string
  artistName:         string
  phone?:             string
  email?:             string
  notes?:             string
  source?:            string
  tags:               string[]
  priority:           Priority
  lastContactedAt:    string | null
  createdAt:          string
  daysSinceContact:   number | null
  lastContactDisplay: string
}

export interface Artist {
  id:        string
  name:      string
  styles:    string[]
  is_active: boolean
}

export interface ActivityRecord {
  id:            string
  lead_id:       string
  type:          string
  content:       string | null
  old_status:    string | null
  new_status:    string | null
  clerk_user_id: string | null
  created_at:    string
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

export function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins   = Math.floor(diffMs / 60_000)
  const hours  = Math.floor(mins  / 60)
  const days   = Math.floor(hours / 24)
  if (mins  <  1) return 'Ahora'
  if (mins  < 60) return `Hace ${mins}min`
  if (hours < 24) return `Hace ${hours}h`
  if (days  === 1) return 'Ayer'
  if (days  < 14) return `Hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export function contactColor(days: number | null): string {
  if (days === null) return '#6b7280'
  if (days < 2)  return '#22c55e'
  if (days <= 5) return '#f59e0b'
  return '#ef4444'
}

export function dbToUiLead(db: DbLead): Lead {
  const rawStyle = db.style_interest?.[0] ?? ''
  const style    = rawStyle ? rawStyle.toUpperCase() : '—'

  let budget = '—'
  if (db.budget_min != null && db.budget_max != null) {
    budget = `$${db.budget_min}–$${db.budget_max}`
  } else if (db.budget_min != null) {
    budget = `$${db.budget_min}+`
  } else if (db.budget_max != null) {
    budget = `Hasta $${db.budget_max}`
  }

  const instagram = db.instagram
    ? `@${db.instagram.replace(/^@/, '')}`
    : '—'

  // Use last_contacted_at if set, else fall back to created_at
  const contactRef = db.last_contacted_at ?? db.created_at

  return {
    id:                 db.id,
    name:               db.name,
    initials:           getInitials(db.name),
    instagram,
    style,
    budget,
    budgetMin:          db.budget_min  ?? undefined,
    budgetMax:          db.budget_max  ?? undefined,
    status:             (db.status as LeadStatus) ?? 'nuevo',
    artistId:           db.artist_id   ?? undefined,
    artistName:         db.artist?.name ?? 'Sin asignar',
    phone:              db.phone       ?? undefined,
    email:              db.email       ?? undefined,
    bodyZone:           db.body_part   ?? undefined,
    notes:              db.notes       ?? undefined,
    source:             db.source      ?? undefined,
    tags:               db.tags        ?? [],
    priority:           db.priority    ?? 'medium',
    lastContactedAt:    db.last_contacted_at ?? null,
    createdAt:          db.created_at,
    daysSinceContact:   daysSince(contactRef),
    lastContactDisplay: relativeTime(contactRef),
  }
}
