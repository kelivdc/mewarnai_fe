// src/routes/success.tsx
// Generic post-action success page — immediately redirects to /explore.
// Useful as a Better Auth callbackURL or after any flow that needs a landing-then-redirect.

import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/success')({
  component: SuccessPage,
})

function SuccessPage() {
  useEffect(() => {
    window.location.replace('/explore')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
        <p className="text-lg font-bold text-slate-600">Mengalihkan…</p>
      </div>
    </div>
  )
}
