import { Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import path from 'path';
import sharp from 'sharp';

const logger = new Logger('CosplayModerationUtil');

export interface ModerationResult {
  isCosplay: boolean;
  confidence: number;
  topLabel: string;
  latencyMs: number;
}

let classifierPromise: Promise<any> | null = null;

const POSITIVE_LABELS = [
  'a cosplay costume and character outfit',
  'an anime or game cosplay photoshoot with wig',
];

const NEGATIVE_LABELS = [
  'casual clothes and ordinary everyday portrait',
  'a plate of food or meal',
  'computer graphics, text poster or screenshot',
  'a pet animal or outdoor landscape',
];

const ALL_LABELS = [...POSITIVE_LABELS, ...NEGATIVE_LABELS];

/**
 * Lazy loads the ONNX quantized CLIP zero-shot classification model.
 */
async function loadTransformers(): Promise<any> {
  const dynamicImport = new Function('specifier', 'return import(specifier)');
  return await dynamicImport('@xenova/transformers');
}

/**
 * Lazy loads the ONNX quantized CLIP zero-shot classification model.
 */
async function getClassifier(): Promise<any> {
  if (!classifierPromise) {
    classifierPromise = (async () => {
      try {
        const { pipeline, env } = await loadTransformers();
        env.cacheDir = path.resolve(process.cwd(), '.cache/transformers');
        env.allowLocalModels = true;

        logger.log(
          'Loading lightweight ONNX CLIP model for cosplay moderation...',
        );
        const classifier = await pipeline(
          'zero-shot-image-classification',
          'Xenova/clip-vit-base-patch32',
          { quantized: true },
        );
        logger.log('ONNX CLIP model loaded successfully');
        return classifier;
      } catch (err: any) {
        logger.warn(`Failed to initialize CLIP model: ${err?.message || err}`);
        return null;
      }
    })();
  }
  return classifierPromise;
}

/**
 * Evaluates whether an image buffer contains cosplay content.
 * Runs completely locally on CPU with zero external API fees.
 */
export async function classifyCosplayImage(
  imageBuffer: Buffer,
  threshold = 0.5,
): Promise<ModerationResult> {
  const startTime = Date.now();
  try {
    const classifier = await getClassifier();
    if (!classifier) {
      return {
        isCosplay: true,
        confidence: 1.0,
        topLabel: 'bypassed_model_unavailable',
        latencyMs: 0,
      };
    }

    const { RawImage } = await loadTransformers();

    // 1. Fast raw pixel extract (224x224 RGB) with sharp to minimize CPU overhead
    const { data, info } = await sharp(imageBuffer, { failOn: 'none' })
      .rotate()
      .resize(224, 224, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const raw = new RawImage(data, info.width, info.height, info.channels);

    // 2. Perform zero-shot classification (~100-150ms on standard CPU)
    const results = await classifier(raw, ALL_LABELS);

    // 3. Compute aggregate cosplay confidence
    let cosplayScore = 0;
    for (const r of results) {
      if (POSITIVE_LABELS.includes(r.label)) {
        cosplayScore += r.score;
      }
    }

    const latencyMs = Date.now() - startTime;
    const roundedConfidence = Math.round(cosplayScore * 100) / 100;
    const topLabel = results[0]?.label || '';

    // Threshold check
    const isCosplay = cosplayScore >= threshold;

    logger.debug(
      `Cosplay moderation result: isCosplay=${isCosplay}, confidence=${roundedConfidence}, threshold=${threshold}, topLabel="${topLabel}" (${latencyMs}ms)`,
    );

    return {
      isCosplay,
      confidence: roundedConfidence,
      topLabel,
      latencyMs,
    };
  } catch (err: any) {
    logger.warn(`Moderation classification error: ${err?.message || err}`);
    return {
      isCosplay: true,
      confidence: 1.0,
      topLabel: 'bypassed_on_error',
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Extracts a single keyframe from a video buffer using ffmpeg.
 */
export async function extractVideoKeyframe(
  videoBuffer: Buffer,
): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const ffmpeg = spawn(
        'ffmpeg',
        [
          '-ss',
          '00:00:01.000',
          '-i',
          'pipe:0',
          '-vframes',
          '1',
          '-f',
          'image2pipe',
          '-vcodec',
          'mjpeg',
          'pipe:1',
        ],
        { stdio: ['pipe', 'pipe', 'ignore'] },
      );

      const chunks: Buffer[] = [];
      ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk));
      ffmpeg.on('close', (code) => {
        if (code === 0 && chunks.length > 0) {
          resolve(Buffer.concat(chunks));
        } else {
          resolve(null);
        }
      });
      ffmpeg.on('error', (err) => {
        logger.warn(
          `Failed to extract video frame with ffmpeg: ${err?.message || err}`,
        );
        resolve(null);
      });
      ffmpeg.stdin.end(videoBuffer);
    } catch (err: any) {
      logger.warn(`FFmpeg invocation error: ${err?.message || err}`);
      resolve(null);
    }
  });
}

/**
 * Evaluates whether a video buffer contains cosplay content.
 */
export async function classifyCosplayVideo(
  videoBuffer: Buffer,
  threshold = 0.5,
): Promise<ModerationResult> {
  const startTime = Date.now();
  try {
    const frameBuffer = await extractVideoKeyframe(videoBuffer);
    if (!frameBuffer) {
      // If frame extraction fails or ffmpeg is not available, bypass gracefully
      return {
        isCosplay: true,
        confidence: 1.0,
        topLabel: 'video_bypassed_no_frame',
        latencyMs: Date.now() - startTime,
      };
    }
    return await classifyCosplayImage(frameBuffer, threshold);
  } catch (err: any) {
    logger.warn(`Video moderation error: ${err?.message || err}`);
    return {
      isCosplay: true,
      confidence: 1.0,
      topLabel: 'video_bypassed_on_error',
      latencyMs: Date.now() - startTime,
    };
  }
}
