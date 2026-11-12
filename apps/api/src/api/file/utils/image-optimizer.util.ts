import sharp from 'sharp';

export const OPTIMIZABLE_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/tiff',
]);

export function isOptimizableImage(mime?: string | null): boolean {
  if (!mime) return false;
  return OPTIMIZABLE_IMAGE_MIMES.has(mime.toLowerCase());
}

export const MAX_IMAGE_OPTIMIZE_WIDTH = 2560;
export const MAX_IMAGE_OPTIMIZE_HEIGHT = 2560;
export const DEFAULT_OPTIMIZE_QUALITY = 82;

export interface OptimizedImageResult {
  buffer: Buffer;
  mime: string;
  extension: string;
  size: number;
  width?: number;
  height?: number;
  originalName: string;
}

export async function optimizeImageBuffer(
  inputBuffer: Buffer,
  originalName: string,
): Promise<OptimizedImageResult> {
  const sharpInstance = sharp(inputBuffer)
    .rotate()
    .resize({
      width: MAX_IMAGE_OPTIMIZE_WIDTH,
      height: MAX_IMAGE_OPTIMIZE_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: DEFAULT_OPTIMIZE_QUALITY, effort: 4 });

  const buffer = await sharpInstance.toBuffer();
  const meta = await sharp(buffer).metadata();
  const baseName = originalName.replace(/\.[^.]+$/, '');

  return {
    buffer,
    mime: 'image/webp',
    extension: 'webp',
    size: buffer.length,
    width: meta.width,
    height: meta.height,
    originalName: `${baseName}.webp`,
  };
}

export async function optimizeImageFile(
  inputPath: string,
  outputPath: string,
  originalName: string,
): Promise<{
  path: string;
  mime: string;
  extension: string;
  size: number;
  width?: number;
  height?: number;
  originalName: string;
}> {
  const meta = await sharp(inputPath)
    .rotate()
    .resize({
      width: MAX_IMAGE_OPTIMIZE_WIDTH,
      height: MAX_IMAGE_OPTIMIZE_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: DEFAULT_OPTIMIZE_QUALITY, effort: 4 })
    .toFile(outputPath);

  const baseName = originalName.replace(/\.[^.]+$/, '');

  return {
    path: outputPath,
    mime: 'image/webp',
    extension: 'webp',
    size: meta.size,
    width: meta.width,
    height: meta.height,
    originalName: `${baseName}.webp`,
  };
}
