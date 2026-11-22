import sharp from 'sharp';
import { applyKosumeWatermark } from './watermark.util';

describe('WatermarkUtil', () => {
  it('applies watermark to image buffer successfully', async () => {
    const inputBuffer = await sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 3,
        background: { r: 60, g: 80, b: 120 },
      },
    })
      .jpeg()
      .toBuffer();

    const outputBuffer = await applyKosumeWatermark(inputBuffer, {
      authorName: 'Yurisa',
    });

    expect(outputBuffer).toBeInstanceOf(Buffer);
    expect(outputBuffer.length).toBeGreaterThan(0);

    const meta = await sharp(outputBuffer).metadata();
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(800);
  });

  it('handles special characters and long author names without error', async () => {
    const inputBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 120, g: 60, b: 80 },
      },
    })
      .png()
      .toBuffer();

    const outputBuffer = await applyKosumeWatermark(inputBuffer, {
      authorName: 'A_Super_Long_Cosplayer_Stage_Name_With_Special_Chars_<>&"',
    });

    expect(outputBuffer).toBeInstanceOf(Buffer);
    const meta = await sharp(outputBuffer).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(600);
  });

  it('gracefully returns original buffer when input is invalid', async () => {
    const invalidBuffer = Buffer.from('not an image');
    const result = await applyKosumeWatermark(invalidBuffer, {
      authorName: 'Tester',
    });
    expect(result).toBe(invalidBuffer);
  });
});
