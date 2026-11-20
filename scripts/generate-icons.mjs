// Membuat icon PNG 192x192 dan 512x512 tanpa dependency (pure Node + zlib).
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (~c) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function makePng(size) {
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  const s = size / 512
  const box = (x, y, w, h) => [x * s, y * s, w * s, h * s]

  const inRect = (x, y, r) => x >= r[0] && x < r[0] + r[2] && y >= r[1] && y < r[1] + r[3]
  const frame = [
    box(120, 160, 272, 200), box(146, 186, 220, 148),
    box(120, 232, 272, 24),
    box(158, 118, 84, 52), box(270, 118, 84, 52),
  ]
  const check = [box(184, 296, 28, 28), box(212, 324, 28, 28), box(240, 296, 28, 28), box(268, 268, 28, 28), box(296, 240, 28, 28)]

  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0
    for (let x = 0; x < size; x++) {
      const i = y * stride + 1 + x * 4
      // rounded square background with diagonal indigo gradient
      const r = 112 * s
      const cx = Math.min(Math.max(x, r), size - r), cy = Math.min(Math.max(y, r), size - r)
      const inside = (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2
      if (!inside) { raw[i + 3] = 0; continue }
      const t = (x + y) / (size * 2)
      let cr = Math.round(99 + (67 - 99) * t)
      let cg = Math.round(102 + (56 - 102) * t)
      let cb = Math.round(241 + (202 - 241) * t)
      // white border / handle / check mark
      const isBorder = inRect(x, y, frame[0]) && !inRect(x, y, frame[1])
        || inRect(x, y, frame[2])
      const isHandle = inRect(x, y, frame[3]) || inRect(x, y, frame[4])
      const isCheck = check.some((c) => inRect(x, y, c))
      if (isBorder || isCheck) { cr = cg = cb = 255 }
      else if (isHandle) { cr = 165; cg = 180; cb = 252 }
      raw[i] = cr; raw[i + 1] = cg; raw[i + 2] = cb; raw[i + 3] = 255
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  writeFileSync(new URL(`../public/icon-${size}.png`, import.meta.url), makePng(size))
  console.log(`✔ public/icon-${size}.png`)
}
