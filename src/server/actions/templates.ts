// src/server/actions/templates.ts
// Server action for claiming a template from Explore as a saved user image.
// Creates an images record pointing to the template SVG so it shows up
// in "My Images" and supports coloring save/load like uploaded images.

import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { images, coloringSaves } from '../db/schema'
import { resolveUserId } from './resolve-user'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SaveTemplateInput {
  /** Template SVG path (e.g. /templates/cat.svg) */
  templateSrc: string
  /** Display name (e.g. "Cute Cat") */
  templateName: string
  /** Canvas PNG blob serialized as number[] */
  canvasBlob: number[]
}

export type SaveTemplateResult =
  | { success: true; imageId: number }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// saveTemplateColoringAction
// ---------------------------------------------------------------------------

/**
 * Saves a template coloring as a user image.
 *
 * 1. Authenticates the user.
 * 2. Creates an `images` record pointing to the template SVG.
 * 3. Saves the canvas PNG blob to `coloring_saves`.
 *
 * After this call the template appears in "My Images" and supports
 * the same save/load flow as uploaded images.
 */
export const saveTemplateColoringAction = createServerFn({ method: 'POST' })
  .validator((data: SaveTemplateInput) => data)
  .handler(async ({ data }): Promise<SaveTemplateResult> => {
    // ── 1. Authenticate ───────────────────────────────────────────────────
    const userId = await resolveUserId()
    if (!userId) {
      return { success: false, error: 'You must be logged in to save.' }
    }

    // ── 2. Create images record ───────────────────────────────────────────
    // Both originalPath and coloringPath point to the template SVG.
    // The canvas PNG blob captures the user's coloring work.
    const now = new Date()
    const canvasBuffer = Buffer.from(data.canvasBlob)

    try {
      const [inserted] = await db
        .insert(images)
        .values({
          userId,
          originalPath: data.templateSrc,
          coloringPath: data.templateSrc,
          filename: data.templateName,
          uploadedAt: now,
        })
        .returning({ id: images.id })

      // ── 3. Save canvas blob ────────────────────────────────────────────
      await db.insert(coloringSaves).values({
        userId,
        imageId: inserted.id,
        canvasData: canvasBuffer,
        savedAt: now,
      })

      return { success: true, imageId: inserted.id }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save template.'
      return { success: false, error: message }
    }
  })
