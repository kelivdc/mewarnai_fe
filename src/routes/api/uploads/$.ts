import { createFileRoute } from '@tanstack/react-router'
import fs from 'fs/promises'
import path from 'path'

// MIME type map for supported image extensions
const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export const Route = createFileRoute('/api/uploads/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        // pathname will be like /api/uploads/originals/abc.png or /api/uploads/coloring/def.png
        const splat = url.pathname.replace(/^\/api\/uploads\//, '')

        // Validate the path only allows originals/ or coloring/ sub-directories
        // to prevent path traversal outside the uploads directory.
        if (!/^(originals|coloring)\/[^/]+$/.test(splat)) {
          return new Response('Not Found', { status: 404 })
        }

        const projectRoot = process.cwd()
        const filePath = path.resolve(projectRoot, 'uploads', splat)

        // Double-check the resolved path stays within uploads/ (defense-in-depth)
        const uploadsDir = path.resolve(projectRoot, 'uploads')
        if (!filePath.startsWith(uploadsDir + path.sep)) {
          return new Response('Forbidden', { status: 403 })
        }

        try {
          const fileBuffer = await fs.readFile(filePath)
          const ext = path.extname(filePath).slice(1).toLowerCase()
          const mimeType = MIME_TYPES[ext] ?? 'application/octet-stream'

          return new Response(fileBuffer, {
            status: 200,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': String(fileBuffer.byteLength),
              // Cache for 1 hour in browser, 10 minutes shared
              'Cache-Control': 'public, max-age=3600, s-maxage=600',
            },
          })
        } catch {
          return new Response('Not Found', { status: 404 })
        }
      },
    },
  },
})
