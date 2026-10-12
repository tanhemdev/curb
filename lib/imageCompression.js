// Phone photos are 3 to 8 MB. Shrinking them in the browser before upload
// makes posting fast on campus Wi-Fi and keeps storage small.

export const MAX_SIDE = 1280;
export const JPEG_QUALITY = 0.82;

// Size that fits inside maxSide x maxSide, keeping the aspect ratio and never upscaling.
export function fitWithin(width, height, maxSide = MAX_SIDE) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

// File -> JPEG data URL no larger than MAX_SIDE on its longest side.
export async function compressImage(file, { maxSide = MAX_SIDE, quality = JPEG_QUALITY } = {}) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', quality);
}
