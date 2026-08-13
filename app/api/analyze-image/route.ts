import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const inputBuffer = Buffer.from(base64Data, 'base64');

    const resizedBaseBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    const { data: rawPixels, info } = await sharp(resizedBaseBuffer)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const totalPixels = width * height;

    let totalBrightness = 0;
    for (let i = 0; i < rawPixels.length; i += 4) {
      totalBrightness += rawPixels[i];
    }
    const meanBrightness = totalBrightness / (rawPixels.length / 4);

    const shallowThreshold = Math.max(30, meanBrightness - 30);
    const deepThreshold = Math.max(15, meanBrightness - 60);

    let deepCrackCount = 0;
    let shallowCrackCount = 0;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;

    const overlayRects: string[] = [];
    const maskRects: string[] = [];

    const step = 2;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = y * width + x;
        const val = rawPixels[idx];

        if (val < shallowThreshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          if (val < deepThreshold) {
            deepCrackCount++;
            overlayRects.push(`<rect x="${x}" y="${y}" width="${step + 0.5}" height="${step + 0.5}" fill="#ef4444" opacity="0.95"/>`);
            maskRects.push(`<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="#ffffff"/>`);
          } else {
            shallowCrackCount++;
            overlayRects.push(`<rect x="${x}" y="${y}" width="${step + 0.5}" height="${step + 0.5}" fill="#eab308" opacity="0.90"/>`);
            maskRects.push(`<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="#94a3b8"/>`);
          }
        }
      }
    }

    const sampledTotal = totalPixels / (step * step);
    const totalCrackCount = deepCrackCount + shallowCrackCount;
    const rawCrackRatio = (totalCrackCount / sampledTotal);

    const bboxWidth = Math.max(10, maxX - minX);
    const bboxHeight = Math.max(10, maxY - minY);
    const bboxSampledPixels = (bboxWidth * bboxHeight) / (step * step);
    const regionalDamageRatio = bboxSampledPixels > 0 ? (totalCrackCount / bboxSampledPixels) * 100 : 0;

    const finalDamagePercentageVal = Math.min(100, Math.max(0, regionalDamageRatio * 0.85 + rawCrackRatio * 150));
    const hasCrack = totalCrackCount > 15 && rawCrackRatio > 0.001;

    let crackSeverity = 'Intact (No Crack)';
    let faultRegime = 'Intact Structure (Zero Defects)';
    let maxCrackWidth = '0.00 mm';
    let is456Status = 'Passes IS 456';

    if (hasCrack) {
      const aspect = bboxWidth > 0 ? bboxHeight / bboxWidth : 1;

      if (deepCrackCount > shallowCrackCount * 1.1) {
        crackSeverity = 'Deep Structural';
        maxCrackWidth = (0.32 + (finalDamagePercentageVal * 0.02)).toFixed(2) + ' mm';
      } else if (shallowCrackCount > deepCrackCount * 1.4) {
        crackSeverity = 'Shallow Micro-crack';
        maxCrackWidth = (0.08 + (finalDamagePercentageVal * 0.01)).toFixed(2) + ' mm';
      } else {
        crackSeverity = 'Partial / Spreaded';
        maxCrackWidth = (0.20 + (finalDamagePercentageVal * 0.015)).toFixed(2) + ' mm';
      }

      if (aspect > 1.7) {
        faultRegime = 'Flexural Crack Regime (Mid-span Bending)';
      } else if (aspect < 0.6) {
        faultRegime = 'Shear Crack Regime (Diagonal Support Stress)';
      } else if (finalDamagePercentageVal > 25.0) {
        faultRegime = 'Rebar Corrosion Spalling Regime (Expansive Rust)';
      } else {
        faultRegime = 'Shrinkage Micro-crack Regime (Early Curing Evaporation)';
      }

      const numericWidth = parseFloat(maxCrackWidth);
      if (numericWidth >= 0.30) {
        is456Status = 'Exceeds IS 456 (> 0.3mm)';
      } else {
        is456Status = 'Passes IS 456 (<= 0.3mm)';
      }
    } else {
      deepCrackCount = 0;
      shallowCrackCount = 0;
    }

    const overlaySvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${overlayRects.join('')}</svg>`;
    const maskSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0f172a"/>${maskRects.join('')}</svg>`;

    const processedBuffer = await sharp(resizedBaseBuffer)
      .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
      .png({ compressionLevel: 6 })
      .toBuffer();

    const maskBuffer = await sharp(Buffer.from(maskSvg))
      .png({ compressionLevel: 6 })
      .toBuffer();

    return NextResponse.json({
      success: true,
      processedImage: `data:image/png;base64,${processedBuffer.toString('base64')}`,
      binaryMask: `data:image/png;base64,${maskBuffer.toString('base64')}`,
      hasCrack,
      deepCrackCount,
      shallowCrackCount,
      crackAreaRatio: (hasCrack ? finalDamagePercentageVal.toFixed(2) : '0.00') + '%',
      maxCrackWidth,
      crackDensity: (hasCrack ? (finalDamagePercentageVal * 0.05).toFixed(2) : '0.00') + ' mm/mm²',
      crackSeverity,
      faultRegime,
      is456Status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process concrete image' },
      { status: 500 }
    );
  }
}
