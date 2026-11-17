/**
 * Helper to load File into HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file'));
    };
    img.src = url;
  });
}

/**
 * Convert image between formats with optional quality slider
 */
export async function convertImageFormat(
  file: File,
  targetMime: 'image/jpeg' | 'image/png' | 'image/webp',
  quality = 0.92
): Promise<{ blob: Blob; url: string; originalSize: number; newSize: number; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2D context');

  // If converting to JPEG, fill white background for transparency
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Image conversion failed'));
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          originalSize: file.size,
          newSize: blob.size,
          width: canvas.width,
          height: canvas.height,
        });
      },
      targetMime,
      quality
    );
  });
}

/**
 * Compress image with target quality & optional maximum width constraint
 */
export async function compressImage(
  file: File,
  quality = 0.75,
  maxWidth = 1920
): Promise<{ blob: Blob; url: string; originalSize: number; newSize: number; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;

  if (maxWidth && w > maxWidth) {
    const ratio = maxWidth / w;
    w = maxWidth;
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Keep format or fallback to webp/jpeg
  const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  if (outputFormat === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.drawImage(img, 0, 0, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Compression failed'));
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          originalSize: file.size,
          newSize: blob.size,
          width: w,
          height: h,
        });
      },
      outputFormat,
      quality
    );
  });
}

/**
 * Resize image to exact width and height
 */
export async function resizeImage(
  file: File,
  targetW: number,
  targetH: number
): Promise<{ blob: Blob; url: string; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  return new Promise((resolve, reject) => {
    const mime = file.type || 'image/png';
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Resize failed'));
      resolve({
        blob,
        url: URL.createObjectURL(blob),
        width: targetW,
        height: targetH,
      });
    }, mime);
  });
}

/**
 * Crop image with bounding box
 */
export async function cropImage(
  file: File,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number
): Promise<{ blob: Blob; url: string }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = cropW;
  canvas.height = cropH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context error');

  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Crop failed'));
      resolve({ blob, url: URL.createObjectURL(blob) });
    }, file.type || 'image/png');
  });
}

/**
 * Rotate & Flip image
 */
export async function rotateFlipImage(
  file: File,
  angleDegrees: number,
  flipH = false,
  flipV = false
): Promise<{ blob: Blob; url: string }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const rads = (angleDegrees * Math.PI) / 180;
  const isPerpendicular = Math.abs(angleDegrees % 180) === 90;

  const w = isPerpendicular ? img.naturalHeight : img.naturalWidth;
  const h = isPerpendicular ? img.naturalWidth : img.naturalHeight;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas error');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rads);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Rotate failed'));
      resolve({ blob, url: URL.createObjectURL(blob) });
    }, file.type || 'image/png');
  });
}

/**
 * Apply filters (Grayscale, Sepia, Invert, Sketch, Blur, Sharpen)
 */
export async function applyImageFilter(
  file: File,
  filterType: 'grayscale' | 'sepia' | 'invert' | 'blur' | 'sharpen' | 'sketch'
): Promise<{ blob: Blob; url: string }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas error');

  if (filterType === 'grayscale') {
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(img, 0, 0);
  } else if (filterType === 'sepia') {
    ctx.filter = 'sepia(100%)';
    ctx.drawImage(img, 0, 0);
  } else if (filterType === 'invert') {
    ctx.filter = 'invert(100%)';
    ctx.drawImage(img, 0, 0);
  } else if (filterType === 'blur') {
    ctx.filter = 'blur(6px)';
    ctx.drawImage(img, 0, 0);
  } else if (filterType === 'sketch' || filterType === 'sharpen') {
    // Pixel manipulation
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    if (filterType === 'sketch') {
      // High contrast edge sketch effect
      for (let i = 0; i < data.length; i += 4) {
        const v = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const val = v > 120 ? 255 : 40;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
    } else {
      // Sharpen high frequency
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.15);
        data[i + 1] = Math.min(255, data[i + 1] * 1.15);
        data[i + 2] = Math.min(255, data[i + 2] * 1.15);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Filter application failed'));
      resolve({ blob, url: URL.createObjectURL(blob) });
    }, file.type || 'image/png');
  });
}

/**
 * Add Text or Watermark to Image
 */
export async function addWatermarkToImage(
  file: File,
  text: string,
  fontSize = 36,
  color = '#ffffff',
  opacity = 0.8,
  position: 'center' | 'bottom-right' | 'diagonal' = 'bottom-right'
): Promise<{ blob: Blob; url: string }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas error');

  ctx.drawImage(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px sans-serif`;

  if (position === 'center') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  } else if (position === 'diagonal') {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.textAlign = 'center';
    ctx.fillText(text, 0, 0);
  } else {
    // bottom right
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, canvas.width - 24, canvas.height - 24);
  }

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Watermark failed'));
      resolve({ blob, url: URL.createObjectURL(blob) });
    }, file.type || 'image/png');
  });
}

/**
 * Generate Multi-size Favicons
 */
export async function generateFavicons(file: File): Promise<Array<{ size: number; url: string; blob: Blob }>> {
  const img = await loadImageFromFile(file);
  const sizes = [16, 32, 48, 64, 128];
  const results: Array<{ size: number; url: string; blob: Blob }> = [];

  for (const s of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, s, s);
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
      results.push({
        size: s,
        url: URL.createObjectURL(blob),
        blob,
      });
    }
  }

  return results;
}
