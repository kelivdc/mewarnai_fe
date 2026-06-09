import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient()

  return {
    queryClient,
    // user starts null; __root.tsx beforeLoad populates it from the session cookie
    user: null as { id: string; username: string; name: string } | null,
  }
}
export default function TanstackQueryProvider() {}
