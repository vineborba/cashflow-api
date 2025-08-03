import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

import { idField, timestamps } from "./helpers";
import { users } from "./user.schema";

export const tags = sqliteTable("tags", {
  ...idField,
  ...timestamps,
  name: text({ length: 60 }).notNull(),
  userId: text()
    .notNull()
    .references(() => users.id),
});

export const insertTagsSchema = createInsertSchema(tags, {
  name: (schema) =>
    v.pipe(
      schema,
      v.minLength(1, "Precisa ter pelo menos 1 caracter"),
      v.maxLength(60, "Pode ter no máximo 60 caracteres"),
    ),
});
