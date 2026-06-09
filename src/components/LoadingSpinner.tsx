// src/components/LoadingSpinner.tsx
// Reusable loading spinner component with a 500ms delay to prevent flash on
// fast operations (req 8.6). Supports full-screen overlay and inline variants.

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoadingSpinnerProps {
  /** Whether the loading state is active. Timer starts when this turns true. */
  isLoading: boolean
  /** Optional message shown below the spinner. */
  message?: string
  /**
   * When true (default) renders a fixed full-screen overlay with backdrop blur.
   * When false renders a compact inline spinner.
   */
  fullscreen?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * LoadingSpinner — shows a spinner only after 500ms of continuous loading,
 * avoiding a visual flash for operations that complete quickly.
 *
 * Requirements: 8.6
 */
export function LoadingSpinner({
  isLoading,
  message,
  fullscreen = true,
}: LoadingSpinnerProps) {
  // We only reveal the spinner after the 500ms delay has elapsed
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isLoading) {
      // Start the 500ms delay timer
      timerRef.current = setTimeout(() => setVisible(true), 500)
    } else {
      // Hide immediately when loading finishes
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setVisible(false)
    }

    // Cleanup on unmount or when isLoading changes before timer fires
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isLoading])

  if (!visible) return null

  // -------------------------------------------------------------------------
  // Full-screen overlay variant
  // -------------------------------------------------------------------------
  if (fullscreen) {
    return (
      <div
        role="status"
        aria-label={message ?? 'Memuat…'}
        aria-live="polite"
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={56}
            aria-hidden="true"
            className="text-brand-orange animate-spin"
          />
          <p className="text-lg font-semibold text-brand-orange">
            {message ?? 'Memuat…'}
          </p>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Inline variant
  // -------------------------------------------------------------------------
  return (
    <span
      role="status"
      aria-label={message ?? 'Memuat…'}
      aria-live="polite"
      className="inline-flex items-center gap-2 text-base font-semibold text-brand-orange"
    >
      <Loader2
        size={20}
        aria-hidden="true"
        className="animate-spin"
      />
      {message && <span>{message}</span>}
    </span>
  )
}
