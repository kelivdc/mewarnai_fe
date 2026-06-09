// src/routes/register.tsx
// Registration page — TanStack Form with client-side validation + server action.
// Requirements: 1.1–1.6, 8.1, 8.2, 8.6

import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { UserPlus, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { registerAction } from '../server/actions/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

// ---------------------------------------------------------------------------
// Route definition — redirect authenticated users straight to /gallery
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/gallery' })
    }
  },
  component: RegisterPage,
})

// ---------------------------------------------------------------------------
// RegisterPage component
// ---------------------------------------------------------------------------

function RegisterPage() {
  const navigate = useNavigate()

  // Server-level error (e.g. "username taken")
  const [serverError, setServerError] = useState<string | null>(null)

  // Loading spinner — only shown after 500 ms delay (req 8.6)
  const [showSpinner, setShowSpinner] = useState(false)
  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Kick off the 500 ms timer whenever the form transitions to submitting state
  const startSpinnerTimer = () => {
    spinnerTimerRef.current = setTimeout(() => setShowSpinner(true), 500)
  }
  const clearSpinnerTimer = () => {
    if (spinnerTimerRef.current) {
      clearTimeout(spinnerTimerRef.current)
      spinnerTimerRef.current = null
    }
    setShowSpinner(false)
  }

  // Clean up timer on unmount
  useEffect(() => () => clearSpinnerTimer(), [])

  // ---------------------------------------------------------------------------
  // TanStack Form
  // ---------------------------------------------------------------------------

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      setServerError(null)
      startSpinnerTimer()

      try {
        const result = await registerAction({ data: value })

        if (!result.success) {
          setServerError(result.error ?? 'Registration failed. Please try again.')
          return
        }

        // Success — navigate to gallery
        navigate({ to: '/gallery' })
      } catch {
        setServerError('Something went wrong. Please try again.')
      } finally {
        clearSpinnerTimer()
      }
    },
  })

  const isSubmitting = form.state.isSubmitting

  return (
    <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-brand-purple/10 via-background to-brand-orange/10">
      <div className="w-full max-w-md">

        {/* ── Card ───────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-purple/15 mb-4">
              <UserPlus size={32} className="text-brand-purple" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Daftar Akun</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Buat akun baru untuk mulai mewarnai!
            </p>
          </div>

          {/* Server error banner */}
          {serverError && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
            >
              {serverError}
            </div>
          )}

          {/* ── Form ──────────────────────────────────────────────── */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            noValidate
            className="space-y-6"
            aria-label="Registration form"
          >

            {/* Username field */}
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === '')
                    return 'Username tidak boleh kosong'
                  if (value.trim().length < 3)
                    return 'Username minimal 3 karakter'
                  if (value.trim().length > 30)
                    return 'Username maksimal 30 karakter'
                  if (!/^[a-zA-Z0-9_]+$/.test(value.trim()))
                    return 'Username hanya boleh huruf, angka, dan garis bawah'
                  return undefined
                },
                onBlur: ({ value }) => {
                  if (!value || value.trim() === '')
                    return 'Username tidak boleh kosong'
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-base font-bold text-foreground">
                    Username
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="contoh: anak_hebat"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={isSubmitting}
                    aria-describedby={
                      field.state.meta.errors.length > 0
                        ? `${field.name}-error`
                        : undefined
                    }
                    aria-invalid={field.state.meta.errors.length > 0}
                    className="h-12 text-base"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p
                      id={`${field.name}-error`}
                      role="alert"
                      className="text-sm font-semibold text-destructive"
                    >
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Password field */}
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value === '')
                    return 'Password tidak boleh kosong'
                  if (value.length < 8)
                    return 'Password minimal 8 karakter'
                  return undefined
                },
                onBlur: ({ value }) => {
                  if (!value || value === '')
                    return 'Password tidak boleh kosong'
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-base font-bold text-foreground">
                    Password
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    aria-describedby={
                      field.state.meta.errors.length > 0
                        ? `${field.name}-error`
                        : undefined
                    }
                    aria-invalid={field.state.meta.errors.length > 0}
                    className="h-12 text-base"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p
                      id={`${field.name}-error`}
                      role="alert"
                      className="text-sm font-semibold text-destructive"
                    >
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Submit button */}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, submitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || !!submitting}
                  className="w-full h-12 text-base font-extrabold bg-brand-purple hover:bg-brand-purple/90 text-white gap-2 min-h-[44px]"
                >
                  {showSpinner ? (
                    <>
                      <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                      Mendaftar…
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} aria-hidden="true" />
                      Daftar Sekarang
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>

          {/* Link to login */}
          <p className="mt-6 text-center text-base text-muted-foreground">
            Sudah punya akun?{' '}
            <a
              href="/login"
              className="font-bold text-brand-orange hover:text-brand-orange-hover underline underline-offset-2"
            >
              Masuk di sini
            </a>
          </p>
        </div>
      </div>

      {/* Full-screen loading overlay — shown after 500 ms (req 8.6) */}
      {showSpinner && (
        <div
          role="status"
          aria-label="Sedang mendaftarkan akun…"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card border border-border px-8 py-6 shadow-xl">
            <Loader2 size={48} className="animate-spin text-brand-purple" aria-hidden="true" />
            <p className="text-lg font-bold text-foreground">Mendaftar…</p>
          </div>
        </div>
      )}
    </div>
  )
}
