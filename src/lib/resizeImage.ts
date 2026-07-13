/**
 * Skalerer et opplastet bilde ned til maks `maxDim` piksler og returnerer en
 * JPEG-data-URL. Prøver createImageBitmap først (raskt, HEIC-støtte i
 * Safari), faller tilbake til <img>-dekoding.
 */
export async function resizeToDataUrl(file: File, maxDim = 1000, quality = 0.78): Promise<string> {
  const source = await decode(file);
  const scale = Math.min(1, maxDim / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas utilgjengelig');
  ctx.drawImage(source.img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

type Decoded = { img: CanvasImageSource; width: number; height: number };

async function decode(file: File): Promise<Decoded> {
  try {
    const bitmap = await createImageBitmap(file);
    return { img: bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { img, width: img.naturalWidth, height: img.naturalHeight };
    } finally {
      // objekt-URL-en må leve til drawImage er ferdig; utsett opprydding
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
  }
}
