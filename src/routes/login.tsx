// src/routes/login.tsx
// Login page — delegates all auth to Better Auth (username/password + Google OAuth).

import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState, useEffect, useRef } from 'react'
import { LogIn } from 'lucide-react'
import { z } from 'zod'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { authClient } from '#/lib/auth-client'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/gallery' })
    }
  },
  validateSearch: (search) => searchSchema.parse(search),
  component: LoginPage,
})

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch() as { redirect?: string }

  const [serverError, setServerError] = useState<string | null>(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const spinnerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (spinnerTimer.current) clearTimeout(spinnerTimer.current)
    }
  }, [])

  // Only use redirectTo if it's a safe relative path (not /login itself)
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('/login')
      ? redirectTo
      : '/gallery'

  const handleGoogleSignIn = async () => {
    setServerError(null)
    setShowSpinner(true)
    // Better Auth handles the redirect automatically
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: safeRedirect,
    })
  }

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      spinnerTimer.current = setTimeout(() => setShowSpinner(true), 300)

      // signIn.username redirects to callbackURL on success via Better Auth
      const { error } = await authClient.signIn.username({
        username: value.username,
        password: value.password,
        callbackURL: safeRedirect,
      })

      if (spinnerTimer.current) {
        clearTimeout(spinnerTimer.current)
        spinnerTimer.current = null
      }

      if (error) {
        setShowSpinner(false)
        setServerError('Incorrect username or password. Please try again.')
      }
      // On success, Better Auth redirects to callbackURL — no need to navigate manually
    },
  })

  return (
    <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-white">
      {showSpinner && (
        <div
          role="status"
          aria-label="Signing in…"
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="size-14 rounded-full border-4 border-brand-orange border-t-transparent animate-spin" />
            <p className="text-lg font-semibold text-brand-orange">Signing in…</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="text-5xl" aria-hidden="true">🎨</div>
            <h1 className="text-3xl font-extrabold text-brand-orange">Let's Color!</h1>
            <p className="text-lg text-muted-foreground font-semibold">Sign in to your account</p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-base font-semibold text-brand-red"
            >
              {serverError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            noValidate
            className="space-y-5"
          >
            <form.Field name="username">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-base font-bold">
                    Username
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Enter your username"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={
                      field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                    }
                    className="h-12 text-base"
                    disabled={form.state.isSubmitting}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p id={`${field.name}-error`} role="alert" className="text-base font-semibold text-brand-red">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-base font-bold">
                    Password
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={
                      field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                    }
                    className="h-12 text-base"
                    disabled={form.state.isSubmitting}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p id={`${field.name}-error`} role="alert" className="text-base font-semibold text-brand-red">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <Button
              type="submit"
              disabled={form.state.isSubmitting}
              className="w-full h-12 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl gap-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <LogIn size={22} aria-hidden="true" />
              {form.state.isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="relative flex py-1 items-center">
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
            Sign in with Google
          </Button>

          <p className="text-center text-base text-muted-foreground">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-bold text-brand-orange hover:text-brand-orange-hover underline underline-offset-2"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
