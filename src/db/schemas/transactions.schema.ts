import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

import { idField, timestamps } from "./helpers";
import { users } from "./user.schema";
import { accounts } from "./accounts.schema";

export const transactions = sqliteTable("transactions", {
  ...idField,
  type: text({ mode: "text" }).notNull(),
  value: integer().notNull(),
  description: text({ length: 120 }).notNull(),
  observation: text({ length: 180 }),
  date: integer({ mode: "timestamp" }).notNull(),
  userId: text()
    .notNull()
    .references(() => users.id),
  accountId: text()
    .notNull()
    .references(() => accounts.id),
  ...timestamps,
});

export const insertTransactionSchema = createInsertSchema(transactions, {
  type: (schema) =>
    v.pipe(
      schema,
      v.picklist(["income", "expense"], "Tipo deve ser 'income' ou 'expense'"),
    ),
  value: (schema) =>
    v.pipe(
      v.number(),
      v.transform((val) => Math.floor(val * 100)),
      v.minValue(1, "Precisa ser maior que zero"),
    ),
  description: (schema) =>
    v.pipe(
      schema,
      v.minLength(5, "Deve conter pelo menos 5 caracteres"),
      v.maxLength(120, "Deve conter no máximo 120 caracteres"),
    ),
  observation: (schema) =>
    v.pipe(schema, v.maxLength(180, "Deve conter no máximo 180 caracteres")),
});
