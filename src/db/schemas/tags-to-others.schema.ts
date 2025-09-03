import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { tags } from "./tags.schema";
import { budgets } from "./budgets.schema";
import { transactions } from "./transactions.schema";

export const tagsToBudgets = sqliteTable(
  "tags_to_budgets",
  {
    tagId: text()
      .notNull()
      .references(() => tags.id),
    budgetId: text()
      .notNull()
      .references(() => budgets.id),
  },
  (table) => [primaryKey({ columns: [table.budgetId, table.tagId] })],
);

export const tagsToTransactions = sqliteTable(
  "tags_to_transactions",
  {
    tagId: text()
      .notNull()
      .references(() => tags.id),
    transactionId: text()
      .notNull()
      .references(() => transactions.id),
  },
  (table) => [primaryKey({ columns: [table.transactionId, table.tagId] })],
);
