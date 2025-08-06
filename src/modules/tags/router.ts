import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import { and, eq, getTableColumns } from "drizzle-orm";

import { tags } from "@app/db/schemas";
import type { ServerContext } from "@app/types/global";
import { idSchema } from "@app/shared/schema";

import { newTagSchema } from "./schema";

const router = new Hono<ServerContext>();

router
  .get("/", async (c) => {
    const db = c.get("db");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const { name, id } = getTableColumns(tags);
    const userTags = await db
      .select({ name, id })
      .from(tags)
      .where(eq(tags.userId, sub));

    return c.json(userTags);
  })
  .post(vValidator("json", newTagSchema), async (c) => {
    const db = c.get("db");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const data = c.req.valid("json");
    const { name, id } = getTableColumns(tags);
    const [insertedTag] = await db
      .insert(tags)
      .values({
        name: data.name,
        userId: sub,
      })
      .returning({ name, id });

    return c.json(insertedTag, 201);
  });

router.delete("/:id", vValidator("param", idSchema), async (c) => {
  const db = c.get("db");
  const { sub } = c.get("jwtPayload");
  const { id } = c.req.valid("param");

  await db.delete(tags).where(and(eq(tags.userId, sub), eq(tags.id, id)));

  return c.body(null, 204);
});

export default router;
