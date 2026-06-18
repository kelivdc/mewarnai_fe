// src/server/actions/coloring.ts
// TanStack Start server functions for coloring progress save and retrieval.
// Requirements: 6.2, 6.3, 6.4

import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'

import { db } from '../db/client'
import { coloringSaves } from '../db/schema'
import { resolveUserId } from './resolve-user'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SaveColoringInput {
  imageId: number
  /** PNG blob serialized as an array of byte values (number[]) */
  canvasBlob: number[]
}

export type SaveColoringResult =
  | { success: true }
  | { success: false; error: string }

export type GetColoringSaveResult =
  | { canvasData: number[] }
  | null

// ---------------------------------------------------------------------------
// saveColoringAction
// Upserts a coloring_saves record for the authenticated user and given imageId.
// If a save already exists, it is overwritten (Requirement 6.3).
// If no save exists, a new record is created (Requirement 6.2).
//
// Input: { imageId: number, canvasBlob: number[] }
// Requirements: 6.2, 6.3
// ---------------------------------------------------------------------------

export const saveColoringAction = createServerFn({ method: 'POST' })
  .validator((data: SaveColoringInput) => data)
  .handler(async ({ data }): Promise<SaveColoringResult> => {
    // ── 1. Authenticate (supports custom + OAuth sessions) ──────────────────
    const userId = await resolveUserId()
    if (!userId) {
      return { success: false, error: 'You must be logged in to save progress.' }
    }

    // ── 2. Convert number[] back to Buffer ───────────────────────────────────
    const canvasBuffer = Buffer.from(data.canvasBlob)
    const now = new Date()

    // ── 3. Upsert: update if exists, insert if not ───────────────────────────
    // The coloring_saves table does not have a unique constraint on (userId, imageId)
    // at the DB level, so we check for an existing row first and update or insert.
    try {
      const [existing] = await db
        .select({ id: coloringSaves.id })
        .from(coloringSaves)
        .where(
          and(
            eq(coloringSaves.userId, userId),
            eq(coloringSaves.imageId, data.imageId),
          ),
        )
        .limit(1)

      if (existing) {
        // Update the existing save record
        await db
          .update(coloringSaves)
          .set({ canvasData: canvasBuffer, savedAt: now })
          .where(eq(coloringSaves.id, existing.id))
      } else {
        // Insert a new save record
        await db.insert(coloringSaves).values({
          userId,
          imageId: data.imageId,
          canvasData: canvasBuffer,
          savedAt: now,
        })
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save coloring progress.'
      return { success: false, error: message }
    }
  })

// ---------------------------------------------------------------------------
// getColoringSaveQuery
// Fetches the saved canvas blob for the authenticated user and given imageId.
// Returns { canvasData: number[] } if a save exists, or null if none.
// Requirements: 6.4
// ---------------------------------------------------------------------------

export const getColoringSaveQuery = createServerFn({ method: 'GET' })
  .validator((data: { imageId: number }) => data)
  .handler(async ({ data }): Promise<GetColoringSaveResult> => {
    // ── 1. Authenticate (supports custom + OAuth sessions) ──────────────────
    const userId = await resolveUserId()
    if (!userId) {
      return null
    }

    // ── 2. Fetch save record ─────────────────────────────────────────────────
    const [save] = await db
      .select({ canvasData: coloringSaves.canvasData })
      .from(coloringSaves)
      .where(
        and(
          eq(coloringSaves.userId, userId),
          eq(coloringSaves.imageId, data.imageId),
        ),
      )
      .limit(1)

    if (!save) {
      return null
    }

    // ── 3. Convert Buffer to number[] for serialization over the wire ────────
    // canvasData is returned as a Buffer (pg bytea). We convert to a plain
    // number[] so it can be JSON-serialized in the server function response.
    const canvasDataArray = Array.from(save.canvasData)

    return { canvasData: canvasDataArray }
  })
