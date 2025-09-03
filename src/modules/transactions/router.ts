import { and, desc, eq, isNull, like, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { HTTPException } from "hono/http-exception";

import { transactions, tagsToTransactions, tags } from "@app/db/schemas";
import { idSchema } from "@app/shared/schema";
import { ServerContext } from "@app/types/global";

import { newTransactionSchema, transactionQuerySchema } from "./schemas";
import { InvalidTransactionTags } from "./exceptions";

type Transaction = {
  id: string;
  type: string;
  value: number;
  description: string;
  date: Date;
  tags: string[];
};

const router = new Hono<ServerContext>();

router
  .post("/", vValidator("json", newTransactionSchema), async (c) => {
    const db = c.get("db");
    const data = c.req.valid("json");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const { tags: transactionTags, ...transactionData } = data;

    const insertedData = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(transactions)
        .values({
          userId: sub,
          ...transactionData,
        })
        .returning();

      let insertedTags: string[] = [];
      if (transactionTags.length) {
        const tagsAreValid = await tx
          .select({ id: tags.id, name: tags.name })
          .from(tags)
          .where(and(eq(tags.userId, sub), inArray(tags.id, transactionTags)));

        if (tagsAreValid.length !== transactionTags.length) {
          throw new InvalidTransactionTags();
        }

        const pairs = transactionTags.map((tagId) => ({
          tagId,
          transactionId: inserted.id,
        }));

        await tx.insert(tagsToTransactions).values(pairs);

        insertedTags = tagsAreValid.map((t) => t.name);
      }

      return {
        id: inserted.id,
        date: inserted.date,
        description: inserted.description,
        type: inserted.type,
        value: inserted.value,
        tags: insertedTags,
      } satisfies Transaction;
    });

    return c.json(insertedData, 201);
  })
  .get(vValidator("query", transactionQuerySchema), async (c) => {
    const db = c.get("db");
    const { sub } = c.get("jwtPayload");
    const { description, tag, type } = c.req.valid("query");

    const whereConditions = [
      eq(transactions.userId, sub),
      isNull(transactions.deletedAt),
    ];

    if (description) {
      whereConditions.push(like(transactions.description, `%${description}%`));
    }

    if (type) {
      whereConditions.push(eq(transactions.type, type));
    }

    let paginatedTransactions;

    if (tag) {
      paginatedTransactions = db
        .select({
          id: transactions.id,
          type: transactions.type,
          value: transactions.value,
          description: transactions.description,
          date: transactions.date,
        })
        .from(transactions)
        .innerJoin(
          tagsToTransactions,
          eq(tagsToTransactions.transactionId, transactions.id),
        )
        .innerJoin(tags, eq(tags.id, tagsToTransactions.tagId))
        .where(and(...whereConditions, eq(tags.id, tag)))
        .orderBy(desc(transactions.date))
        .limit(15)
        .as("transactions");
    } else {
      paginatedTransactions = db
        .select({
          id: transactions.id,
          type: transactions.type,
          value: transactions.value,
          description: transactions.description,
          date: transactions.date,
        })
        .from(transactions)
        .where(and(...whereConditions))
        .orderBy(desc(transactions.date))
        .limit(15)
        .as("transactions");
    }

    const query = db
      .select({
        id: transactions.id,
        type: transactions.type,
        value: transactions.value,
        description: transactions.description,
        date: transactions.date,
        tag: tags.name,
      })
      .from(paginatedTransactions)
      .leftJoin(
        tagsToTransactions,
        eq(tagsToTransactions.transactionId, transactions.id),
      )
      .leftJoin(tags, eq(tags.id, tagsToTransactions.tagId));

    const userTransactions = await query;

    const aggregatedData = userTransactions.reduce((acc, curr) => {
      const { tag, ...transaction } = curr;
      const existing = acc.get(transaction.id);
      if (existing && tag && !existing.tags.includes(tag)) {
        existing.tags.push(tag);
      } else {
        const tags = tag ? [tag] : [];
        acc.set(transaction.id, { ...transaction, tags });
      }
      return acc;
    }, new Map<string, Transaction>());

    return c.json(aggregatedData.values().toArray());
  });

router.get("/:id", vValidator("param", idSchema), async (c) => {
  const db = c.get("db");
  const { sub } = c.get("jwtPayload");

  const { id } = c.req.valid("param");
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, sub)));

  if (!transaction) {
    throw new HTTPException(404, { message: "Transação não encontrada" });
  }

  return c.json(transaction);
});

export default router;
