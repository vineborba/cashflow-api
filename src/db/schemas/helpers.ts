import { int, text } from "drizzle-orm/sqlite-core";

export const timestamps = {
  updatedAt: int({ mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: int({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  deletedAt: int({ mode: "timestamp" }),
};

export const idField = {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
};
