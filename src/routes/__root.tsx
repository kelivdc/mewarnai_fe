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

import appCss from '../styles/globals.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { getSessionUser } from '../server/actions/session'

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
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Mari Mewarnai',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  // Runs on every navigation — populates context.user from session cookie.
  // Uses a server function so @tanstack/react-start/server is never imported
  // in client code (avoids import-protection violations and Seroval errors).
  beforeLoad: async () => {
    const user = await getSessionUser()
    return { user }
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
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
