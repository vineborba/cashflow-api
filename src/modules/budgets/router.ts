import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { and, eq, inArray } from "drizzle-orm";

import type { ServerContext } from "@app/types/global";
import { budgets, tags, tagsToBudgets } from "@app/db/schemas";

import { newBudgetSchema } from "./schema";
import { InvalidBudgetTags } from "./exception";

const router = new Hono<ServerContext>();

router.post("/", vValidator("json", newBudgetSchema), async (c) => {
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
      ...inserted,
      tags: insertedTags,
    };
  });

  return c.json(insertedData, 201);
});

export default router;
