// src/server/db/schema.ts
// Drizzle ORM schema for PostgreSQL

import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  boolean,
  customType,
} from 'drizzle-orm/pg-core'

// Custom bytea type for PostgreSQL binary data (canvas PNG blobs)
const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return 'bytea'
  },
})

// ---------------------------------------------------------------------------
// better-auth compatible tables
// ---------------------------------------------------------------------------

/**
 * users table — compatible with better-auth's User model.
 * better-auth requires: id (text), name, email, emailVerified, image,
 * createdAt, updatedAt.
 *
 * We also store a username (unique) for the app's registration flow and
 * a passwordHash for the legacy/custom auth path. better-auth email+password
 * stores the password in the `account` table, but we keep passwordHash here
 * for the custom auth helpers specified in the design.
 */
export const users = pgTable('user', {
  id: text('id').primaryKey(),
  // better-auth required fields
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  // app-specific fields
  username: text('username').unique(),
  displayUsername: text('display_username'),
  passwordHash: text('password_hash'),
})

// Better Auth expects singular key names in the schema object
export const user = users

/**
 * sessions table — compatible with better-auth's Session model.
 * better-auth requires: id (text), userId, expiresAt, token,
 * createdAt, updatedAt, ipAddress, userAgent.
 */
export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
})

export const session = sessions

/**
 * accounts table — required by better-auth for email+password and OAuth.
 * Stores provider credentials (including hashed passwords for email auth).
 */
export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const account = accounts

/**
 * verifications table — required by better-auth for email verification flows.
 */
export const verifications = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Better Auth's drizzle adapter looks up models by schema key name (singular).
// We export a singular alias so the adapter can find "verification".
export const verification = verifications


// ---------------------------------------------------------------------------
// App-specific tables
// ---------------------------------------------------------------------------

/**
 * images table — stores uploaded images and their processed coloring pages.
 * Requirements: 2.4, 3.6
 */
export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  originalPath: text('original_path').notNull(),
  coloringPath: text('coloring_path').notNull(),
  filename: text('filename').notNull(),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
})

/**
 * coloring_saves table — stores per-user canvas progress as PNG blobs.
 * Requirements: 6.2
 * One save per (userId, imageId) pair — upserted on save.
 */
export const coloringSaves = pgTable('coloring_saves', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  imageId: integer('image_id')
    .notNull()
    .references(() => images.id, { onDelete: 'cascade' }),
  canvasData: bytea('canvas_data').notNull(), // PNG blob of canvas state
  savedAt: timestamp('saved_at').notNull().defaultNow(),
})
