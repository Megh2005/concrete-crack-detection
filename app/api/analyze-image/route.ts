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

    const metadata = await sharp(inputBuffer).metadata();
    const origWidth = metadata.width || 800;
    const origHeight = metadata.height || 600;

    const normWidth = 800;
    const normHeight = 600;

    const scaleX = origWidth / normWidth;
    const scaleY = origHeight / normHeight;

    const resizedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(normWidth, normHeight, { fit: 'fill' })
      .toBuffer();

    const { data: rawGray, info } = await sharp(resizedBuffer)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const totalPixels = width * height;

    const { data: contrastGray } = await sharp(resizedBuffer)
      .grayscale()
      .linear(1.4, -30)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const smoothed = new Uint8Array(totalPixels);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += rawGray[(y + dy) * width + (x + dx)];
          }
        }
        smoothed[y * width + x] = Math.round(sum / 9);
      }
    }

    const tileSize = 32;
    const tilesX = Math.ceil(width / tileSize);
    const tilesY = Math.ceil(height / tileSize);
    const tileMeans = new Float32Array(tilesX * tilesY);
    const tileStds = new Float32Array(tilesX * tilesY);

    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        let sum = 0;
        let count = 0;
        const startX = tx * tileSize;
        const endX = Math.min(width, (tx + 1) * tileSize);
        const startY = ty * tileSize;
        const endY = Math.min(height, (ty + 1) * tileSize);

        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            sum += smoothed[y * width + x];
            count++;
          }
        }
        const mean = count > 0 ? sum / count : 128;
        tileMeans[ty * tilesX + tx] = mean;

        let varSum = 0;
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const diff = smoothed[y * width + x] - mean;
            varSum += diff * diff;
          }
        }
        tileStds[ty * tilesX + tx] = Math.sqrt(count > 0 ? varSum / count : 1);
      }
    }

    const getLocalMean = (x: number, y: number) => {
      const tx = Math.min(tilesX - 1, Math.floor(x / tileSize));
      const ty = Math.min(tilesY - 1, Math.floor(y / tileSize));
      return tileMeans[ty * tilesX + tx];
    };

    const getLocalStd = (x: number, y: number) => {
      const tx = Math.min(tilesX - 1, Math.floor(x / tileSize));
      const ty = Math.min(tilesY - 1, Math.floor(y / tileSize));
      return tileStds[ty * tilesX + tx];
    };

    const gradientMag = new Float32Array(totalPixels);
    const candidateMask = new Uint8Array(totalPixels);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        const gx =
          -1 * smoothed[(y - 1) * width + (x - 1)] + 1 * smoothed[(y - 1) * width + (x + 1)] +
          -2 * smoothed[y * width + (x - 1)] + 2 * smoothed[y * width + (x + 1)] +
          -1 * smoothed[(y + 1) * width + (x - 1)] + 1 * smoothed[(y + 1) * width + (x + 1)];

        const gy =
          -1 * smoothed[(y - 1) * width + (x - 1)] - 2 * smoothed[(y - 1) * width + x] - 1 * smoothed[(y - 1) * width + (x + 1)] +
           1 * smoothed[(y + 1) * width + (x - 1)] + 2 * smoothed[(y + 1) * width + x] + 1 * smoothed[(y + 1) * width + (x + 1)];

        const g = Math.sqrt(gx * gx + gy * gy);
        gradientMag[idx] = g;

        const localMean = getLocalMean(x, y);
        const localStd = getLocalStd(x, y);
        const pixelVal = contrastGray[idx];

        const darkness = localMean - pixelVal;
        const relativeDiff = darkness / (localMean + 1);

        const cond1 = pixelVal < localMean - Math.max(12, localStd * 0.85);
        const cond2 = relativeDiff > 0.10;
        const cond3 = g > 15;

        if ((cond1 && cond2) || (cond1 && cond3)) {
          candidateMask[idx] = 1;
        }
      }
    }

    const directionalFiltered = new Uint8Array(totalPixels);
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = y * width + x;
        if (candidateMask[idx] === 0) continue;

        let hCount = 0;
        for (let dx = -2; dx <= 2; dx++) {
          if (candidateMask[y * width + (x + dx)] === 1) hCount++;
        }

        let vCount = 0;
        for (let dy = -2; dy <= 2; dy++) {
          if (candidateMask[(y + dy) * width + x] === 1) vCount++;
        }

        let d1Count = 0;
        for (let d = -2; d <= 2; d++) {
          if (candidateMask[(y + d) * width + (x + d)] === 1) d1Count++;
        }

        let d2Count = 0;
        for (let d = -2; d <= 2; d++) {
          if (candidateMask[(y + d) * width + (x - d)] === 1) d2Count++;
        }

        const maxLine = Math.max(hCount, vCount, d1Count, d2Count);
        if (maxLine >= 3) {
          directionalFiltered[idx] = 1;
        }
      }
    }

    const dilated = new Uint8Array(totalPixels);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let hit = false;
        for (let dy = -1; dy <= 1 && !hit; dy++) {
          for (let dx = -1; dx <= 1 && !hit; dx++) {
            if (directionalFiltered[(y + dy) * width + (x + dx)] === 1) hit = true;
          }
        }
        dilated[y * width + x] = hit ? 1 : 0;
      }
    }

    const cleanedMask = new Uint8Array(totalPixels);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (dilated[idx] === 1) {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dilated[(y + dy) * width + (x + dx)] === 1) count++;
            }
          }
          if (count >= 3) {
            cleanedMask[idx] = 1;
          }
        }
      }
    }

    const labels = new Int32Array(totalPixels);
    let currentLabel = 0;

    interface Component {
      label: number;
      pixels: { x: number; y: number }[];
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      area: number;
      perimeter: number;
      totalDarkness: number;
      totalGradient: number;
      confidence: number;
    }

    const componentsMap: Map<number, Component> = new Map();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (cleanedMask[idx] === 1 && labels[idx] === 0) {
          currentLabel++;
          const pixels: { x: number; y: number }[] = [];
          const queue: number[] = [idx];
          labels[idx] = currentLabel;

          let compMinX = x;
          let compMaxX = x;
          let compMinY = y;
          let compMaxY = y;
          let compPerimeter = 0;
          let compDarkness = 0;
          let compGrad = 0;

          let head = 0;
          while (head < queue.length) {
            const currIdx = queue[head++];
            const cy = Math.floor(currIdx / width);
            const cx = currIdx % width;
            pixels.push({ x: cx, y: cy });

            if (cx < compMinX) compMinX = cx;
            if (cx > compMaxX) compMaxX = cx;
            if (cy < compMinY) compMinY = cy;
            if (cy > compMaxY) compMaxY = cy;

            const localMean = getLocalMean(cx, cy);
            compDarkness += (localMean - rawGray[currIdx]);
            compGrad += gradientMag[currIdx];

            let nNeighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ny = cy + dy;
                const nx = cx + dx;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const nIdx = ny * width + nx;
                  if (cleanedMask[nIdx] === 1) {
                    nNeighbors++;
                    if (labels[nIdx] === 0) {
                      labels[nIdx] = currentLabel;
                      queue.push(nIdx);
                    }
                  }
                }
              }
            }

            if (nNeighbors < 8) {
              compPerimeter++;
            }
          }

          if (pixels.length >= 10) {
            componentsMap.set(currentLabel, {
              label: currentLabel,
              pixels,
              minX: compMinX,
              maxX: compMaxX,
              minY: compMinY,
              maxY: compMaxY,
              area: pixels.length,
              perimeter: compPerimeter,
              totalDarkness: compDarkness,
              totalGradient: compGrad,
              confidence: 0,
            });
          }
        }
      }
    }

    const validComponents: Component[] = [];
    let totalCrackPixels = 0;
    let severeCrackPixels = 0;
    let moderateCrackPixels = 0;
    let shallowCrackPixels = 0;

    const finalMask = new Uint8Array(totalPixels);
    const severityMapData = new Uint8Array(totalPixels);

    for (const comp of Array.from(componentsMap.values())) {
      const bboxW = comp.maxX - comp.minX + 1;
      const bboxH = comp.maxY - comp.minY + 1;
      const bboxDiag = Math.sqrt(bboxW * bboxW + bboxH * bboxH);
      const elongation = bboxDiag > 0 ? (bboxW > bboxH ? bboxW / Math.max(1, bboxH) : bboxH / Math.max(1, bboxW)) : 1;
      const circularity = comp.perimeter > 0 ? (4 * Math.PI * comp.area) / (comp.perimeter * comp.perimeter) : 1;

      if (circularity > 0.70 && comp.area < 40) continue;
      if (elongation < 1.4 && comp.area < 35 && circularity > 0.55) continue;

      let conf = 0;
      if (elongation >= 2.0) conf += 35;
      else if (elongation >= 1.5) conf += 20;

      const avgDarkness = comp.totalDarkness / comp.area;
      if (avgDarkness > 35) conf += 35;
      else if (avgDarkness > 20) conf += 20;

      const avgGrad = comp.totalGradient / comp.area;
      if (avgGrad > 25) conf += 30;
      else if (avgGrad > 15) conf += 15;

      comp.confidence = Math.min(98, Math.max(45, conf));
      validComponents.push(comp);

      for (const p of comp.pixels) {
        const pIdx = p.y * width + p.x;
        finalMask[pIdx] = 1;
        totalCrackPixels++;

        const pDarkness = getLocalMean(p.x, p.y) - rawGray[pIdx];
        const pGrad = gradientMag[pIdx];

        if (pDarkness >= 65 && pGrad >= 35) {
          severityMapData[pIdx] = 3;
          severeCrackPixels++;
        } else if (pDarkness >= 38 && pGrad >= 25) {
          severityMapData[pIdx] = 2;
          moderateCrackPixels++;
        } else {
          severityMapData[pIdx] = 1;
          shallowCrackPixels++;
        }
      }
    }

    const hasCrack = totalCrackPixels > 25 && validComponents.length > 0;
    const rawCrackRatio = (totalCrackPixels / totalPixels);

    let globalMinX = width;
    let globalMaxX = 0;
    let globalMinY = height;
    let globalMaxY = 0;

    if (hasCrack) {
      for (const comp of validComponents) {
        if (comp.minX < globalMinX) globalMinX = comp.minX;
        if (comp.maxX > globalMaxX) globalMaxX = comp.maxX;
        if (comp.minY < globalMinY) globalMinY = comp.minY;
        if (comp.maxY > globalMaxY) globalMaxY = comp.maxY;
      }
    }

    const bboxW = Math.max(10, globalMaxX - globalMinX);
    const bboxH = Math.max(10, globalMaxY - globalMinY);
    const bboxArea = bboxW * bboxH;
    const regionalDamageRatio = bboxArea > 0 ? (totalCrackPixels / bboxArea) * 100 : 0;

    const surfaceDamagePercentage = hasCrack
      ? Math.min(100, Math.max(0.1, regionalDamageRatio * 0.80 + rawCrackRatio * 200))
      : 0;

    let overallSeverity = 'Intact (No Crack)';
    let maxCrackWidthVal = 0;

    if (hasCrack) {
      for (const comp of validComponents) {
        const cW = comp.maxX - comp.minX + 1;
        const cH = comp.maxY - comp.minY + 1;
        const cLen = Math.sqrt(cW * cW + cH * cH);
        const cWidth = cLen > 0 ? comp.area / cLen : 1;
        if (cWidth > maxCrackWidthVal) maxCrackWidthVal = cWidth;
      }
    }

    const calcWidthMmVal = hasCrack
      ? (0.04 + maxCrackWidthVal * 0.04).toFixed(2)
      : '0.00';
    const numericWidthMm = parseFloat(calcWidthMmVal);

    if (hasCrack) {
      const severeRatio = severeCrackPixels / totalCrackPixels;
      const moderateRatio = moderateCrackPixels / totalCrackPixels;
      const shallowRatio = shallowCrackPixels / totalCrackPixels;

      if (severeRatio >= 0.30 && numericWidthMm >= 0.28) {
        overallSeverity = 'Severe Deep Structural';
      } else if (moderateRatio >= 0.35 || numericWidthMm >= 0.16) {
        overallSeverity = 'Moderate Crack';
      } else {
        overallSeverity = 'Shallow Micro-crack';
      }
    }

    let faultRegime = 'Intact Structure (Zero Defects)';
    if (hasCrack) {
      const aspect = bboxW > 0 ? bboxH / bboxW : 1;
      if (aspect > 1.6) {
        faultRegime = 'Flexural Crack Regime (Mid-span Bending)';
      } else if (aspect < 0.6) {
        faultRegime = 'Shear Crack Regime (Diagonal Support Stress)';
      } else if (surfaceDamagePercentage > 20.0) {
        faultRegime = 'Rebar Corrosion Spalling Regime (Expansive Rust)';
      } else {
        faultRegime = 'Shrinkage Micro-crack Regime (Early Curing Evaporation)';
      }
    }

    const overlayRects: string[] = [`<rect width="100%" height="100%" fill="#10b981" opacity="0.08"/>`];
    const maskRects: string[] = [];
    const step = 2;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = y * width + x;
        const sVal = severityMapData[idx];

        if (sVal === 3) {
          overlayRects.push(`<rect x="${x}" y="${y}" width="${step + 0.4}" height="${step + 0.4}" fill="#dc2626" opacity="0.95"/>`);
          maskRects.push(`<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="#dc2626"/>`);
        } else if (sVal === 2) {
          overlayRects.push(`<rect x="${x}" y="${y}" width="${step + 0.4}" height="${step + 0.4}" fill="#f59e0b" opacity="0.92"/>`);
          maskRects.push(`<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="#f59e0b"/>`);
        } else if (sVal === 1) {
          overlayRects.push(`<rect x="${x}" y="${y}" width="${step + 0.4}" height="${step + 0.4}" fill="#06b6d4" opacity="0.90"/>`);
          maskRects.push(`<rect x="${x}" y="${y}" width="${step}" height="${step}" fill="#06b6d4"/>`);
        }
      }
    }

    const overlaySvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${overlayRects.join('')}</svg>`;
    const maskSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#022c22"/>${maskRects.join('')}</svg>`;

    const processedBuffer = await sharp(resizedBuffer)
      .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
      .png({ compressionLevel: 6 })
      .toBuffer();

    const maskBuffer = await sharp(Buffer.from(maskSvg))
      .png({ compressionLevel: 6 })
      .toBuffer();

    const grayBuffer = await sharp(contrastGray, { raw: { width, height, channels: 1 } })
      .png({ compressionLevel: 6 })
      .toBuffer();

    const avgConfidenceScore = validComponents.length > 0
      ? Math.round(validComponents.reduce((acc, c) => acc + c.confidence, 0) / validComponents.length)
      : 0;

    return NextResponse.json({
      success: true,
      processedImage: `data:image/png;base64,${processedBuffer.toString('base64')}`,
      binaryMask: `data:image/png;base64,${maskBuffer.toString('base64')}`,
      grayscaleImage: `data:image/png;base64,${grayBuffer.toString('base64')}`,
      hasCrack,
      deepCrackCount: severeCrackPixels,
      shallowCrackCount: shallowCrackPixels + moderateCrackPixels,
      crackAreaRatio: (hasCrack ? surfaceDamagePercentage.toFixed(2) : '0.00') + '%',
      maxCrackWidth: calcWidthMmVal + ' mm',
      crackDensity: (hasCrack ? (surfaceDamagePercentage * 0.05).toFixed(2) : '0.00') + ' mm/mm²',
      crackSeverity: overallSeverity,
      faultRegime,
      confidenceScore: avgConfidenceScore + '%',
      detectedComponentsCount: validComponents.length,
      disclaimer: 'Visual crack depth and severity metrics are calculated via multi-criteria pixel darkness, local contrast, and boundary morphological metrics. Calibrated NDT or ultrasonic sensors are required for absolute internal depth measurements.',
      componentsSummary: validComponents.slice(0, 5).map(c => ({
        id: c.label,
        areaPixels: c.area,
        perimeterPixels: c.perimeter,
        confidence: c.confidence + '%',
        boundingBox: {
          origX: Math.round(c.minX * scaleX),
          origY: Math.round(c.minY * scaleY),
          origWidth: Math.round((c.maxX - c.minX + 1) * scaleX),
          origHeight: Math.round((c.maxY - c.minY + 1) * scaleY),
        }
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process concrete image' },
      { status: 500 }
    );
  }
}
