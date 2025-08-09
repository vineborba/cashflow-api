import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { incomes } from "@app/db/schemas";
import { idSchema } from "@app/shared/schema";
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

router.get("/:id", vValidator("param", idSchema), async (c) => {
  const db = c.get("db");
  const { sub } = c.get("jwtPayload");

  const { id } = c.req.valid("param");
  const [income] = await db
    .select()
    .from(incomes)
    .where(and(eq(incomes.id, id), eq(incomes.userId, sub)));

  if (!income) {
    throw new HTTPException(404, { message: "Recebimento não encontrado" });
  }

  return c.json(income);
});

export default router;
