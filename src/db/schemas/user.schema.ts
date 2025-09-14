import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { idField, timestamps } from "./helpers";

export const users = sqliteTable("users", {
  ...idField,
  name: text({ length: 120 }).notNull(),
  email: text({ length: 120 }).notNull(),
  password: text().notNull(),
  verified: integer({ mode: "boolean" }).default(false),
  termsAcceptedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  ...timestamps,
});

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) =>
    v.pipe(
      schema,
      v.transform((v) => v.trim().toLowerCase()),
      v.email("E-mail inválido"),
      v.minLength(6, "Mínimo 6 caracteres"),
      v.maxLength(40, "Máximo 40 caracteres"),
    ),
  name: (schema) =>
    v.pipe(
      schema,
      v.transform((v) => v.trim()),
      v.minLength(4, "Mínimo 4 caracteres"),
      v.maxLength(120, "Máximo 120 caracteres"),
    ),
  password: (schema) =>
    v.pipe(
      schema,
      v.transform((v) => v.trim()),
      v.minLength(6, "Mínimo 6 caracteres"),
      v.maxLength(255, "Máximo 255 caracteres"),
    ),
});

export const selectUserSchema = createSelectSchema(users, {
  email: (schema) =>
    v.pipe(
      schema,
      v.email("E-mail inválido"),
      v.minLength(6, "Mínimo 6 caracteres"),
      v.maxLength(40, "Máximo 40 caracteres"),
    ),
  password: (schema) =>
    v.pipe(
      schema,
      v.minLength(6, "Mínimo 6 caracteres"),
      v.maxLength(255, "Máximo 255 caracteres"),
    ),
});
