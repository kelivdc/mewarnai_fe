// src/components/Nav.tsx
// Top navigation bar — auth-aware, kid-friendly, WCAG-compliant touch targets.
// Requirements: 2.5, 2.6, 8.1, 8.2, 8.4, 8.5

import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Upload, Images, LogOut, LogIn, UserPlus, User, BadgeDollarSign } from 'lucide-react'

// ---------------------------------------------------------------------------
// Nav component
// ---------------------------------------------------------------------------

export function Nav() {
  // Read the user from router context — populated by __root.tsx beforeLoad.
  const user = useRouterState({
    select: (s) =>
      s.matches[0]?.context?.user as
        | { id: string; username: string; name: string }
        | null
        | undefined,
  })

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-border shadow-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-5xl px-4">
        <ul className="flex items-center gap-1 list-none m-0 p-0">
          {/* Brand / logo area */}
          <li className="mr-auto">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-extrabold text-lg text-brand-orange hover:text-brand-orange-hover transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Mari Mewarnai — home"
            >
              🎨 <span className="hidden sm:inline">Mari Mewarnai</span>
            </Link>
          </li>

          {user ? (
            /* ── Authenticated nav items ───────────── */
            <>
              {/* Req 2.5: show username in navigation area */}
              <li className="hidden sm:flex items-center px-3 py-2 text-base font-semibold text-muted-foreground gap-1 min-h-[44px]">
                <User size={16} aria-hidden="true" />
                <span>{user.username ?? user.name}</span>
              </li>
              <li>
                <NavLink to="/gallery" icon={<Home size={20} />} label="Home" />
              </li>
              <li>
                <NavLink to="/upload" icon={<Upload size={20} />} label="Upload" />
              </li>
              <li>
                <NavLink
                  to="/my-images"
                  icon={<Images size={20} />}
                  label="My Images"
                />
              </li>
              <li>
                <NavLink
                  to="/pricing"
                  icon={<BadgeDollarSign size={20} />}
                  label="Harga"
                />
              </li>
              <li>
                <LogoutButton />
              </li>
            </>
          ) : (
            /* ── Unauthenticated nav items ── */
            <>
              <li>
                <NavLink to="/" icon={<Home size={20} />} label="Home" />
              </li>
              <li>
                <NavLink
                  to="/pricing"
                  icon={<BadgeDollarSign size={20} />}
                  label="Harga"
                />
              </li>
              <li>
                <NavLink to="/login" icon={<LogIn size={20} />} label="Login" />
              </li>
              <li>
                <NavLink
                  to="/register"
                  icon={<UserPlus size={20} />}
                  label="Register"
                  highlight
                />
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

interface NavLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  /** Renders with a distinct background for emphasis (e.g. Register CTA) */
  highlight?: boolean
}

function NavLink({ to, icon, label, highlight = false }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-base transition-colors',
        'min-h-[44px] min-w-[44px]',
        highlight
          ? 'bg-brand-orange text-white hover:bg-brand-orange-hover'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground',
        '[&.active]:text-brand-orange [&.active]:font-bold',
      ]
        .filter(Boolean)
        .join(' ')}
      activeProps={{ className: 'text-brand-orange font-bold' }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function LogoutButton() {
  const handleLogout = async () => {
    try {
      const { logoutAction } = await import('../server/actions/auth')
      await logoutAction()
      // Redirect to login after logout (req 2.4)
      window.location.href = '/login'
    } catch {
      // Fallback: redirect even if the server call fails
      window.location.href = '/login'
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-base transition-colors',
        'min-h-[44px] min-w-[44px]',
        'text-brand-red hover:bg-red-50',
      ].join(' ')}
      aria-label="Logout"
    >
      <LogOut size={20} />
      <span>Logout</span>
    </button>
  )
}
