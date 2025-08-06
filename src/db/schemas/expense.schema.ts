import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

import { idField, timestamps } from "./helpers";
import { users } from "./user.schema";
import { accounts } from "./accounts.schema";

export const expenses = sqliteTable("expenses", {
  ...idField,
  value: int().notNull(),
  paid: int({ mode: "boolean" }).notNull().default(true),
  description: text({ length: 120 }).notNull(),
  observation: text({ length: 180 }),
  date: int({ mode: "timestamp" }).notNull(),
  userId: text()
    .notNull()
    .references(() => users.id),
  accountId: text()
    .notNull()
    .references(() => accounts.id),
  ...timestamps,
});

export const insertExpenseSchema = createInsertSchema(expenses, {
  value: (schema) =>
    v.pipe(schema, v.minValue(1, "Precisa ser maior que zero")),
  description: (schema) =>
    v.pipe(
      schema,
      v.minLength(5, "Deve conter pelo menos 5 caracteres"),
      v.maxLength(120, "Deve conter no máximo 120 caracteres"),
    ),
  observation: (schema) =>
    v.pipe(schema, v.maxLength(180, "Deve conter no máximo 180 caracteres")),
});
