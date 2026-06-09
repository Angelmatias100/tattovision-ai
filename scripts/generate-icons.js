// scripts/generate-icons.js
// Generates icon-192.png and icon-512.png from public/logo.jpeg for the PWA manifest.
// Strategy: resize logo to fit in the safe zone (80% of target), center on #0a0a0a background.
// Run: node scripts/generate-icons.js

const sharp = require('sharp')
const path  = require('path')

const PUBLIC = path.join(__dirname, '..', 'public')
const LOGO   = path.join(PUBLIC, 'logo.jpeg')

// App background colour (#0a0a0a)
const BG = { r: 10, g: 10, b: 10, alpha: 1 }

async function generateIcon(size) {
  const outPath = path.join(PUBLIC, `icon-${size}.png`)

  // Keep the logo inside the maskable safe zone (80% of canvas size)
  const safeSize  = Math.round(size * 0.8)
  const pad       = (size - safeSize) / 2
  const padTop    = Math.floor(pad)
  const padBottom = Math.ceil(pad)
  const padSide   = Math.round(pad)

  await sharp(LOGO)
    // 1. Resize logo to fit within safe zone, dark fill for letterbox
    .resize(safeSize, safeSize, { fit: 'contain', background: BG })
    // 2. Extend canvas to full target size with same dark background
    .extend({ top: padTop, bottom: padBottom, left: padSide, right: padSide, background: BG })
    .png({ compressionLevel: 9 })
    .toFile(outPath)

  // Log actual output dimensions to confirm
  const meta = await sharp(outPath).metadata()
  console.log(`✅  icon-${size}.png  →  ${meta.width}×${meta.height}px`)
}

async function main() {
  // Log source dimensions
  const src = await sharp(LOGO).metadata()
  console.log(`\nFuente: logo.jpeg  ${src.width}×${src.height}px\n`)

  await generateIcon(192)
  await generateIcon(512)

  console.log('\n✓ Íconos generados en /public — actualiza el manifest.json para apuntar a ellos.')
}

main().catch((err) => {
  console.error('[ERROR]', err.message)
  process.exit(1)
})
