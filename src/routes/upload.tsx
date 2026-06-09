// src/routes/upload.tsx
// Image upload page — allows authenticated users to upload coloring images.
// Requirements: 3.1–3.4, 3.7, 3.8, 8.1, 8.5, 8.6

import { createFileRoute } from '@tanstack/react-router'
import { ImagePlus } from 'lucide-react'

import { requireAuth } from '../lib/authGuard'
import { ImageUploadForm } from '../components/ImageUploadForm'

export const Route = createFileRoute('/upload')({
  beforeLoad: ({ context, location }) => requireAuth({ context, location }),
  component: UploadPage,
})

function UploadPage() {
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-green/10 mb-4">
            <ImagePlus size={36} className="text-brand-green" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            🖼️ Upload Image
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-sm mx-auto">
            Choose a picture to turn into a coloring page. Supported formats: JPEG, PNG, and WebP (max 10 MB).
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8">
          <ImageUploadForm />
        </div>
      </div>
    </div>
  )
}
