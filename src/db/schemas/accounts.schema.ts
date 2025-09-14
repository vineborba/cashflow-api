import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

import { idField, timestamps } from "./helpers";
import { users } from "./user.schema";

export const accounts = sqliteTable("accounts", {
  ...idField,
  bank: text({ length: 100 }).notNull(),
  bankCode: text({ length: 4 }).notNull(),
  description: text({ length: 250 }).notNull(),
  type: text({ length: 40 }).notNull(),
  balance: integer().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id),
  ...timestamps,
});

export const insertAccountSchema = createInsertSchema(accounts, {
  balance: (schema) =>
    v.pipe(
      schema,
      v.transform((val) => Math.floor(val * 100)),
    ),
  description: (schema) => v.pipe(schema, v.nonEmpty()),
});

export const selectAccountSchema = createSelectSchema(accounts);
