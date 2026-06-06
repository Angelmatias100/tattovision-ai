// scripts/meta-test-calls.js
// Makes 500 test calls to the Meta Marketing API (required for Meta App Review).
// Usage: node scripts/meta-test-calls.js

const { createClient } = require('@supabase/supabase-js')
const fs   = require('fs')
const path = require('path')

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('[ERROR] .env.local no encontrado en la raíz del proyecto.')
    process.exit(1)
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key   = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

// ── Delay helper ──────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  loadEnv()

  const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const CLERK_SECRET_KEY     = process.env.CLERK_SECRET_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[ERROR] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
    process.exit(1)
  }
  if (!CLERK_SECRET_KEY) {
    console.error('[ERROR] Falta CLERK_SECRET_KEY en .env.local')
    process.exit(1)
  }

  // ── 1. Resolve email → Clerk user ID ────────────────────────────────────────
  const TARGET_EMAIL = 'matiasbarrex@gmail.com'
  console.log(`\n🔍 Buscando usuario con email: ${TARGET_EMAIL} ...`)

  const clerkRes = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(TARGET_EMAIL)}`,
    { headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` } }
  )

  if (!clerkRes.ok) {
    const body = await clerkRes.text()
    console.error(`[ERROR] Clerk API respondió ${clerkRes.status}: ${body}`)
    process.exit(1)
  }

  const clerkUsers = await clerkRes.json()
  if (!Array.isArray(clerkUsers) || clerkUsers.length === 0) {
    console.error(`[ERROR] No se encontró ningún usuario con email ${TARGET_EMAIL} en Clerk.`)
    process.exit(1)
  }

  const userId = clerkUsers[0].id
  console.log(`✅ Usuario encontrado — Clerk ID: ${userId}`)

  // ── 2. Fetch business credentials from Supabase ──────────────────────────────
  console.log('\n📦 Obteniendo credenciales de Supabase ...')
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: business, error: dbError } = await supabase
    .from('businesses')
    .select('name, meta_access_token, meta_account_id')
    .eq('user_id', userId)
    .single()

  if (dbError || !business) {
    console.error(`[ERROR] No se encontró negocio para user_id ${userId}: ${dbError?.message ?? 'sin datos'}`)
    process.exit(1)
  }

  if (!business.meta_access_token) {
    console.error('[ERROR] El negocio no tiene meta_access_token guardado.')
    console.error('        Conéctate a Meta desde Configuración → Integraciones y vuelve a ejecutar el script.')
    process.exit(1)
  }

  if (!business.meta_account_id) {
    console.error('[ERROR] El negocio no tiene meta_account_id guardado.')
    console.error('        Selecciona una cuenta publicitaria en Configuración → Integraciones.')
    process.exit(1)
  }

  const { name, meta_access_token: token, meta_account_id: accountId } = business

  console.log(`✅ Negocio    : ${name}`)
  console.log(`✅ Ad Account : act_${accountId}`)
  console.log(`✅ Token      : ${token.slice(0, 24)}...`)

  // ── 3. Run 500 calls ─────────────────────────────────────────────────────────
  const TOTAL    = 500
  const DELAY_MS = 200

  // accountId may already include the "act_" prefix — normalise it
  const normalizedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`
  const endpoint = `https://graph.facebook.com/v18.0/${normalizedId}/insights`
  const params   = new URLSearchParams({
    fields:       'impressions,clicks,spend',
    date_preset:  'last_7d',
    access_token: token,
  })
  const fullUrl = `${endpoint}?${params}`

  console.log(`\n🚀 Iniciando ${TOTAL} llamadas a Meta Marketing API...`)
  console.log(`   Endpoint : GET /${normalizedId}/insights`)
  console.log(`   Delay    : ${DELAY_MS}ms entre llamadas`)
  console.log(`   Tiempo estimado: ~${Math.ceil((TOTAL * DELAY_MS) / 60000)} minutos\n`)

  let successful = 0
  let failed     = 0
  const errors   = []

  for (let i = 1; i <= TOTAL; i++) {
    try {
      const res  = await fetch(fullUrl)
      const data = await res.json()

      if (res.ok && !data.error) {
        successful++
        process.stdout.write(
          `\r  Llamada ${String(i).padStart(3)}/${TOTAL}  —  Status: ✅ OK            ` +
          `(${successful} exitosas, ${failed} fallidas)`
        )
      } else {
        failed++
        const msg = data.error?.message ?? `HTTP ${res.status}`
        errors.push({ call: i, message: msg })
        process.stdout.write(
          `\r  Llamada ${String(i).padStart(3)}/${TOTAL}  —  Status: ❌ ${msg.slice(0, 40).padEnd(40)}` +
          `(${successful} exitosas, ${failed} fallidas)`
        )
      }
    } catch (err) {
      failed++
      errors.push({ call: i, message: err.message })
      process.stdout.write(
        `\r  Llamada ${String(i).padStart(3)}/${TOTAL}  —  Status: ❌ ${err.message.slice(0, 40).padEnd(40)}` +
        `(${successful} exitosas, ${failed} fallidas)`
      )
    }

    if (i < TOTAL) await delay(DELAY_MS)
  }

  // ── 4. Summary ───────────────────────────────────────────────────────────────
  console.log('\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  RESUMEN DE LLAMADAS A META API')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  Total realizadas : ${TOTAL}`)
  console.log(`  Exitosas         : ${successful}  (${((successful / TOTAL) * 100).toFixed(1)}%)`)
  console.log(`  Fallidas         : ${failed}  (${((failed / TOTAL) * 100).toFixed(1)}%)`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (errors.length > 0) {
    console.log('\n  Primeros errores:')
    errors.slice(0, 5).forEach(({ call, message }) => {
      console.log(`    Llamada #${call}: ${message}`)
    })
  }

  if (successful >= 500) {
    console.log('\n✅ ¡500 llamadas exitosas completadas! Listo para el App Review de Meta.')
  } else if (successful > 0) {
    console.log(`\n⚠️  Solo ${successful}/500 llamadas exitosas. Revisa los errores y vuelve a ejecutar.`)
  } else {
    console.log('\n❌ Ninguna llamada fue exitosa. Verifica el token y la cuenta publicitaria.')
  }

  console.log()
}

main().catch((err) => {
  console.error('\n[FATAL]', err.message)
  process.exit(1)
})
