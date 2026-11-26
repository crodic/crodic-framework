import { Logger } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const logger = new Logger('WatermarkUtil');

export interface WatermarkOptions {
  authorName?: string;
  brandText?: string;
}

let cachedLogoBase64: string | null = null;
let logoLoadAttempted = false;

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

async function getLogoBase64(): Promise<string | null> {
  if (logoLoadAttempted) {
    return cachedLogoBase64;
  }
  logoLoadAttempted = true;

  const candidatePaths = [
    path.resolve(process.cwd(), 'seo-assets/favicon.png'),
    path.resolve(process.cwd(), 'public/logo.png'),
    path.resolve(process.cwd(), 'apps/api/public/logo.png'),
    path.resolve(__dirname, '../../../../seo-assets/favicon.png'),
    path.resolve(__dirname, '../../../../public/logo.png'),
    path.resolve(__dirname, '../../../public/logo.png'),
    path.resolve(__dirname, '../../public/logo.png'),
  ];

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        const buf = await sharp(candidate)
          .resize(200, 200, { fit: 'contain' })
          .png()
          .toBuffer();
        cachedLogoBase64 = buf.toString('base64');
        return cachedLogoBase64;
      }
    } catch {
      // Continue to next candidate
    }
  }

  return null;
}

/**
 * Hard-burns a responsive Kosume watermark pill badge onto an image buffer.
 */
export async function applyKosumeWatermark(
  inputBuffer: Buffer,
  options: WatermarkOptions = {},
): Promise<Buffer> {
  try {
    const img = sharp(inputBuffer, { failOn: 'none' }).rotate();
    const meta = await img.metadata();
    if (!meta.width || !meta.height) {
      return inputBuffer;
    }

    const width = meta.width;
    const height = meta.height;

    // Responsive scaling factor based on 1200px baseline
    const scale = Math.max(0.6, Math.min(width / 1200, 2.2));
    const h = Math.round(48 * scale);
    const r = Math.round(h / 2);
    const iconSize = Math.round(36 * scale);
    const padLeft = Math.round(7 * scale);
    const iconGap = Math.round(9 * scale);
    const padRight = Math.round(16 * scale);
    const margin = Math.round(24 * scale);
    const fontBrand = Math.round(15.5 * scale);
    const fontAuthor = Math.round(13.5 * scale);

    let author = (options.authorName || 'Creator').trim();
    if (author.startsWith('@')) {
      author = author.slice(1);
    }
    if (author.length > 22) {
      author = author.slice(0, 20) + '...';
    }

    const brand = options.brandText || 'Kosume';
    const authorText = `@${author}`;

    // Estimated widths for proportional pill sizing
    const brandWidth = Math.round(brand.length * (fontBrand * 0.72));
    const authorWidth = Math.round(authorText.length * (fontAuthor * 0.62));
    const dividerGap = Math.round(10 * scale);

    const brandX = padLeft + iconSize + iconGap;
    const dividerX = brandX + brandWidth + dividerGap;
    const authorX = dividerX + dividerGap;
    const contentWidth = authorX + authorWidth + padRight;
    const badgeWidth = Math.min(
      Math.round(contentWidth),
      Math.round(width * 0.9),
    );

    const textY = Math.round(h * 0.62);
    const iconY = Math.round((h - iconSize) / 2);
    const divY1 = Math.round(h * 0.28);
    const divY2 = Math.round(h * 0.72);

    const logoBase64 = await getLogoBase64();
    const logoElement = logoBase64
      ? `<image href="data:image/png;base64,${logoBase64}" x="${padLeft}" y="${iconY}" width="${iconSize}" height="${iconSize}" />`
      : `<circle cx="${padLeft + iconSize / 2}" cy="${h / 2}" r="${iconSize / 2}" fill="#ec4899" />`;

    const svg = `
    <svg width="${badgeWidth}" height="${h}" viewBox="0 0 ${badgeWidth} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.65"/>
        </filter>
      </defs>
      <g filter="url(#badgeShadow)">
        <rect x="1" y="1" width="${badgeWidth - 2}" height="${h - 2}" rx="${r}" ry="${r}" fill="rgba(15, 17, 23, 0.76)" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2" />
        ${logoElement}
        <text x="${brandX}" y="${textY}" font-family="'Noto Sans', 'DejaVu Sans', 'Liberation Sans', sans-serif" font-size="${fontBrand}" font-weight="700" fill="#ffffff" letter-spacing="0.3">${escapeXml(brand)}</text>
        <line x1="${dividerX}" y1="${divY1}" x2="${dividerX}" y2="${divY2}" stroke="rgba(255, 255, 255, 0.28)" stroke-width="1.2" stroke-linecap="round" />
        <text x="${authorX}" y="${textY}" font-family="'Noto Sans', 'DejaVu Sans', 'Liberation Sans', sans-serif" font-size="${fontAuthor}" font-weight="500" fill="rgba(255, 255, 255, 0.85)">${escapeXml(authorText)}</text>
      </g>
    </svg>
    `;

    const badgeBuffer = Buffer.from(svg);
    const top = Math.max(0, height - h - margin);
    const left = Math.max(0, width - badgeWidth - margin);

    return await img.composite([{ input: badgeBuffer, top, left }]).toBuffer();
  } catch (err) {
    logger.warn(`Failed to burn watermark: ${err?.message || err}`);
    return inputBuffer;
  }
}
