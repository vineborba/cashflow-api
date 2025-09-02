import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { and, between, eq, gte, inArray } from "drizzle-orm";
import { startOfMonth, endOfMonth } from "date-fns";

import type { ServerContext } from "@app/types/global";
import {
  budgets,
  expenses,
  tags,
  tagsToBudgets,
  tagsToExpenses,
} from "@app/db/schemas";

import { newBudgetSchema } from "./schema";
import { InvalidBudgetTags } from "./exception";

type Budget = {
  id: string;
  name: string;
  maxValue: number;
  totalExpenses: number;
};

const router = new Hono<ServerContext>();

router
  .post("/", vValidator("json", newBudgetSchema), async (c) => {
    const db = c.get("db");
    const data = c.req.valid("json");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const { tags: budgetTags, ...budgetData } = data;

    const insertedData = await db.transaction(async (tx) => {
      const [inserted] = await db
        .insert(budgets)
        .values({
          userId: sub,
          ...budgetData,
        })
        .returning();

      let insertedTags: string[] = [];
      if (budgetTags.length) {
        const tagsAreValid = await tx
          .select({ name: tags.name })
          .from(tags)
          .where(and(eq(tags.userId, sub), inArray(tags.id, budgetTags)));

        if (tagsAreValid.length !== budgetTags.length) {
          throw new InvalidBudgetTags();
        }

        const pairs = budgetTags.map((t) => ({
          tagId: t,
          budgetId: inserted.id,
        }));

        await tx.insert(tagsToBudgets).values(pairs);
        insertedTags = tagsAreValid.map((t) => t.name);
      }

      return {
        id: inserted.id,
        maxValue: inserted.maxValue,
        name: inserted.name,
        totalExpenses: 0,
      } satisfies Budget;
    });

    const budgetExpenses = await db
      .select({ amount: expenses.value })
      .from(expenses)
      .innerJoin(tagsToExpenses, eq(expenses.id, tagsToExpenses.expenseId))
      .where(
        and(
          inArray(tagsToExpenses.tagId, budgetTags),
          between(
            expenses.date,
            startOfMonth(new Date()),
            endOfMonth(new Date()),
          ),
        ),
      );

    insertedData.totalExpenses = budgetExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    return c.json(insertedData, 201);
  })
  .get(async (c) => {
    const db = c.get("db");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const budgetsData = await db
      .select({
        budget: {
          id: budgets.id,
          name: budgets.name,
          maxValue: budgets.maxValue,
        },
        expenses: {
          id: expenses.id,
          amount: expenses.value,
        },
      })
      .from(budgets)
      .leftJoin(tagsToBudgets, eq(budgets.id, tagsToBudgets.budgetId))
      .leftJoin(tags, eq(tags.id, tagsToBudgets.tagId))
      .leftJoin(tagsToExpenses, eq(tags.id, tagsToExpenses.tagId))
      .leftJoin(
        expenses,
        and(
          eq(tagsToExpenses.expenseId, expenses.id),
          between(
            expenses.date,
            startOfMonth(new Date()),
            endOfMonth(new Date()),
          ),
        ),
      )
      .where(eq(budgets.userId, sub));

    const aggregatedData = budgetsData.reduce((acc, curr) => {
      const existing = acc.get(curr.budget.id);
      if (existing) {
        existing.totalExpenses += curr.expenses?.amount || 0;
      } else {
        acc.set(curr.budget.id, {
          ...curr.budget,
          totalExpenses: curr.expenses?.amount || 0,
        });
      }
      return acc;
    }, new Map<string, Budget>());

    return c.json(aggregatedData.values().toArray());
  });

export default router;
