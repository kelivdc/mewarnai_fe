// src/routes/register.tsx
// Registration page — delegates all auth to Better Auth (username/password + Google OAuth).

import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { UserPlus, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/gallery' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSpinnerTimer = () => {
    if (spinnerTimerRef.current) {
      clearTimeout(spinnerTimerRef.current)
      spinnerTimerRef.current = null
    }
    setShowSpinner(false)
  }

  useEffect(() => () => clearSpinnerTimer(), [])

  const handleGoogleSignIn = async () => {
    setServerError(null)
    setShowSpinner(true)
    // Better Auth handles the redirect automatically
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/gallery',
    })
  }

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      spinnerTimerRef.current = setTimeout(() => setShowSpinner(true), 300)

      // signUp.email with username plugin — redirects to callbackURL on success
      const { error } = await authClient.signUp.email({
        email: `${value.username.toLowerCase()}@local.app`,
        password: value.password,
        name: value.username,
        username: value.username,
        callbackURL: '/gallery',
      } as Parameters<typeof authClient.signUp.email>[0])

      clearSpinnerTimer()

      if (error) {
        const msg = error.message ?? ''
        if (
          msg.toLowerCase().includes('unique') ||
          msg.toLowerCase().includes('already') ||
          msg.toLowerCase().includes('taken')
        ) {
          setServerError('Username is already taken. Please choose another.')
        } else {
          setServerError(msg || 'Registration failed. Please try again.')
        }
      }
      // On success, Better Auth redirects to callbackURL — no need to navigate manually
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
                  className="w-full h-12 text-base font-extrabold bg-brand-purple hover:bg-brand-purple/90 text-white gap-2 min-h-[44px] cursor-pointer active:scale-[0.98] transition-all"
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

          <div className="relative flex py-1 items-center my-4">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-sm font-semibold">Or continue with</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base font-bold bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl gap-3 flex items-center justify-center transition-all duration-200 hover:shadow-sm hover:border-neutral-400 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>

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
