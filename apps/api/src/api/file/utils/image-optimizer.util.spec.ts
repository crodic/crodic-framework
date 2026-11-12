import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  isOptimizableImage,
  optimizeImageBuffer,
  optimizeImageFile,
} from './image-optimizer.util';

describe('image-optimizer.util', () => {
  describe('isOptimizableImage', () => {
    it('returns true for supported image mime types', () => {
      expect(isOptimizableImage('image/jpeg')).toBe(true);
      expect(isOptimizableImage('image/jpg')).toBe(true);
      expect(isOptimizableImage('image/png')).toBe(true);
      expect(isOptimizableImage('image/webp')).toBe(true);
      expect(isOptimizableImage('image/avif')).toBe(true);
      expect(isOptimizableImage('image/tiff')).toBe(true);
      expect(isOptimizableImage('IMAGE/JPEG')).toBe(true);
    });

    it('returns false for non-optimizable or non-image types', () => {
      expect(isOptimizableImage('image/svg+xml')).toBe(false);
      expect(isOptimizableImage('image/gif')).toBe(false);
      expect(isOptimizableImage('application/pdf')).toBe(false);
      expect(isOptimizableImage('video/mp4')).toBe(false);
      expect(isOptimizableImage('')).toBe(false);
      expect(isOptimizableImage(null)).toBe(false);
      expect(isOptimizableImage(undefined)).toBe(false);
    });
  });

  describe('optimizeImageBuffer', () => {
    it('optimizes an image buffer to WebP with proper metadata and naming', async () => {
      const pngBuffer = await sharp({
        create: {
          width: 3000,
          height: 1500,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const result = await optimizeImageBuffer(pngBuffer, 'banner-image.png');

      expect(result.mime).toBe('image/webp');
      expect(result.extension).toBe('webp');
      expect(result.originalName).toBe('banner-image.webp');
      expect(result.size).toBeGreaterThan(0);
      expect(result.width).toBeLessThanOrEqual(2560);
      expect(result.height).toBeLessThanOrEqual(2560);

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe('webp');
      expect(metadata.width).toBe(2560);
      expect(metadata.height).toBe(1280);
    });
  });

  describe('optimizeImageFile', () => {
    const tmpDir = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '.tmp-test-optimizer',
    );

    beforeAll(() => {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    });

    afterAll(() => {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it('optimizes an image file to destination WebP file', async () => {
      const inputPath = path.join(tmpDir, 'test-in.jpg');
      const outputPath = path.join(tmpDir, 'test-out.webp');

      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 0, g: 128, b: 255 },
        },
      })
        .jpeg()
        .toFile(inputPath);

      const result = await optimizeImageFile(
        inputPath,
        outputPath,
        'sample.jpg',
      );

      expect(result.path).toBe(outputPath);
      expect(result.mime).toBe('image/webp');
      expect(result.extension).toBe('webp');
      expect(result.originalName).toBe('sample.webp');
      expect(fs.existsSync(outputPath)).toBe(true);

      const metadata = await sharp(outputPath).metadata();
      expect(metadata.format).toBe('webp');
      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(600);
    });
  });
});
