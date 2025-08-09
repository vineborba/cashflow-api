import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { expenses } from "@app/db/schemas";
import { idSchema } from "@app/shared/schema";
import type { ServerContext } from "@app/types/global";

import { newExpenseSchema } from "./schemas";

const router = new Hono<ServerContext>();

router
  .post("/", vValidator("json", newExpenseSchema), async (c) => {
    const db = c.get("db");
    const data = c.req.valid("json");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const [inserted] = await db
      .insert(expenses)
      .values({
        userId: sub,
        ...data,
      })
      .returning({
        id: expenses.id,
      });

    return c.json(inserted, 201);
  })
  .get(async (c) => {
    const db = c.get("db");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const userExpenses = await db
      .select({
        value: expenses.value,
        paid: expenses.paid,
        description: expenses.description,
        date: expenses.date,
      })
      .from(expenses)
      .where(eq(expenses.userId, sub));

    return c.json(userExpenses);
  });

router.get("/:id", vValidator("param", idSchema), async (c) => {
  const db = c.get("db");
  const { sub } = c.get("jwtPayload");

  const { id } = c.req.valid("param");
  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, sub)));

  if (!expense) {
    throw new HTTPException(404, { message: "Despesa não encontrada" });
  }

  return c.json(expense);
});

export default router;
