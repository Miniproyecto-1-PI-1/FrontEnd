const MAX_BYTES = 5 * 1024 * 1024
const LADO = 256

/** Recorta la imagen al centro en un cuadrado y la devuelve como JPEG 256x256 en data URL. */
export async function aAvatarDataUrl(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('La imagen no puede superar 5 MB.')
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('No se pudo leer la imagen.')
  }

  const lado = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - lado) / 2
  const sy = (bitmap.height - lado) / 2

  const canvas = document.createElement('canvas')
  canvas.width = LADO
  canvas.height = LADO
  const ctx = canvas.getContext('2d')
  // Fondo blanco para PNG con transparencia (JPEG no la soporta).
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, LADO, LADO)
  ctx.drawImage(bitmap, sx, sy, lado, lado, 0, 0, LADO, LADO)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', 0.85)
}
