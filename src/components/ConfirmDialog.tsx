// src/components/ConfirmDialog.tsx
// Accessible confirmation dialog with kid-friendly UI.
// Requirements: 7.2, 8.1, 8.2, 8.5

import { Dialog } from 'radix-ui'
import { Trash2, X, Loader2 } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { Button } from '#/components/ui/button.tsx'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ConfirmDialogProps {
  /** Controls dialog visibility */
  isOpen: boolean
  /** Dialog heading */
  title: string
  /** Body message explaining the action */
  message: string
  /** Called when user confirms the action */
  onConfirm: () => void
  /** Called when user cancels or closes the dialog */
  onCancel: () => void
  /** Label for the confirm button (default: "Hapus") */
  confirmLabel?: string
  /** Label for the cancel button (default: "Batal") */
  cancelLabel?: string
  /** When true, confirm button shows a spinner and is disabled */
  isLoading?: boolean
}

// ---------------------------------------------------------------------------
// ConfirmDialog
// ---------------------------------------------------------------------------

/**
 * Modal dialog asking the user to confirm a destructive action.
 *
 * Accessibility:
 * - Rendered via Radix Dialog — provides aria-modal, focus trap, and Escape-key handling.
 * - Title linked to dialog via `Dialog.Title`.
 * - Description linked via `Dialog.Description`.
 * - Close button labelled for screen readers.
 *
 * Kid-friendly UI (req 8.1, 8.2, 8.5):
 * - All text ≥ 16 px (text-base or larger).
 * - Confirm button uses destructive red; cancel button uses neutral outline.
 * - Lucide `Trash2` icon on confirm button; `X` icon on cancel button.
 * - Loading state shows `Loader2` spinner when `isLoading` is true.
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        {/* ── Backdrop ──────────────────────────────────────────────── */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-black/50 backdrop-blur-sm',
            // Radix data attribute for enter/leave animations
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />

        {/* ── Panel ─────────────────────────────────────────────────── */}
        <Dialog.Content
          aria-modal="true"
          onEscapeKeyDown={onCancel}
          onInteractOutside={onCancel}
          className={cn(
            // Position
            'fixed left-1/2 top-1/2 z-50',
            '-translate-x-1/2 -translate-y-1/2',
            // Sizing
            'w-full max-w-md',
            'rounded-2xl bg-white shadow-2xl',
            'p-6 sm:p-8',
            // Animations
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            // Focus ring
            'focus:outline-none',
          )}
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title
              className={cn(
                // req 8.1: ≥ 16px — text-xl is 20px
                'text-xl font-bold text-gray-900 leading-tight',
              )}
            >
              {title}
            </Dialog.Title>

            {/* Close (×) button in the corner */}
            <Dialog.Close asChild>
              <button
                aria-label="Tutup dialog"
                onClick={onCancel}
                disabled={isLoading}
                className={cn(
                  'shrink-0 rounded-full p-1 text-gray-400',
                  'hover:bg-gray-100 hover:text-gray-700',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',
                  'disabled:pointer-events-none disabled:opacity-50',
                  'transition-colors',
                )}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* ── Body ────────────────────────────────────────────────── */}
          <Dialog.Description
            className={cn(
              // req 8.1: ≥ 16px — text-base is 16px
              'mt-3 text-base text-gray-600 leading-relaxed',
            )}
          >
            {message}
          </Dialog.Description>

          {/* ── Actions ─────────────────────────────────────────────── */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {/* Cancel — neutral, X icon (req 8.5) */}
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                // req 8.1: text-base (16px) min; size="lg" already applies h-10
                'text-base font-semibold',
                // req 8.2: visually distinct
                'border-gray-300 text-gray-700 hover:bg-gray-100',
                // Ensure min touch target ≥ 44px (h-12 = 48px)
                'h-12 px-6',
              )}
            >
              <X size={18} aria-hidden="true" />
              {cancelLabel}
            </Button>

            {/* Confirm — destructive red, Trash2 icon (req 8.5) */}
            <Button
              variant="destructive"
              size="lg"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'text-base font-semibold',
                // req 8.2: bright distinct colour — destructive variant is red
                'h-12 px-6',
              )}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 size={18} aria-hidden="true" />
              )}
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
