import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createAnthropicClient, AI_MODEL, MAX_TOKENS } from '@/lib/anthropic/client'

const TOKEN_COST = 10

const OBJECTIVE_LABELS: Record<string, string> = {
  leads:    'Generación de leads',
  brand:    'Reconocimiento de marca',
  traffic:  'Tráfico al sitio web',
  messages: 'Mensajes directos',
  visits:   'Visitas al estudio',
  video:    'Reproducción de videos',
}

// Normalise AI-returned angle IDs to known keys
const VALID_ANGLE_IDS = ['emocional', 'social_proof', 'urgencia']

/**
 * POST /api/ai/campanas
 *
 * Body: { objective: string }
 *
 * Streams JSON with 3 campaign angles, then deducts 10 TV tokens.
 *
 * Response shape:
 * {
 *   angles: [
 *     {
 *       id:          "emocional" | "social_proof" | "urgencia"
 *       name:        string   — display name
 *       description: string   — one-line strategy description
 *       why:         string   — why this angle suits this business (1–2 sentences)
 *       tone:        string   — tone description + example phrase
 *       audience:    string   — Meta Ads target audience (1 line)
 *       budget:      string   — recommended daily budget (1 line)
 *     },
 *     … (3 total)
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { objective?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const objective = body.objective ?? 'leads'

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

  const prompt = `Eres un experto en Meta Ads especializado en estudios de tatuajes en Latinoamérica.

Datos del estudio:
- Nombre: ${biz.name}
- Ubicación: ${locationStr}
- Estilos especializados: ${stylesStr}
- Objetivo de campaña: ${objLabel}

Genera EXACTAMENTE 3 ángulos estratégicos de campaña, cada uno con una estrategia diferente:
- Ángulo 1 "emocional": Conecta con el significado personal del tatuaje
- Ángulo 2 "social_proof": Muestra resultados reales y testimonios de clientes
- Ángulo 3 "urgencia": Crea urgencia con oferta limitada o disponibilidad escasa

Devuelve ÚNICAMENTE este JSON (sin texto extra, sin markdown):
{
  "angles": [
    {
      "id": "emocional",
      "name": "Emocional",
      "description": "Conecta con el significado personal del tatuaje",
      "why": "Por qué este ángulo es ideal para ${biz.name} con sus estilos de ${stylesStr} en ${locationStr} (1-2 oraciones específicas)",
      "tone": "Descripción del tono en español + frase de ejemplo entre comillas (ej: 'Tu historia merece...')",
      "audience": "Audiencia objetivo para Meta Ads: edad, género, intereses clave (1 línea)",
      "budget": "Presupuesto recomendado por día en USD con breve justificación (1 línea)"
    },
    {
      "id": "social_proof",
      "name": "Social Proof",
      "description": "Muestra resultados reales y testimonios de clientes",
      "why": "...",
      "tone": "...",
      "audience": "...",
      "budget": "..."
    },
    {
      "id": "urgencia",
      "name": "Urgencia",
      "description": "Crea urgencia con oferta limitada o disponibilidad escasa",
      "why": "...",
      "tone": "...",
      "audience": "...",
      "budget": "..."
    }
  ]
}

Personaliza cada ángulo específicamente para ${biz.name} con estilos ${stylesStr} en ${locationStr}.
Responde ÚNICAMENTE con el JSON válido. Sin texto adicional, sin markdown, sin bloques de código.`

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
        console.error('[POST /api/ai/campanas] Stream error:', err)
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
      'Content-Type':       'text/plain; charset=utf-8',
      'Transfer-Encoding':  'chunked',
      'X-Tokens-Deducted':  String(TOKEN_COST),
      'X-Valid-Angle-Ids':  VALID_ANGLE_IDS.join(','),
    },
  })
}
