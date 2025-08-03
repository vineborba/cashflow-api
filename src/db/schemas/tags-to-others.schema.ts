import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { tags } from "./tags.schema";
import { budgets } from "./budgets.schema";
import { expenses } from "./expense.schema";
import { incomes } from "./income.schema";

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

export const tagsToExpenses = sqliteTable(
  "tags_to_expenses",
  {
    tagId: text()
      .notNull()
      .references(() => tags.id),
    expenseId: text()
      .notNull()
      .references(() => expenses.id),
  },
  (table) => [primaryKey({ columns: [table.expenseId, table.tagId] })],
);

export const tagsToIncomes = sqliteTable(
  "tags_to_incomes",
  {
    tagId: text()
      .notNull()
      .references(() => tags.id),
    incomeId: text()
      .notNull()
      .references(() => incomes.id),
  },
  (table) => [primaryKey({ columns: [table.incomeId, table.tagId] })],
);
