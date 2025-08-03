import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";

import { incomes } from "@app/db/schemas/schema";
import type { ServerContext } from "@app/types/global";

import { newIncomeSchema } from "./schemas";

const router = new Hono<ServerContext>();

router
  .post("/", vValidator("json", newIncomeSchema), async (c) => {
    const db = c.get("db");
    const data = c.req.valid("json");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const [inserted] = await db
      .insert(incomes)
      .values({
        userId: sub,
        ...data,
      })
      .returning({
        id: incomes.id,
      });

    return c.json(inserted, 201);
  })
  .get(async (c) => {
    const db = c.get("db");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    console.log(sub);

    const userIncomes = await db
      .select({
        value: incomes.value,
        received: incomes.received,
        description: incomes.description,
        date: incomes.date,
      })
      .from(incomes)
      .where(eq(incomes.userId, sub));

    return c.json(userIncomes);
  });

export default router;
