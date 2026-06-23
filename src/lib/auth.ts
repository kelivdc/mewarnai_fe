import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { username } from 'better-auth/plugins'
import { db } from '#/server/db/client'
import * as schema from '#/server/db/schema'

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? ''
const betterAuthUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

export const auth = betterAuth({
  baseURL: betterAuthUrl,
  trustedOrigins: [betterAuthUrl],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
  plugins: [
    username({
      // Allow letters, numbers, and underscores (same as app validation rules)
      usernameValidator: (value) => /^[a-zA-Z0-9_]+$/.test(value),
    }),
    tanstackStartCookies(),
  ],
})

