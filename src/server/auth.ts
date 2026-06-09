// src/server/auth.ts
// Auth helpers: password hashing and session management
// Requirements: 1.1–1.7, 2.1–2.4

import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { eq } from 'drizzle-orm'

import { db } from './db/client'
import { sessions, users } from './db/schema'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthResult {
  success: boolean
  userId?: string
  token?: string
  error?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BCRYPT_COST_FACTOR = 12
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

// ---------------------------------------------------------------------------
// Password helpers
// Requirements: 1.7
// ---------------------------------------------------------------------------

/**
 * Hash a plaintext password using bcrypt with cost factor 12.
 * The resulting hash is safe to persist in the database.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_COST_FACTOR)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a plaintext password against a stored bcrypt hash.
 * Returns true if they match, false otherwise.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ---------------------------------------------------------------------------
// Session management
// Requirements: 2.2, 2.4
// ---------------------------------------------------------------------------

/**
 * Create a new session for the given user.
 * Generates a UUID v4 token, stores it in the `sessions` table with a 30-day
 * expiry, and returns the token to be set as an HTTP-only cookie.
 *
 * The sessions table is better-auth compatible, so we populate all required
 * fields: id, token, userId, expiresAt, createdAt, updatedAt.
 */
export async function createSession(userId: string): Promise<string> {
  const token = uuidv4()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS)

  await db.insert(sessions).values({
    id: token, // use token as the row PK as well
    token,
    userId,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  })

  return token
}

/**
 * Validate a session token.
 * Returns the associated userId if the token exists and has not expired,
 * or null if the session is invalid or expired.
 */
export async function validateSession(token: string): Promise<string | null> {
  const now = new Date()

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1)

  if (!session) {
    return null
  }

  if (session.expiresAt <= now) {
    // Clean up the expired session
    await db.delete(sessions).where(eq(sessions.token, token))
    return null
  }

  return session.userId
}

/**
 * Invalidate a session by deleting it from the database.
 * After this call the token will no longer be accepted by validateSession.
 */
export async function invalidateSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token))
}

// ---------------------------------------------------------------------------
// Validation helpers
// Requirements: 1.1–1.6
// ---------------------------------------------------------------------------

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

function validateUsername(username: string): string | null {
  if (username.length < 3 || username.length > 30) {
    return 'Username must be between 3 and 30 characters'
  }
  if (!USERNAME_REGEX.test(username)) {
    return 'Username may only contain letters, numbers, and underscores'
  }
  return null
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  return null
}

// ---------------------------------------------------------------------------
// User registration
// Requirements: 1.1–1.7
// ---------------------------------------------------------------------------

/**
 * Register a new user.
 * Validates the username and password, checks for duplicates, hashes the
 * password, inserts the user record, creates a session, and returns the
 * session token together with the new userId.
 */
export async function registerUser(
  username: string,
  password: string,
): Promise<AuthResult> {
  try {
    // Validate inputs
    const usernameError = validateUsername(username)
    if (usernameError) {
      return { success: false, error: usernameError }
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return { success: false, error: passwordError }
    }

    // Check for duplicate username
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (existing) {
      return { success: false, error: 'Username is already taken' }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const userId = uuidv4()
    const now = new Date()

    await db.insert(users).values({
      id: userId,
      name: username,
      email: `${username}@local.app`,
      emailVerified: false,
      username,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    })

    // Create session and return token
    const token = await createSession(userId)

    return { success: true, userId, token }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return { success: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// User login
// Requirements: 2.1–2.3
// ---------------------------------------------------------------------------

/**
 * Authenticate an existing user by username and password.
 * On success creates a new session and returns its token.
 * Always returns a generic "Invalid credentials" error to avoid leaking
 * whether a username exists.
 */
export async function loginUser(
  username: string,
  password: string,
): Promise<AuthResult> {
  try {
    // Look up user by username
    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (!user) {
      return { success: false, error: 'Invalid credentials' }
    }

    if (!user.passwordHash) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Create session and return token
    const token = await createSession(user.id)

    return { success: true, userId: user.id, token }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    return { success: false, error: message }
  }
}
