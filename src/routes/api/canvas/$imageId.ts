import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import { db } from '#/server/db/client'
import { coloringSaves, images } from '#/server/db/schema'
import { resolveUserId } from '#/server/actions/resolve-user'

/**
 * GET /api/canvas/$imageId
 *
 * Serves the saved canvas PNG for a user's colored image.
 * Returns the raw PNG bytes so it can be used directly in an <img> tag.
 *
 * Security: only the image owner can access the canvas data.
 * Returns 404 if no save exists or the user doesn't own the image.
 */
export const Route = createFileRoute('/api/canvas/$imageId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const userId = await resolveUserId()
        if (!userId) {
          return new Response('Unauthorized', { status: 401 })
        }

        const imageId = Number(params.imageId)
        if (isNaN(imageId) || imageId <= 0) {
          return new Response('Invalid image ID', { status: 400 })
        }

        // Verify ownership
        const [image] = await db
          .select({ userId: images.userId })
          .from(images)
          .where(eq(images.id, imageId))
          .limit(1)

        if (!image || image.userId !== userId) {
          return new Response('Not found', { status: 404 })
        }

        // Fetch canvas data
        const [save] = await db
          .select({ canvasData: coloringSaves.canvasData })
          .from(coloringSaves)
          .where(
            and(
              eq(coloringSaves.userId, userId),
              eq(coloringSaves.imageId, imageId),
            ),
          )
          .limit(1)

        if (!save?.canvasData) {
          return new Response('No canvas data', { status: 404 })
        }

        return new Response(save.canvasData, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'private, no-cache, must-revalidate',
          },
        })
      },
    },
  },
})
