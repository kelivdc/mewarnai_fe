// src/server/actions/images.ts
// TanStack Start server functions for image data fetching and management.
// Requirements: 3.1, 3.6–3.8, 4.1–4.5, 7.1, 7.3, 7.4

import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { and, desc, eq } from 'drizzle-orm'

import { db } from '../db/client'
import { images, coloringSaves } from '../db/schema'
import { validateSession } from '../auth'
import { processUploadedImage } from '../imageProcessor'
import { deleteFiles } from '../storage'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UploadImageResult =
  | { success: true; imageId: number }
  | { success: false; error: string }

export type DeleteImageResult =
  | { success: true }
  | { success: false; error: string; status?: number }

export interface GalleryImage {
  id: number
  userId: string
  originalPath: string
  coloringPath: string
  filename: string
  uploadedAt: Date
  /** True when the current user has a coloring save for this image. */
  hasSave: boolean
}

// ---------------------------------------------------------------------------
// getImagesQuery
// Returns all images joined with coloring_saves for the current user.
// Each image includes a `hasSave` boolean indicating saved progress.
// Requirements: 4.1, 4.2, 4.3
// ---------------------------------------------------------------------------

export const getImagesQuery = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GalleryImage[]> => {
    // Resolve current user from session cookie
    const token = getCookie('session')
    const userId = token ? await validateSession(token) : null

    // Fetch all images left-joined with the current user's coloring saves.
    // When no user is authenticated we still join on imageId but filter to a
    // non-existent userId so the left join never finds a matching save row.
    const joinCondition = and(
      eq(coloringSaves.imageId, images.id),
      eq(coloringSaves.userId, userId ?? ''),
    )

    const rows = await db
      .select({
        id: images.id,
        userId: images.userId,
        originalPath: images.originalPath,
        coloringPath: images.coloringPath,
        filename: images.filename,
        uploadedAt: images.uploadedAt,
        saveId: coloringSaves.id,
      })
      .from(images)
      .leftJoin(coloringSaves, joinCondition)
      .orderBy(images.uploadedAt)

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      originalPath: row.originalPath,
      coloringPath: row.coloringPath,
      filename: row.filename,
      uploadedAt: row.uploadedAt,
      hasSave: row.saveId != null,
    }))
  },
)

// ---------------------------------------------------------------------------
// uploadImageAction
// Handles multipart/form-data image upload:
//  1. Validates session — must be authenticated.
//  2. Extracts the file from FormData.
//  3. Calls processUploadedImage to convert it to a B&W coloring page.
//  4. On success, inserts a record into the images table.
//  5. On processor error, does NOT create a DB record.
// Requirements: 3.1, 3.6, 3.7, 3.8
// ---------------------------------------------------------------------------

export const uploadImageAction = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data }): Promise<UploadImageResult> => {
    // ── 1. Authenticate ──────────────────────────────────────────────────────
    const token = getCookie('session')
    if (!token) {
      return { success: false, error: 'You must be logged in to upload images.' }
    }

    const userId = await validateSession(token)
    if (!userId) {
      return { success: false, error: 'Your session has expired. Please log in again.' }
    }

    // ── 2. Extract file from FormData ────────────────────────────────────────
    const file = data.get('file')

    if (!file || !(file instanceof File)) {
      return { success: false, error: 'No file was provided in the upload request.' }
    }

    // ── 3. Convert File to Buffer for the image processor ───────────────────
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)
    const mimeType = file.type
    const originalFilename = file.name

    // ── 4. Process the image (validate, convert to B&W coloring page) ────────
    // processUploadedImage throws on validation failures or processing errors.
    // When it throws we must NOT create a DB record (Requirement 3.8).
    let processResult: Awaited<ReturnType<typeof processUploadedImage>>
    try {
      processResult = await processUploadedImage(fileBuffer, mimeType, originalFilename, userId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image processing failed.'
      return { success: false, error: message }
    }

    // ── 5. Persist image record in the database ───────────────────────────────
    try {
      const [inserted] = await db
        .insert(images)
        .values({
          userId,
          originalPath: processResult.originalPath,
          coloringPath: processResult.coloringPath,
          filename: originalFilename,
          uploadedAt: new Date(),
        })
        .returning({ id: images.id })

      return { success: true, imageId: inserted.id }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save image record.'
      return { success: false, error: message }
    }
  })

// ---------------------------------------------------------------------------
// getUserImagesQuery
// Returns all images uploaded by the currently authenticated user, ordered
// by uploadedAt descending (most recent first).
// Requirements: 7.1
// ---------------------------------------------------------------------------

export const getUserImagesQuery = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GalleryImage[]> => {
    // ── 1. Authenticate ──────────────────────────────────────────────────────
    const token = getCookie('session')
    if (!token) {
      return []
    }

    const userId = await validateSession(token)
    if (!userId) {
      return []
    }

    // ── 2. Query images for this user only ───────────────────────────────────
    const rows = await db
      .select({
        id: images.id,
        userId: images.userId,
        originalPath: images.originalPath,
        coloringPath: images.coloringPath,
        filename: images.filename,
        uploadedAt: images.uploadedAt,
        saveId: coloringSaves.id,
      })
      .from(images)
      .leftJoin(
        coloringSaves,
        and(
          eq(coloringSaves.imageId, images.id),
          eq(coloringSaves.userId, userId),
        ),
      )
      .where(eq(images.userId, userId))
      .orderBy(desc(images.uploadedAt))

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      originalPath: row.originalPath,
      coloringPath: row.coloringPath,
      filename: row.filename,
      uploadedAt: row.uploadedAt,
      hasSave: row.saveId != null,
    }))
  },
)

// ---------------------------------------------------------------------------
// deleteImageAction
// Deletes an image owned by the authenticated user.
//  1. Validates session.
//  2. Fetches the image record — returns 404-style error if not found.
//  3. Verifies ownership — returns 403-style error if user is not the owner.
//  4. Deletes both files from the filesystem via deleteFiles.
//  5. Deletes the DB record (CASCADE removes coloring_saves automatically).
// Requirements: 7.3, 7.4
// ---------------------------------------------------------------------------

export const deleteImageAction = createServerFn({ method: 'POST' })
  .validator((data: { imageId: number }) => data)
  .handler(async ({ data }): Promise<DeleteImageResult> => {
    // ── 1. Authenticate ──────────────────────────────────────────────────────
    const token = getCookie('session')
    if (!token) {
      return { success: false, error: 'You must be logged in to delete images.', status: 401 }
    }

    const userId = await validateSession(token)
    if (!userId) {
      return { success: false, error: 'Your session has expired. Please log in again.', status: 401 }
    }

    // ── 2. Fetch the image record ────────────────────────────────────────────
    const [image] = await db
      .select({
        id: images.id,
        userId: images.userId,
        originalPath: images.originalPath,
        coloringPath: images.coloringPath,
      })
      .from(images)
      .where(eq(images.id, data.imageId))
      .limit(1)

    if (!image) {
      return { success: false, error: 'Image not found.', status: 404 }
    }

    // ── 3. Verify ownership ──────────────────────────────────────────────────
    // Requirement 7.4: return 403 if the requesting user does not own the image.
    if (image.userId !== userId) {
      return { success: false, error: 'You are not authorized to delete this image.', status: 403 }
    }

    // ── 4. Delete files from filesystem ─────────────────────────────────────
    // deleteFiles silently ignores missing files, so partial uploads are safe.
    await deleteFiles(image.originalPath, image.coloringPath)

    // ── 5. Delete DB record (CASCADE removes coloring_saves) ─────────────────
    await db.delete(images).where(eq(images.id, data.imageId))

    return { success: true }
  })
