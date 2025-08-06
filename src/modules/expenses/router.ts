import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";

import { expenses } from "@app/db/schemas";
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

export default router;
