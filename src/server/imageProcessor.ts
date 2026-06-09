import sharp from 'sharp'
import { saveOriginalFile, saveColoringFile } from './storage'

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/** Maps MIME type to the file extension used when saving the original. */
const MIME_TO_EXT: Record<AllowedMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProcessResult {
  /** Absolute path to the saved original file. */
  originalPath: string
  /** Absolute path to the processed coloring-page PNG. */
  coloringPath: string
}

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Validates and processes an uploaded image file into a black-and-white
 * coloring page PNG.
 *
 * Steps:
 *  1. Validate MIME type (must be JPEG, PNG, or WebP).
 *  2. Validate file size (must be ≤ 10 MB).
 *  3. Save the original buffer to `uploads/originals/`.
 *  4. Run the Sharp pipeline: grayscale → normalise → linear contrast boost → PNG.
 *  5. Save the processed buffer to `uploads/coloring/`.
 *  6. Return both absolute paths.
 *
 * Throws a descriptive `Error` on any validation or processing failure.
 * Callers must NOT create database records when this function throws.
 *
 * @param fileBuffer       - Raw bytes of the uploaded file.
 * @param mimeType         - MIME type reported by the client / multipart parser.
 * @param originalFilename - Original filename from the upload (informational only).
 * @param userId           - ID of the uploading user (reserved for future use).
 */
export async function processUploadedImage(
  fileBuffer: Buffer,
  mimeType: string,
  originalFilename: string,
  userId: number, // eslint-disable-line @typescript-eslint/no-unused-vars — reserved for future use
): Promise<ProcessResult> {
  // ── 1. Validate MIME type ──────────────────────────────────────────────────
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new Error(
      `Invalid file type: "${mimeType}". Only JPEG, PNG, and WebP images are accepted.`,
    )
  }

  const ext = MIME_TO_EXT[mimeType as AllowedMimeType]

  // ── 2. Validate file size ──────────────────────────────────────────────────
  if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (fileBuffer.byteLength / (1024 * 1024)).toFixed(2)
    throw new Error(
      `File too large: ${sizeMB} MB. The maximum allowed size is 10 MB.`,
    )
  }

  // ── 3. Save the original file ──────────────────────────────────────────────
  const originalPath = await saveOriginalFile(fileBuffer, ext)

  // ── 4. Sharp conversion pipeline ──────────────────────────────────────────
  // .grayscale()    — convert to greyscale
  // .normalise()    — stretch contrast so darkest pixel → 0, brightest → 255
  // .linear(1.5, -30) — amplify contrast further and darken midtones for bold outlines
  // .png()          — encode as PNG
  let coloringBuffer: Buffer
  try {
    coloringBuffer = await sharp(fileBuffer)
      .grayscale()
      .normalise()
      .linear(1.5, -30)
      .png()
      .toBuffer()
  } catch (err) {
    throw new Error(
      `Image processing failed for "${originalFilename}": ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  // ── 5. Save the coloring-page PNG ─────────────────────────────────────────
  const coloringPath = await saveColoringFile(coloringBuffer)

  // ── 6. Return both paths ──────────────────────────────────────────────────
  return { originalPath, coloringPath }
}
