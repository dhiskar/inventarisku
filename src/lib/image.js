export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Firestore membatasi 1 dokumen maksimal ~1 MiB. Kita targetkan jauh di bawah itu.
const MAX_DATA_URL_LENGTH = 650_000

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Format gambar tidak dikenali.'))
    image.src = src
  })
}

/**
 * Mengubah gambar menjadi data URL JPG yang disimpan langsung di Firestore.
 * Ukuran dan kualitas diturunkan bertahap sampai di bawah batas aman dokumen Firestore.
 */
export async function imageToDataUrl(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Pilih file gambar (JPG/PNG/WebP).')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Ukuran gambar maksimal 5 MB.')

  const source = await loadImage(await readAsDataURL(file))
  let scale = Math.min(1, 1400 / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  let smallest = ''
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const width = Math.max(1, Math.round(source.width * scale))
    const height = Math.max(1, Math.round(source.height * scale))
    canvas.width = width
    canvas.height = height
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(source, 0, 0, width, height)

    const quality = Math.max(0.35, 0.82 - attempt * 0.07)
    const candidate = canvas.toDataURL('image/jpeg', quality)
    if (candidate.length <= MAX_DATA_URL_LENGTH) return candidate

    smallest = candidate
    if (width < 320 && height < 320) break
    scale *= 0.82
  }

  throw new Error('Foto kwitansi masih terlalu besar setelah dikompres. Coba foto dengan resolusi lebih rendah.')
}
