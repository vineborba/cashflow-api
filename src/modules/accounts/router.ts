import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";

import { ServerContext } from "@app/types/global";
import { accounts, banks } from "@app/db/schemas";
import { count, eq, and } from "drizzle-orm";
import { newAccountSchema } from "./schema";
import { HTTPException } from "hono/http-exception";
import { idSchema } from "@app/shared/schema";


const router = new Hono<ServerContext>();

router.get('/', async (c) => {
  const db = c.get('db');
  const { sub } = c.get('jwtPayload')

  const bankAccounts = db.select().from(accounts).where(eq(accounts.userId, sub));

  return c.json(bankAccounts);
}).post('/', vValidator('json', newAccountSchema), async (c) => {
  const db = c.get('db');
  const { sub } = c.get('jwtPayload');

  const data = c.req.valid('json');

  const [bank] = await db.select({ name: banks.name }).from(banks).where(eq(banks.id, data.bankCode)).limit(1);

  if (!bank) {
    throw new HTTPException(400, { message: "Código de banco inválido." });
  }

  const [newAccount] = await db.insert(accounts).values({ ...data, bank: bank.name, userId: sub }).returning();

  return c.json(newAccount, 201)
});

router.delete("/:id", vValidator('param', idSchema), async (c) => {
  const db = c.get('db');
  const { sub } = c.get('jwtPayload');

  const { id: accountId } = c.req.valid('param')

  const [{ count: userAccounts }] = await db.select({ count: count() }).from(accounts).where(eq(accounts.userId, sub));

  if (userAccounts === 1) {
    throw new HTTPException(400, { message: "Você deve ter pelo menos uma conta ativa." });
  }

  await db.update(accounts).set({ deletedAt: new Date() }).where(and(eq(accounts.userId, sub), eq(accounts.id, accountId)))
});

export default router;
