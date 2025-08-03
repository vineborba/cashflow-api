import { relations } from "drizzle-orm/relations";

import { expenses } from "./expense.schema";
import { incomes } from "./income.schema";
import { users } from "./user.schema";
import { budgets } from "./budgets.schema";
import { tags } from "./tags.schema";
import {
  tagsToBudgets,
  tagsToExpenses,
  tagsToIncomes,
} from "./tags-to-others.schema";

export const usersRelations = relations(users, ({ many }) => ({
  incomes: many(incomes),
  expenses: many(expenses),
  tags: many(tags),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  tags: many(tagsToExpenses),
}));

export const incomesRelations = relations(incomes, ({ one, many }) => ({
  user: one(users, {
    fields: [incomes.userId],
    references: [users.id],
  }),
  tags: many(tagsToIncomes),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  tags: many(tagsToBudgets),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  budgets: many(tagsToBudgets),
  incomes: many(tagsToIncomes),
  expenses: many(tagsToExpenses),
}));

export const tagsToBudgetsRelations = relations(tagsToBudgets, ({ one }) => ({
  budget: one(budgets, {
    fields: [tagsToBudgets.budgetId],
    references: [budgets.id],
  }),
  tag: one(tags, {
    fields: [tagsToBudgets.tagId],
    references: [tags.id],
  }),
}));

export const tagsToExpensesRelations = relations(tagsToExpenses, ({ one }) => ({
  budget: one(budgets, {
    fields: [tagsToExpenses.expenseId],
    references: [budgets.id],
  }),
  tag: one(tags, {
    fields: [tagsToExpenses.tagId],
    references: [tags.id],
  }),
}));

export const tagsToIncomesRelations = relations(tagsToIncomes, ({ one }) => ({
  budget: one(budgets, {
    fields: [tagsToIncomes.incomeId],
    references: [budgets.id],
  }),
  tag: one(tags, {
    fields: [tagsToIncomes.tagId],
    references: [tags.id],
  }),
}));
