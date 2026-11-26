import sharp from 'sharp';
import { classifyCosplayImage } from './cosplay-moderation.util';

describe('CosplayModerationUtil', () => {
  it('handles invalid or empty buffer gracefully without throwing', async () => {
    const invalidBuffer = Buffer.from('not an image data');
    const result = await classifyCosplayImage(invalidBuffer);

    expect(result).toBeDefined();
    expect(result.isCosplay).toBe(true); // graceful bypass on error
    expect(typeof result.latencyMs).toBe('number');
  });

  it('classifies an image buffer and returns structured moderation result', async () => {
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 120, g: 150, b: 180 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await classifyCosplayImage(buffer);

    expect(result).toBeDefined();
    expect(typeof result.isCosplay).toBe('boolean');
    expect(typeof result.confidence).toBe('number');
    expect(typeof result.topLabel).toBe('string');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
