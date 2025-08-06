import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createSelectSchema, createInsertSchema } from 'drizzle-valibot'

import { idField, timestamps } from './helpers'
import { users } from './user.schema';

export const accounts = sqliteTable('accounts', {
  ...idField,
  ...timestamps,
  bank: text({ length: 100 }).notNull(),
  bankCode: text({ length: 4 }).notNull(),
  description: text({ length: 250 }),
  type: text({ length: 40 }).notNull(),
  balance: integer().notNull(),
  userId: text().notNull().references(() => users.id),
});

export const insertAccountSchema = createInsertSchema(accounts);

export const selectAccountSchema = createSelectSchema(accounts);
