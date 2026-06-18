// src/routes/__root.tsx
// Root layout: provides router context (queryClient + user) and renders Nav.
// Requirements: 2.5, 2.6, 8.1, 8.2, 8.4, 8.5

import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { authClient } from '../lib/auth-client'

import appCss from '../styles/globals.css?url'

import type { QueryClient } from '@tanstack/react-query'

// ---------------------------------------------------------------------------
// Router context type
// ---------------------------------------------------------------------------

export interface MyRouterContext {
  queryClient: QueryClient
  user: { id: string; username: string; name: string } | null
}

// ---------------------------------------------------------------------------
// Root route
// ---------------------------------------------------------------------------

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Mari Mewarnai' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),

  // Runs on every navigation.
  // Uses authClient.getSession() so browser cookies are always sent correctly,
  // both on SSR (initial load) and client-side navigation.
  beforeLoad: async () => {
    try {
      const { data: session } = await authClient.getSession()
      if (!session?.user) return { user: null }

      const u = session.user as Record<string, unknown>
      return {
        user: {
          id: session.user.id,
          username: (u.username as string) ?? session.user.name,
          name: session.user.name,
        },
      }
    } catch {
      return { user: null }
    }
  },

  shellComponent: RootDocument,
})

// ---------------------------------------------------------------------------
// Shell component — wraps every page with Nav + devtools
// ---------------------------------------------------------------------------

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
