import { and, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import { Hono } from "hono";

import { expenses, incomes } from "@app/db/schemas";
import { ServerContext } from "@app/types/global";

const router = new Hono<ServerContext>();

router.get("/", async (c) => {
  const db = c.get("db");
  const { sub } = c.get("jwtPayload");

  const {
    paid: _paid,
    accountId: _eAccountId,
    userId: _eUserId,
    deletedAt: _eDeletedAt,
    ...expensesData
  } = getTableColumns(expenses);
  const expensesQuery = db
    .select(expensesData)
    .from(expenses)
    .where(and(eq(expenses.userId, sub), isNull(expenses.deletedAt)));

  const {
    received: _received,
    accountId: _iAccountId,
    userId: _iUserId,
    deletedAt: _iDeletedAt,
    ...incomesData
  } = getTableColumns(incomes);
  const incomesQuery = db
    .select(incomesData)
    .from(incomes)
    .where(and(eq(incomes.userId, sub), isNull(incomes.deletedAt)));

  const userTransactions = await expensesQuery
    .unionAll(incomesQuery)
    .orderBy(desc(sql`date`))
    .limit(15);

  return c.json(userTransactions);
});

export default router;
