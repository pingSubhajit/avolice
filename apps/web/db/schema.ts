import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core'

// Better Auth core tables (minimal, Postgres)
// Notes:
// - Better Auth expects string IDs by default.
// - Column names match Better Auth field names.
export const user = pgTable('user', {
	id: text('id').primaryKey().notNull(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	emailVerified: boolean('emailVerified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('createdAt', {withTimezone: true})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updatedAt', {withTimezone: true})
		.notNull()
		.defaultNow()
})

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey().notNull(),
		expiresAt: timestamp('expiresAt', {withTimezone: true}).notNull(),
		token: text('token').notNull(),
		createdAt: timestamp('createdAt', {withTimezone: true})
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updatedAt', {withTimezone: true})
			.notNull()
			.defaultNow(),
		ipAddress: text('ipAddress'),
		userAgent: text('userAgent'),
		userId: text('userId')
			.notNull()
			.references(() => user.id, {onDelete: 'cascade'})
	},
	(t) => ({
		tokenUnique: uniqueIndex('session_token_unique').on(t.token),
		userIdIdx: index('session_userId_idx').on(t.userId)
	})
)

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey().notNull(),
		accountId: text('accountId').notNull(),
		providerId: text('providerId').notNull(),
		userId: text('userId')
			.notNull()
			.references(() => user.id, {onDelete: 'cascade'}),
		accessToken: text('accessToken'),
		refreshToken: text('refreshToken'),
		idToken: text('idToken'),
		accessTokenExpiresAt: timestamp('accessTokenExpiresAt', {
			withTimezone: true
		}),
		refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', {
			withTimezone: true
		}),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('createdAt', {withTimezone: true})
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updatedAt', {withTimezone: true})
			.notNull()
			.defaultNow()
	},
	(t) => ({
		providerAccountUnique: uniqueIndex(
			'account_provider_account_unique'
		).on(t.providerId, t.accountId),
		userIdIdx: index('account_userId_idx').on(t.userId)
	})
)

export const verification = pgTable(
	'verification',
	{
		id: text('id').primaryKey().notNull(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expiresAt', {withTimezone: true}).notNull(),
		createdAt: timestamp('createdAt', {withTimezone: true})
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updatedAt', {withTimezone: true})
			.notNull()
			.defaultNow()
	},
	(t) => ({
		identifierIdx: index('verification_identifier_idx').on(t.identifier)
	})
)
