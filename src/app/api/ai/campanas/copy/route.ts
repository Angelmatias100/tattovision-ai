import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createAnthropicClient, AI_MODEL, MAX_TOKENS } from '@/lib/anthropic/client'

const TOKEN_COST = 5

const OBJECTIVE_LABELS: Record<string, string> = {
  leads:    'Generación de leads',
  brand:    'Reconocimiento de marca',
  traffic:  'Tráfico al sitio web',
  messages: 'Mensajes directos',
  visits:   'Visitas al estudio',
  video:    'Reproducción de videos',
}

/**
 * POST /api/ai/campanas/copy
 *
 * Body: {
 *   objective:        string
 *   angleId:          string   — "emocional" | "social_proof" | "urgencia"
 *   angleName:        string
 *   angleTone:        string
 *   angleDescription: string
 * }
 *
 * Streams JSON with 3 headlines, 3 body copy variations, and CTA recommendation.
 * Deducts 5 TV tokens.
 *
 * Response shape:
 * {
 *   headlines: [ { text: string }, … ]   — 3 items, each ≤ 40 chars
 *   bodies:    [ { text: string, length: "Corto"|"Medio"|"Largo" }, … ]   — 3 items
 *   cta: {
 *     recommended: string
 *     reason:      string
 *     options:     string[]   — 3 options
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    objective?:        string
    angleId?:          string
    angleName?:        string
    angleTone?:        string
    angleDescription?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const objective        = body.objective        ?? 'leads'
  const angleId          = body.angleId          ?? 'emocional'
  const angleName        = body.angleName        ?? 'Emocional'
  const angleTone        = body.angleTone        ?? ''
  const angleDescription = body.angleDescription ?? ''

  // ── Fetch business + check balance ────────────────────────────────────────
  const supabase = createAdminClient()

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, city, country, styles, tv_tokens_balance')
    .eq('user_id', userId)
    .single()

  if (bizErr || !biz) {
    return NextResponse.json({ error: 'Business not found — complete onboarding first' }, { status: 404 })
  }

  const balance = biz.tv_tokens_balance ?? 0
  if (balance < TOKEN_COST) {
    return NextResponse.json(
      { error: `Insufficient TV tokens — need ${TOKEN_COST}, have ${balance}` },
      { status: 402 }
    )
  }

  // ── Deduct tokens before streaming ────────────────────────────────────────
  await supabase
    .from('businesses')
    .update({ tv_tokens_balance: balance - TOKEN_COST })
    .eq('id', biz.id)

  // ── Build prompt ──────────────────────────────────────────────────────────
  const stylesStr   = (biz.styles as string[] | null ?? []).join(', ') || 'tatuajes en general'
  const locationStr = [biz.city, biz.country].filter(Boolean).join(', ') || 'Latinoamérica'
  const objLabel    = OBJECTIVE_LABELS[objective] ?? objective

  // Determine 3 contextual CTA options based on objective
  const ctaMatrix: Record<string, string[]> = {
    leads:    ['Enviar mensaje', 'Reservar ahora', 'Solicitar info'],
    brand:    ['Ver portfolio', 'Saber más', 'Seguir estudio'],
    traffic:  ['Ver portfolio', 'Explorar diseños', 'Visitar sitio'],
    messages: ['Enviar mensaje', 'Escribir ahora', 'Consultar precio'],
    visits:   ['Cómo llegar', 'Reservar visita', 'Ver ubicación'],
    video:    ['Ver proceso', 'Saber más', 'Reservar ahora'],
  }
  const ctaOptions = ctaMatrix[objective] ?? ['Enviar mensaje', 'Reservar ahora', 'Saber más']

  const prompt = `Eres un experto en Meta Ads especializado en estudios de tatuajes en Latinoamérica.

Datos del estudio:
- Nombre: ${biz.name}
- Ubicación: ${locationStr}
- Estilos especializados: ${stylesStr}
- Objetivo de campaña: ${objLabel}
- Ángulo estratégico seleccionado: ${angleName} — ${angleDescription}
- Tono del ángulo: ${angleTone}

Genera opciones de copy de Meta Ads optimizadas para este ángulo exactamente en este formato JSON:
{
  "headlines": [
    {"text": "titular 1 impactante (MÁXIMO 40 caracteres exactos, cuenta bien)"},
    {"text": "titular 2 variante (MÁXIMO 40 caracteres exactos)"},
    {"text": "titular 3 alternativo (MÁXIMO 40 caracteres exactos)"}
  ],
  "bodies": [
    {"text": "copy corto máximo 90 caracteres directo y potente adaptado al tono ${angleName}", "length": "Corto"},
    {"text": "copy medio 100-150 caracteres con más contexto emocional y detalle adaptado al tono ${angleName}", "length": "Medio"},
    {"text": "copy largo 150-200 caracteres historia completa con CTA claro adaptado al tono ${angleName}", "length": "Largo"}
  ],
  "cta": {
    "recommended": "${ctaOptions[0]}",
    "reason": "Para ${objLabel} con ángulo ${angleName}, '${ctaOptions[0]}' convierte mejor porque [razón específica y concreta en 1 oración en español]",
    "options": ${JSON.stringify(ctaOptions)}
  }
}

REGLAS CRÍTICAS:
- Los titulares deben tener MÁXIMO 40 caracteres (incluyendo espacios)
- Todo el copy en español para audiencia latinoamericana
- Adapta el tono estrictamente al ángulo ${angleName}: ${angleTone}
- Personaliza para ${biz.name} con estilos ${stylesStr}
- Responde ÚNICAMENTE con el JSON válido. Sin texto adicional, sin markdown.`

  // ── Stream from Anthropic ─────────────────────────────────────────────────
  const anthropic = createAnthropicClient()

  const aiStream = anthropic.messages.stream({
    model:      AI_MODEL,
    max_tokens: MAX_TOKENS,
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
        console.error('[POST /api/ai/campanas/copy] Stream error:', err)
      } finally {
        controller.close()
      }
    },
    cancel() {
      aiStream.abort()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type':      'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Tokens-Deducted': String(TOKEN_COST),
      'X-Angle-Id':        angleId,
    },
  })
}
