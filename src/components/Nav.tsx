// src/components/Nav.tsx
// Top navigation bar — auth-aware, kid-friendly, WCAG-compliant touch targets.
// Requirements: 2.5, 2.6, 8.1, 8.2, 8.4, 8.5

import { Link } from '@tanstack/react-router'
import { Upload, Images, LogOut, LogIn, UserPlus, User, BadgeDollarSign, Compass } from 'lucide-react'
import { authClient } from '#/lib/auth-client'

// ---------------------------------------------------------------------------
// Nav component
// ---------------------------------------------------------------------------

export function Nav() {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user as { id: string; username?: string; name: string } | undefined

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-border shadow-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-5xl px-4">
        <ul className="flex items-center gap-0.5 list-none m-0 p-0">
          {/* Brand */}
          <li className="mr-auto">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-extrabold text-lg text-brand-blue hover:text-brand-orange-hover transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Mari Mewarnai — home"
            >
              🎨 <span className="hidden sm:inline">MariMewarnai</span>
            </Link>
          </li>

          {isPending ? (
            <li className="h-10 w-24 rounded-lg bg-neutral-100 animate-pulse" aria-hidden="true" />
          ) : user ? (
            <>
              <li>
                <NavLink to="/explore" icon={<Compass size={20} />} label="Explore" />
              </li>
              <li>
                <NavLink to="/upload" icon={<Upload size={20} />} label="Upload" />
              </li>
              <li>
                <NavLink to="/my-images" icon={<Images size={20} />} label="My Images" />
              </li>
              <li>
                <NavLink to="/pricing" icon={<BadgeDollarSign size={20} />} label="Pricing" />
              </li>
              {/* Username + logout group */}
              <li className="hidden sm:flex items-center gap-1.5 pl-2 ml-1 border-l border-border">
                <span className="flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-muted-foreground min-h-[44px]">
                  <User size={16} aria-hidden="true" />
                  <span className="max-w-[120px] truncate">{user.username ?? user.name}</span>
                </span>
                <LogoutButton />
              </li>
              {/* Mobile: just logout icon */}
              <li className="sm:hidden">
                <LogoutButton />
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/explore" icon={<Compass size={20} />} label="Explore" />
              </li>
              <li>
                <NavLink to="/pricing" icon={<BadgeDollarSign size={20} />} label="Pricing" />
              </li>
              <li>
                <NavLink to="/login" icon={<LogIn size={20} />} label="Login" />
              </li>
              <li>
                <NavLink to="/register" icon={<UserPlus size={20} />} label="Register" highlight />
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
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}

function LogoutButton() {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/login'
        },
      },
    })
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
      <span className="hidden sm:inline">Logout</span>
    </button>
  )
}
