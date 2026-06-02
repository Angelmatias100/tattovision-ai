'use client'

import { useState, useCallback } from 'react'
import {
  Bot, Wifi, MessageSquare, ChevronDown, ChevronRight,
  Send, PenLine, UserPlus, Sparkles, Check, Clock, Zap,
  Loader2, X,
} from 'lucide-react'
import {
  MOCK_CONVERSATIONS, DEFAULT_CONFIG, STATUS_CONFIG, INTENT_CONFIG,
  type DmConversation, type DmStatus, type AgentConfig,
} from '@/lib/agente'

type Tab = 'bandeja' | 'config'

// ── Primitives ────────────────────────────────────────────────────────────────

function Initials({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
  return (
    <div className={`${dim} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0`}>
      {text}
    </div>
  )
}

function StatusBadge({ status }: { status: DmStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40` }}
    >
      {cfg.label}
    </span>
  )
}

function IntentBadge({ intent }: { intent: DmConversation['intent'] }) {
  const cfg = INTENT_CONFIG[intent]
  return (
    <span className="text-[10px] font-mono" style={{ color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({ autoMode }: { autoMode: boolean }) {
  return (
    <div className="flex items-center gap-3 px-6 py-2.5 bg-card border-b border-border text-sm shrink-0">
      <div className="flex items-center gap-2">
        <Wifi className="w-3.5 h-3.5 text-green-400" />
        <span className="text-muted-foreground text-xs">Instagram:</span>
        <span className="font-mono text-foreground text-xs">@tattoostudio_demo</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-mono">
          MOCK
        </span>
      </div>
      <span className="text-border text-xs">|</span>
      <span className="text-muted-foreground text-xs">Webhook pendiente de aprobación Meta</span>
      {autoMode && (
        <>
          <span className="text-border text-xs">|</span>
          <span className="flex items-center gap-1 text-xs text-primary font-medium">
            <Zap className="w-3 h-3" />
            Respondiendo automáticamente
          </span>
        </>
      )}
    </div>
  )
}

// ── Conversation card ─────────────────────────────────────────────────────────

interface ConvCardProps {
  conv:     DmConversation
  selected: boolean
  expanded: boolean
  onSelect: () => void
  onToggle: () => void
}

function ConvCard({ conv, selected, expanded, onSelect, onToggle }: ConvCardProps) {
  const lastMsg = conv.messages[conv.messages.length - 1]
  return (
    <div
      className={`border-b border-border cursor-pointer transition-colors ${
        selected
          ? 'bg-primary/10 border-l-2 border-l-primary'
          : 'hover:bg-secondary/40'
      }`}
    >
      <div className="p-4" onClick={onSelect}>
        <div className="flex items-start gap-3">
          <Initials text={conv.sender.initials} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-semibold text-foreground text-sm truncate">
                {conv.sender.name}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{conv.lastMessageAt}</span>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono block mb-1.5">
              {conv.sender.handle}
            </span>
            <p className="text-xs text-muted-foreground truncate mb-2">
              {lastMsg.from === 'studio' && (
                <span className="text-primary/60 mr-1">Tú:</span>
              )}
              {lastMsg.text}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={conv.status} />
                <IntentBadge intent={conv.intent} />
              </div>
              <button
                onClick={e => { e.stopPropagation(); onToggle() }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                title="Ver sugerencia IA"
              >
                <Sparkles className="w-3 h-3" />
                {expanded
                  ? <ChevronDown className="w-3 h-3" />
                  : <ChevronRight className="w-3 h-3" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bot className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
              Sugerencia IA
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{conv.aiSuggestion}</p>
        </div>
      )}
    </div>
  )
}

// ── Chat view ─────────────────────────────────────────────────────────────────

interface ChatViewProps {
  conv:         DmConversation
  onSend:       (text: string) => void
  onCreateLead: () => void
  creating:     boolean
  sent:         boolean
}

function ChatView({ conv, onSend, onCreateLead, creating, sent }: ChatViewProps) {
  const [editMode,   setEditMode]   = useState(false)
  const [editedText, setEditedText] = useState(conv.aiSuggestion)

  const handleSend = () => {
    onSend(editMode ? editedText : conv.aiSuggestion)
    setEditMode(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <Initials text={conv.sender.initials} />
        <div>
          <div className="font-semibold text-foreground text-sm">{conv.sender.name}</div>
          <div className="text-[11px] text-muted-foreground font-mono">{conv.sender.handle}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={conv.status} />
          <IntentBadge intent={conv.intent} />
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {conv.messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.from === 'studio' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.from === 'prospect' && (
              <div className="mr-2 mt-auto">
                <Initials text={conv.sender.initials} size="sm" />
              </div>
            )}
            <div
              className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.from === 'studio'
                  ? 'bg-primary/80 text-white rounded-br-sm'
                  : 'bg-secondary text-foreground rounded-bl-sm'
              }`}
            >
              {msg.text}
              <div
                className={`text-[10px] mt-1 ${
                  msg.from === 'studio' ? 'text-white/60 text-right' : 'text-muted-foreground'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI suggestion + actions */}
      <div className="shrink-0 border-t border-border bg-card p-4 space-y-3">
        <div className="rounded-xl bg-primary/10 border border-primary/25 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
              Respuesta sugerida por IA
            </span>
          </div>
          {editMode ? (
            <textarea
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              rows={3}
              className="w-full bg-transparent text-sm text-foreground resize-none outline-none leading-relaxed"
            />
          ) : (
            <p className="text-sm text-foreground/90 leading-relaxed">{conv.aiSuggestion}</p>
          )}
        </div>

        {sent ? (
          <div className="flex items-center justify-center gap-2 py-1.5 text-green-400 text-sm font-medium">
            <Check className="w-4 h-4" />
            Respuesta enviada
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:shadow-glow transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {editMode ? 'Enviar' : 'Enviar respuesta'}
            </button>

            {!editMode ? (
              <button
                onClick={() => { setEditMode(true); setEditedText(conv.aiSuggestion) }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition-colors"
              >
                <PenLine className="w-3.5 h-3.5" />
                Editar y enviar
              </button>
            ) : (
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </button>
            )}

            <button
              onClick={onCreateLead}
              disabled={creating || conv.status === 'lead_creado'}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <UserPlus className="w-3.5 h-3.5" />
              }
              {conv.status === 'lead_creado' ? 'Lead creado ✓' : 'Crear lead en CRM'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <MessageSquare className="w-12 h-12 text-border mb-4" />
      <p className="text-muted-foreground text-sm">Selecciona una conversación</p>
      <p className="text-[11px] text-muted-foreground/50 mt-1">
        para ver el hilo y la respuesta sugerida por IA
      </p>
    </div>
  )
}

// ── Config tab ────────────────────────────────────────────────────────────────

interface ConfigTabProps {
  config:     AgentConfig
  onChange:   (patch: Partial<AgentConfig>) => void
  autoMode:   boolean
  onAutoMode: (v: boolean) => void
}

function ConfigTab({ config, onChange, autoMode, onAutoMode }: ConfigTabProps) {
  const [testMsg,    setTestMsg]    = useState('¿Cuánto cuesta un tatuaje pequeño en la muñeca?')
  const [testResult, setTestResult] = useState('')
  const [testing,    setTesting]    = useState(false)

  const runTest = useCallback(async () => {
    setTesting(true)
    setTestResult('')
    try {
      const res = await fetch('/api/ai/agente', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastMessage: testMsg,
          config: {
            estilos:       config.estilos,
            precios:       config.precios,
            horarios:      config.horarios,
            instrucciones: config.instrucciones,
          },
        }),
      })
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
        setTestResult(`Error: ${err.error}`)
        return
      }
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let result    = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value, { stream: true })
        setTestResult(result)
      }
    } catch {
      setTestResult('Error al conectar con el agente')
    } finally {
      setTesting(false)
    }
  }, [testMsg, config])

  const Field = (
    label:       string,
    name:        keyof AgentConfig,
    multiline    = false,
    placeholder  = '',
  ) => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={config[name] as string}
          onChange={e => onChange({ [name]: e.target.value })}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors resize-none placeholder-muted-foreground/40"
        />
      ) : (
        <input
          type="text"
          value={config[name] as string}
          onChange={e => onChange({ [name]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors placeholder-muted-foreground/40"
        />
      )}
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      {/* Mode */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-1">Modo del agente</h3>
        <p className="text-xs text-muted-foreground mb-4">
          En modo automático el agente responde sin intervención. En modo sugerencia te muestra la respuesta para que la apruebes.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { onChange({ mode: 'sugerencia' }); onAutoMode(false) }}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              !autoMode
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            Modo sugerencia
          </button>
          <button
            onClick={() => { onChange({ mode: 'automatico' }); onAutoMode(true) }}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              autoMode
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1.5" />
            Modo automático
          </button>
        </div>
      </div>

      {/* Business context */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Contexto del negocio</h3>
        {Field('Estilos que ofreces', 'estilos', false, 'Realismo, Japonés, Fine Line...')}
        {Field('Precios aproximados', 'precios', true,  'Describe rangos de precio por tipo de trabajo...')}
        {Field('Horarios de atención', 'horarios', false, 'Lunes a sábado 10:00–20:00')}
        {Field('Mensaje de bienvenida personalizado', 'bienvenida', true)}
        {Field('Instrucciones especiales', 'instrucciones', true, 'Ej: Siempre pedir referencia de imagen antes de cotizar')}
      </div>

      {/* Templates */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">Templates de respuesta</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            El agente usa estos como punto de partida y los adapta al contexto de cada conversación.
          </p>
        </div>
        {Field('Template — consulta de precio', 'templatePrecio', true)}
        {Field('Template — solicitar cita',     'templateCita',   true)}
        {Field('Template — fuera de horario',   'templateFueraHorario', true)}
      </div>

      {/* Test */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">Probar agente con mensaje de ejemplo</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Simula un DM entrante y ve cómo respondería el agente. Consume 5 TV Tokens.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Mensaje de ejemplo
          </label>
          <input
            type="text"
            value={testMsg}
            onChange={e => setTestMsg(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={runTest}
          disabled={testing || !testMsg.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:shadow-glow transition-all disabled:opacity-50"
        >
          {testing
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Probando agente...</>
            : <><Zap className="w-3.5 h-3.5" />Probar agente</>
          }
        </button>
        {testResult && (
          <div className="rounded-xl bg-primary/10 border border-primary/25 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                Respuesta del agente
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentePage() {
  const [tab,           setTab]           = useState<Tab>('bandeja')
  const [autoMode,      setAutoMode]      = useState(false)
  const [selectedId,    setSelectedId]    = useState<string | null>(null)
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)
  const [expanded,      setExpanded]      = useState<Set<string>>(new Set())
  const [config,        setConfig]        = useState<AgentConfig>(DEFAULT_CONFIG)
  const [sentIds,       setSentIds]       = useState<Set<string>>(new Set())
  const [creatingFor,   setCreatingFor]   = useState<string | null>(null)

  const selectedConv = conversations.find(c => c.id === selectedId) ?? null
  const newCount     = conversations.filter(c => c.status === 'nuevo').length

  const toggleExpanded = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }, [])

  const handleSend = useCallback((text: string) => {
    if (!selectedId) return
    setConversations(prev => prev.map(c => {
      if (c.id !== selectedId) return c
      return {
        ...c,
        status:   'respondido' as const,
        messages: [
          ...c.messages,
          { id: `sent-${Date.now()}`, from: 'studio' as const, text, timestamp: 'Ahora' },
        ],
      }
    }))
    setSentIds(prev => { const n = new Set(prev); n.add(selectedId); return n })
    setTimeout(() => {
      setSentIds(prev => { const n = new Set(prev); n.delete(selectedId); return n })
    }, 3000)
  }, [selectedId])

  const handleCreateLead = useCallback(async (conv: DmConversation) => {
    setCreatingFor(conv.id)
    try {
      const lastText = conv.messages[conv.messages.length - 1].text
      const res = await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:      conv.sender.name,
          instagram: conv.sender.handle,
          notes:     `Lead creado desde Instagram DM. Último mensaje: "${lastText}"`,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('[AgentePage] createLead error:', err)
        return
      }
      setConversations(prev =>
        prev.map(c => c.id === conv.id ? { ...c, status: 'lead_creado' as const } : c)
      )
    } catch (err) {
      console.error('[AgentePage] createLead:', err)
    } finally {
      setCreatingFor(null)
    }
  }, [])

  return (
    <div className="flex flex-col bg-background" style={{ height: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
        <div>
          <h1 className="font-playfair text-xl font-bold text-foreground">
            Agente de Instagram
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Respuestas automáticas vía DM ·{' '}
            <span className={newCount > 0 ? 'text-primary font-medium' : ''}>
              {newCount} nuevo{newCount !== 1 ? 's' : ''}
            </span>
          </p>
        </div>

        {/* Auto mode toggle */}
        <button
          onClick={() => setAutoMode(v => !v)}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            autoMode
              ? 'border-primary bg-primary/15 text-primary shadow-glow-sm'
              : 'border-border text-muted-foreground hover:border-primary/30'
          }`}
        >
          <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${autoMode ? 'bg-primary' : 'bg-border'}`}>
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: autoMode ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </div>
          Modo automático {autoMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Status bar */}
      <StatusBar autoMode={autoMode} />

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0 bg-card">
        {(['bandeja', 'config'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'bandeja' ? 'Bandeja de entrada' : 'Configuración del agente'}
            {t === 'bandeja' && newCount > 0 && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white font-mono">
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'bandeja' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Conversation list */}
          <div className="w-80 shrink-0 border-r border-border overflow-y-auto bg-card/50">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="w-8 h-8 text-border mb-3" />
                <p className="text-xs text-muted-foreground">Sin conversaciones</p>
              </div>
            ) : (
              conversations.map(conv => (
                <ConvCard
                  key={conv.id}
                  conv={conv}
                  selected={conv.id === selectedId}
                  expanded={expanded.has(conv.id)}
                  onSelect={() => setSelectedId(conv.id)}
                  onToggle={() => toggleExpanded(conv.id)}
                />
              ))
            )}
          </div>

          {/* Chat view */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedConv ? (
              <ChatView
                key={selectedConv.id}
                conv={selectedConv}
                onSend={handleSend}
                onCreateLead={() => handleCreateLead(selectedConv)}
                creating={creatingFor === selectedConv.id}
                sent={sentIds.has(selectedConv.id)}
              />
            ) : (
              <EmptyChat />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ConfigTab
            config={config}
            onChange={patch => setConfig(prev => ({ ...prev, ...patch }))}
            autoMode={autoMode}
            onAutoMode={setAutoMode}
          />
        </div>
      )}
    </div>
  )
}
