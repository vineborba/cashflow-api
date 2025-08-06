import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const banks = sqliteTable("banks", {
  id: text().primaryKey(),
  name: text().notNull(),
});
