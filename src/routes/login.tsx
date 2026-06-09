// src/routes/login.tsx
// Login page using TanStack Form.
// Requirements: 2.1–2.3, 8.1, 8.2, 8.6

import { createFileRoute, redirect, useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState, useEffect, useRef } from 'react'
import { LogIn } from 'lucide-react'
import { z } from 'zod'

import { loginAction } from '../server/actions/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------

// Search params schema: optional redirect URL
const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  // If already authenticated, skip the login page
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/gallery' })
    }
  },
  validateSearch: (search) => searchSchema.parse(search),
  component: LoginPage,
})

// ---------------------------------------------------------------------------
// Login page component
// ---------------------------------------------------------------------------

function LoginPage() {
  const navigate = useNavigate()
  const { redirect: redirectTo } = useSearch({ from: '/login' })

  const [serverError, setServerError] = useState<string | null>(null)
  // Controls whether the loading spinner is visible (delayed 500ms per req 8.6)
  const [showSpinner, setShowSpinner] = useState(false)
  const spinnerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear any lingering timer on unmount
  useEffect(() => {
    return () => {
      if (spinnerTimer.current) clearTimeout(spinnerTimer.current)
    }
  }, [])

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null)

      // Start 500ms spinner timer (req 8.6)
      spinnerTimer.current = setTimeout(() => setShowSpinner(true), 500)

      try {
        const result = await loginAction({ data: value })

        if (!result.success) {
          // Req 2.3: generic error — don't reveal which field was wrong
          setServerError('Username atau password salah. Silakan coba lagi.')
          return
        }

        // Req 2.2: redirect to intended page or /gallery on success
        const destination = redirectTo ?? '/gallery'
        // Use replace to prevent the login page from being in back-stack
        await navigate({ to: destination as string, replace: true })
      } catch {
        setServerError('Terjadi kesalahan. Silakan coba lagi.')
      } finally {
        if (spinnerTimer.current) {
          clearTimeout(spinnerTimer.current)
          spinnerTimer.current = null
        }
        setShowSpinner(false)
      }
    },
  })

  return (
    <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-white">
      {/* Loading overlay — shown after 500ms of pending submit (req 8.6) */}
      {showSpinner && (
        <div
          role="status"
          aria-label="Sedang masuk…"
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="size-14 rounded-full border-4 border-brand-orange border-t-transparent animate-spin" />
            <p className="text-lg font-semibold text-brand-orange">Sedang masuk…</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="text-5xl" aria-hidden="true">🎨</div>
            <h1 className="text-3xl font-extrabold text-brand-orange">Mari Mewarnai</h1>
            <p className="text-lg text-muted-foreground font-semibold">Masuk ke akunmu</p>
          </div>

          {/* Server-level error (req 2.3: generic message) */}
          {serverError && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-base font-semibold text-brand-red"
            >
              {serverError}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            noValidate
            className="space-y-5"
          >
            {/* Username field */}
            <form.Field name="username">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-base font-bold">
                    Nama Pengguna
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Masukkan nama penggunamu"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={
                      field.state.meta.errors.length > 0
                        ? `${field.name}-error`
                        : undefined
                    }
                    className="h-12 text-base"
                    disabled={form.state.isSubmitting}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p
                      id={`${field.name}-error`}
                      role="alert"
                      className="text-base font-semibold text-brand-red"
                    >
                      {field.state.meta.errors[0]?.message ??
                        String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Password field */}
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-base font-bold">
                    Kata Sandi
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandimu"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={
                      field.state.meta.errors.length > 0
                        ? `${field.name}-error`
                        : undefined
                    }
                    className="h-12 text-base"
                    disabled={form.state.isSubmitting}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p
                      id={`${field.name}-error`}
                      role="alert"
                      className="text-base font-semibold text-brand-red"
                    >
                      {field.state.meta.errors[0]?.message ??
                        String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Submit button (req 8.2, 8.5: bright color, icon) */}
            <Button
              type="submit"
              disabled={form.state.isSubmitting}
              className="w-full h-12 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl gap-2"
            >
              <LogIn size={22} aria-hidden="true" />
              {form.state.isSubmitting ? 'Sedang masuk…' : 'Masuk'}
            </Button>
          </form>

          {/* Link to registration */}
          <p className="text-center text-base text-muted-foreground">
            Belum punya akun?{' '}
            <a
              href="/register"
              className="font-bold text-brand-orange hover:text-brand-orange-hover underline underline-offset-2"
            >
              Daftar di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
