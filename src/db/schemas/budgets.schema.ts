import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

import { idField, timestamps } from "./helpers";
import { users } from "./user.schema";

export const budgets = sqliteTable("budgets", {
  ...idField,
  ...timestamps,
  name: text({ length: 60 }).notNull(),
  maxValue: integer().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id),
});

export const insertBudgetSchema = createInsertSchema(budgets, {
  name: (schema) =>
    v.pipe(
      schema,
      v.minLength(1, "Precisa ter pelo menos 1 caracter"),
      v.maxLength(60, "Pode ter no máximo 60 caracteres"),
    ),
  maxValue: () =>
    v.pipe(
      v.number(),
      v.minValue(0, "Valor do orçamento deve ser um número positivo"),
      v.transform((val) => Math.floor(val * 100)),
    ),
});
