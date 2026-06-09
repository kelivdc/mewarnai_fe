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

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/gallery' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()

  const [serverError, setServerError] = useState<string | null>(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => () => clearSpinnerTimer(), [])

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
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-purple/15 mb-4">
              <UserPlus size={32} className="text-brand-purple" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Create Account</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Sign up and start coloring today!
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive"
            >
              {serverError}
            </div>
          )}

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
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === '') return 'Username is required'
                  if (value.trim().length < 3) return 'Username must be at least 3 characters'
                  if (value.trim().length > 30) return 'Username must be 30 characters or fewer'
                  if (!/^[a-zA-Z0-9_]+$/.test(value.trim()))
                    return 'Username may only contain letters, numbers, and underscores'
                  return undefined
                },
                onBlur: ({ value }) => {
                  if (!value || value.trim() === '') return 'Username is required'
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
                    placeholder="e.g. cool_kid"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={isSubmitting}
                    aria-describedby={
                      field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                    }
                    aria-invalid={field.state.meta.errors.length > 0}
                    className="h-12 text-base"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p id={`${field.name}-error`} role="alert" className="text-sm font-semibold text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value === '') return 'Password is required'
                  if (value.length < 8) return 'Password must be at least 8 characters'
                  return undefined
                },
                onBlur: ({ value }) => {
                  if (!value || value === '') return 'Password is required'
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
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    aria-describedby={
                      field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                    }
                    aria-invalid={field.state.meta.errors.length > 0}
                    className="h-12 text-base"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p id={`${field.name}-error`} role="alert" className="text-sm font-semibold text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

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
                      Creating account…
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} aria-hidden="true" />
                      Create Account
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <p className="mt-6 text-center text-base text-muted-foreground">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-bold text-brand-orange hover:text-brand-orange-hover underline underline-offset-2"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>

      {showSpinner && (
        <div
          role="status"
          aria-label="Creating your account…"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card border border-border px-8 py-6 shadow-xl">
            <Loader2 size={48} className="animate-spin text-brand-purple" aria-hidden="true" />
            <p className="text-lg font-bold text-foreground">Creating account…</p>
          </div>
        </div>
      )}
    </div>
  )
}
