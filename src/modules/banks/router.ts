import { Hono } from "hono";

import { ServerContext } from "@app/types/global";
import { banks } from "@app/db/schemas";

const router = new Hono<ServerContext>();

router.get("/", async (c) => {
  const db = c.get("db");
  const banksList = await db
    .select({
      code: banks.id,
      name: banks.name,
    })
    .from(banks);

  return c.json(banksList);
});

export default router;
