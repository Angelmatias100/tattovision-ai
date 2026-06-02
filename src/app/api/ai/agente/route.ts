import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createAnthropicClient, AI_MODEL } from '@/lib/anthropic/client'

const TOKEN_COST = 5

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    lastMessage?:         string
    conversationHistory?: string
    config?: {
      estilos?:       string
      precios?:       string
      horarios?:      string
      instrucciones?: string
    }
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, styles, tv_tokens_balance')
    .eq('user_id', userId)
    .single()

  if (bizErr || !biz) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const balance = biz.tv_tokens_balance ?? 0
  if (balance < TOKEN_COST) {
    return NextResponse.json(
      { error: `Tokens insuficientes — necesitas ${TOKEN_COST}, tienes ${balance}` },
      { status: 402 },
    )
  }

  await supabase
    .from('businesses')
    .update({ tv_tokens_balance: balance - TOKEN_COST })
    .eq('id', biz.id)

  const cfg    = body.config ?? {}
  const styles = (biz.styles as string[] | null ?? []).join(', ') || cfg.estilos || 'tatuajes en general'

  const prompt = `Eres el agente de Instagram DM de "${biz.name}", un estudio de tatuajes profesional.

CONTEXTO DEL NEGOCIO:
- Estilos: ${styles}
- Precios: ${cfg.precios ?? 'Consultar según diseño'}
- Horarios: ${cfg.horarios ?? 'Lunes a sábado 10:00–20:00'}
- Instrucciones: ${cfg.instrucciones ?? 'Siempre pedir referencia e invitar a consulta gratuita'}

${body.conversationHistory ? `CONVERSACIÓN PREVIA:\n${body.conversationHistory}\n` : ''}ÚLTIMO MENSAJE DEL PROSPECTO: "${body.lastMessage ?? ''}"

TAREA:
1. Detecta si es consulta de precio, solicitud de cita o pregunta general
2. Responde en español latinoamericano, tono cálido y cercano, en la voz del estudio
3. Si es precio: menciona el estilo y pide referencia de imagen
4. Si es cita: sugiere disponibilidad y pide confirmar
5. Siempre termina con un CTA para agendar una consulta gratuita
6. Máximo 3 oraciones + CTA. Incluye 1–2 emojis relevantes. Sin formalidades excesivas.

Responde ÚNICAMENTE con el mensaje de respuesta. Sin explicaciones adicionales.`

  const anthropic = createAnthropicClient()
  const aiStream  = anthropic.messages.stream({
    model:      AI_MODEL,
    max_tokens: 512,
    messages:   [{ role: 'user', content: prompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const event of aiStream) {
          if (event.type === 'content_block_delta') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const text: string | undefined = (event.delta as any).text
            if (text) controller.enqueue(encoder.encode(text))
          }
        }
      } catch (err) {
        console.error('[POST /api/ai/agente] Stream error:', err)
      } finally {
        controller.close()
      }
    },
    cancel() { aiStream.abort() },
  })

  return new Response(readable, {
    headers: {
      'Content-Type':      'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Tokens-Deducted': String(TOKEN_COST),
    },
  })
}
