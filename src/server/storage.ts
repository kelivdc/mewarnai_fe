import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Resolve upload directories relative to the project root (where the process runs from)
const PROJECT_ROOT = process.cwd()
const ORIGINALS_DIR = path.resolve(PROJECT_ROOT, 'uploads', 'originals')
const COLORING_DIR = path.resolve(PROJECT_ROOT, 'uploads', 'coloring')

/**
 * Ensures that the upload directories exist.
 * Safe to call multiple times — uses `recursive: true` so it won't fail if they already exist.
 */
export async function ensureUploadDirs(): Promise<void> {
  await Promise.all([
    fs.mkdir(ORIGINALS_DIR, { recursive: true }),
    fs.mkdir(COLORING_DIR, { recursive: true }),
  ])
}

/**
 * Saves a raw file buffer to the originals directory.
 *
 * @param buffer - The file content as a Buffer
 * @param ext    - File extension without the leading dot, e.g. "jpg", "png", "webp"
 * @returns      The full absolute path of the saved file
 */
export async function saveOriginalFile(buffer: Buffer, ext: string): Promise<string> {
  await ensureUploadDirs()
  const filename = `${uuidv4()}.${ext}`
  const filePath = path.resolve(ORIGINALS_DIR, filename)
  await fs.writeFile(filePath, buffer)
  return filePath
}

/**
 * Saves a processed coloring-page buffer (PNG) to the coloring directory.
 *
 * @param buffer - The PNG content as a Buffer
 * @returns      The full absolute path of the saved file
 */
export async function saveColoringFile(buffer: Buffer): Promise<string> {
  await ensureUploadDirs()
  const filename = `${uuidv4()}.png`
  const filePath = path.resolve(COLORING_DIR, filename)
  await fs.writeFile(filePath, buffer)
  return filePath
}

/**
 * Deletes the original and coloring files from the filesystem.
 * Silently ignores missing files so that a partially-created upload can still be cleaned up.
 *
 * @param originalPath  - Absolute path to the original file
 * @param coloringPath  - Absolute path to the coloring-page PNG
 */
export async function deleteFiles(originalPath: string, coloringPath: string): Promise<void> {
  await Promise.all([
    fs.unlink(originalPath).catch(() => {
      // File may not exist — ignore ENOENT and other errors
    }),
    fs.unlink(coloringPath).catch(() => {
      // File may not exist — ignore ENOENT and other errors
    }),
  ])
}
