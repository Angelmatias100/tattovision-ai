export type DmStatus  = 'nuevo' | 'respondido' | 'lead_creado'
export type DmIntent  = 'precio' | 'cita' | 'general'
export type AgentMode = 'automatico' | 'sugerencia'

export interface DmMessage {
  id:        string
  from:      'prospect' | 'studio'
  text:      string
  timestamp: string
}

export interface DmSender {
  name:     string
  handle:   string
  initials: string
}

export interface DmConversation {
  id:            string
  sender:        DmSender
  messages:      DmMessage[]
  lastMessageAt: string
  status:        DmStatus
  intent:        DmIntent
  aiSuggestion:  string
}

export interface AgentConfig {
  mode:                 AgentMode
  estilos:              string
  precios:              string
  horarios:             string
  bienvenida:           string
  instrucciones:        string
  templatePrecio:       string
  templateCita:         string
  templateFueraHorario: string
}

export const STATUS_CONFIG: Record<DmStatus, { label: string; color: string; bg: string }> = {
  nuevo:       { label: 'Nuevo',       color: '#8B00FF', bg: 'rgba(139,0,255,0.15)' },
  respondido:  { label: 'Respondido',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  lead_creado: { label: 'Lead creado', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
}

export const INTENT_CONFIG: Record<DmIntent, { label: string; color: string }> = {
  precio:  { label: 'Precio',  color: '#f97316' },
  cita:    { label: 'Cita',    color: '#38bdf8' },
  general: { label: 'General', color: '#94a3b8' },
}

export const DEFAULT_CONFIG: AgentConfig = {
  mode:                 'sugerencia',
  estilos:              'Realismo, Japonés, Neo-tradicional, Fine Line, Blackwork',
  precios:              'Pequeños desde $50 USD, medianos $150–300 USD, piezas grandes desde $500 USD. Sesión por hora $80 USD.',
  horarios:             'Lunes a sábado de 10:00 a 20:00. Domingos cerrado.',
  bienvenida:           '¡Hola! Gracias por escribirnos 💜 Somos un estudio especializado en tatuajes de alta calidad. ¿En qué podemos ayudarte?',
  instrucciones:        'Siempre pedir referencia de imagen antes de dar presupuesto. Invitar a consulta gratuita. Usar lenguaje cercano y cálido.',
  templatePrecio:       'Los precios dependen del tamaño, estilo y horas de trabajo. ¿Tienes una referencia en mente? Con eso te damos un presupuesto exacto. 📸 ¡Agenda una consulta gratuita!',
  templateCita:         'Tenemos disponibilidad esta semana. ¿Qué día y horario te viene mejor? Te pedimos una señal del 30% para confirmar. 🗓️',
  templateFueraHorario: 'Gracias por tu mensaje 🌙 En este momento estamos fuera de horario. Te respondemos mañana entre 10:00 y 20:00. ¡Hasta pronto!',
}

export const MOCK_CONVERSATIONS: DmConversation[] = [
  {
    id: '1',
    sender: { name: 'Carlos Rodríguez', handle: '@carlosrod_tattoo', initials: 'CR' },
    messages: [
      { id: 'm1', from: 'prospect', text: '¡Hola! ¿Cuánto cobran por un tatuaje de realismo en el brazo completo?', timestamp: '10:32' },
      { id: 'm2', from: 'studio',   text: 'Hola Carlos! 🙌 Los precios varían según el diseño y las horas de trabajo. ¿Tienes alguna referencia en mente?', timestamp: '10:35' },
      { id: 'm3', from: 'prospect', text: '¿Y necesito tener referencia de foto o pueden hacer algo completamente custom?', timestamp: '10:41' },
    ],
    lastMessageAt: 'hace 5 min',
    status:        'nuevo',
    intent:        'precio',
    aiSuggestion:  '¡Claro que sí! Podemos hacer diseños completamente custom o trabajar con referencia — como prefieras. Para el brazo completo en realismo el precio depende del detalle y las horas de sesión. ¿Tienes alguna imagen que te inspire? Así te damos un presupuesto más preciso. 💜 ¿Agendamos una consulta gratuita para verlo juntos?',
  },
  {
    id: '2',
    sender: { name: 'Valentina Torres', handle: '@vale_ink', initials: 'VT' },
    messages: [
      { id: 'm4', from: 'prospect', text: '¡Buenas! Quiero saber si tienen fecha disponible para este fin de semana para un tatuaje pequeño', timestamp: 'Ayer 09:15' },
      { id: 'm5', from: 'studio',   text: 'Hola Valentina! Déjame revisar la agenda... tenemos el sábado a las 15:00 libre. ¿Te funcionaría?', timestamp: 'Ayer 09:40' },
      { id: 'm6', from: 'prospect', text: 'Perfecto! ¿Qué necesito para confirmar?', timestamp: 'Ayer 09:52' },
    ],
    lastMessageAt: 'hace 2 h',
    status:        'respondido',
    intent:        'cita',
    aiSuggestion:  'Para confirmar la cita necesitamos una señal del 30% y la referencia del diseño. ¿Me envías la imagen? Así nuestro artista puede prepararse y calcular el tiempo exacto. 🗓️',
  },
  {
    id: '3',
    sender: { name: 'Sebastián Morales', handle: '@seba.mora', initials: 'SM' },
    messages: [
      { id: 'm7', from: 'prospect', text: '¿Hacen tatuajes en estilo japonés? Vi su página y me encantó el trabajo', timestamp: 'Lun 14:20' },
      { id: 'm8', from: 'studio',   text: 'Sí! Es uno de nuestros estilos principales ✨ ¿Tienes algo en mente?', timestamp: 'Lun 14:35' },
      { id: 'm9', from: 'prospect', text: 'Quiero una carpa koi en el antebrazo. ¿Cuánto estaría?', timestamp: 'Lun 15:10' },
    ],
    lastMessageAt: 'hace 2 días',
    status:        'lead_creado',
    intent:        'precio',
    aiSuggestion:  'Una carpa koi en el antebrazo es preciosa en japonés 🎋 Para ese tamaño estaríamos hablando de 2–3 sesiones. ¿Tienes referencia de colores o preferís blanco y negro? Agendá una consulta gratuita y lo diseñamos juntos.',
  },
  {
    id: '4',
    sender: { name: 'Ana Gutiérrez', handle: '@anagutierrez22', initials: 'AG' },
    messages: [
      { id: 'm10', from: 'prospect', text: '¿Tienen artista especializado en fine line? Quiero algo muy delicado en la clavícula', timestamp: '13:20' },
    ],
    lastMessageAt: 'hace 20 min',
    status:        'nuevo',
    intent:        'general',
    aiSuggestion:  '¡Hola Ana! Sí, tenemos artistas especializados en fine line — es un estilo que requiere mucha precisión y amamos el resultado. La clavícula es una zona delicada pero queda espectacular. ¿Tienes una referencia de diseño? 💜 ¡Agendá una consulta gratuita para verlo juntos!',
  },
]
