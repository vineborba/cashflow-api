import { relations } from "drizzle-orm/relations";

import { transactions } from "./transactions.schema";
import { users } from "./user.schema";
import { budgets } from "./budgets.schema";
import { tags } from "./tags.schema";
import { tagsToBudgets, tagsToTransactions } from "./tags-to-others.schema";
import { accounts } from "./accounts.schema";

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  tags: many(tags),
  accounts: many(accounts),
}));

export const accountsRelation = relations(accounts, ({ one, many }) => ({
  owner: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id],
    }),
    tags: many(tagsToTransactions),
    account: one(accounts, {
      fields: [transactions.accountId],
      references: [accounts.id],
    }),
  }),
);

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
  transactions: many(tagsToTransactions),
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

export const tagsToTransactionsRelations = relations(
  tagsToTransactions,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [tagsToTransactions.transactionId],
      references: [transactions.id],
    }),
    tag: one(tags, {
      fields: [tagsToTransactions.tagId],
      references: [tags.id],
    }),
  }),
);
