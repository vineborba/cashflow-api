import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { and, between, eq, inArray } from "drizzle-orm";
import { startOfMonth, endOfMonth } from "date-fns";

import type { ServerContext } from "@app/types/global";
import {
  budgets,
  transactions,
  tags,
  tagsToBudgets,
  tagsToTransactions,
} from "@app/db/schemas";
import { idSchema } from "@app/shared/schema";

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
      }

      return {
        id: inserted.id,
        maxValue: inserted.maxValue,
        name: inserted.name,
        totalExpenses: 0,
      } satisfies Budget;
    });

    const budgetExpenses = await db
      .select({ amount: transactions.value })
      .from(transactions)
      .innerJoin(
        tagsToTransactions,
        eq(transactions.id, tagsToTransactions.transactionId),
      )
      .where(
        and(
          eq(transactions.type, "expense"),
          inArray(tagsToTransactions.tagId, budgetTags),
          between(
            transactions.date,
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
          id: transactions.id,
          amount: transactions.value,
        },
      })
      .from(budgets)
      .leftJoin(tagsToBudgets, eq(budgets.id, tagsToBudgets.budgetId))
      .leftJoin(tags, eq(tags.id, tagsToBudgets.tagId))
      .leftJoin(tagsToTransactions, eq(tags.id, tagsToTransactions.tagId))
      .leftJoin(
        transactions,
        and(
          eq(tagsToTransactions.transactionId, transactions.id),
          eq(transactions.type, "expense"),
          between(
            transactions.date,
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

router.delete("/:id", vValidator("param", idSchema), async (c) => {
  const db = c.get("db");
  const { sub } = c.get("jwtPayload");
  const { id: budgetId } = c.req.valid("param");

  await db.transaction(async (tx) => {
    await tx.delete(tagsToBudgets).where(eq(tagsToBudgets.budgetId, budgetId));

    await tx
      .delete(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, sub)));
  });

  return c.body(null, 204);
});

export default router;
