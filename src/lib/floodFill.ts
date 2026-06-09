/**
 * Flood fill using iterative BFS (breadth-first search) to avoid stack overflow
 * on large images. Treats pixels with brightness below the outline threshold as
 * impassable boundaries.
 *
 * Brightness formula: 0.299*R + 0.587*G + 0.114*B
 */

function getBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function colorsMatch(
  data: Uint8ClampedArray,
  index: number,
  r: number,
  g: number,
  b: number,
): boolean {
  return data[index] === r && data[index + 1] === g && data[index + 2] === b
}

/**
 * Flood fill an ImageData buffer in-place using iterative BFS.
 *
 * @param imageData       - The ImageData object to modify
 * @param startX          - X coordinate of the click point
 * @param startY          - Y coordinate of the click point
 * @param fillColor       - RGB tuple to fill with, e.g. [255, 0, 0]
 * @param outlineThreshold - Pixels with brightness below this value are treated
 *                           as outline boundaries and will not be painted
 *                           (default: 80)
 * @returns The (mutated) ImageData
 */
export function floodFill(
  imageData: ImageData,
  startX: number,
  startY: number,
  fillColor: [number, number, number],
  outlineThreshold: number = 80,
): ImageData {
  const { data, width, height } = imageData

  // Clamp start coords to valid range
  const sx = Math.floor(startX)
  const sy = Math.floor(startY)

  if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
    return imageData
  }

  const startIndex = (sy * width + sx) * 4
  const targetR = data[startIndex]
  const targetG = data[startIndex + 1]
  const targetB = data[startIndex + 2]

  // Abort if the click landed on an outline pixel
  if (getBrightness(targetR, targetG, targetB) < outlineThreshold) {
    return imageData
  }

  const [fillR, fillG, fillB] = fillColor

  // Abort if the target pixel is already the fill color
  if (targetR === fillR && targetG === fillG && targetB === fillB) {
    return imageData
  }

  // BFS queue: store pixel indices (flat index = (y * width + x) * 4) divided by 4
  // to reduce memory — multiply back by 4 when indexing into data.
  const queue: number[] = []

  // Visited set to avoid re-queuing pixels
  const visited = new Uint8Array(width * height)

  const startPixel = sy * width + sx
  queue.push(startPixel)
  visited[startPixel] = 1

  let head = 0 // Queue head pointer — avoids O(n) shift() calls

  while (head < queue.length) {
    const pixel = queue[head++]
    const x = pixel % width
    const y = (pixel - x) / width
    const idx = pixel * 4

    // Paint this pixel
    data[idx] = fillR
    data[idx + 1] = fillG
    data[idx + 2] = fillB
    // Leave alpha (data[idx + 3]) untouched

    // Check 4-directional neighbors: up, down, left, right
    const neighbors: [number, number][] = [
      [x, y - 1],
      [x, y + 1],
      [x - 1, y],
      [x + 1, y],
    ]

    for (const [nx, ny] of neighbors) {
      // Skip out-of-bounds
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

      const neighborPixel = ny * width + nx

      // Skip already visited
      if (visited[neighborPixel]) continue

      const nIdx = neighborPixel * 4
      const nr = data[nIdx]
      const ng = data[nIdx + 1]
      const nb = data[nIdx + 2]

      // Skip outline pixels (dark boundaries)
      if (getBrightness(nr, ng, nb) < outlineThreshold) continue

      // Skip pixels that don't match the target color
      if (!colorsMatch(data, nIdx, targetR, targetG, targetB)) continue

      visited[neighborPixel] = 1
      queue.push(neighborPixel)
    }
  }

  return imageData
}
