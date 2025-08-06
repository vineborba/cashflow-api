import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { vValidator } from "@hono/valibot-validator";
import { HTTPException } from "hono/http-exception";

import * as auth from "@app/lib/auth";
import { users } from "@app/db/schemas";
import type { ServerContext } from "@app/types/global";

import { changePasswordSchema, updateUserInfoSchema } from "./schemas";
import { ForbiddenException, UnauthorizedException } from "./exceptions";

const router = new Hono<ServerContext>();

router.get("/me", async (c) => {
  const client = c.get("db");
  const payload = c.get("jwtPayload");
  const { sub } = payload;

  const [userData] = await client
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, sub));

  if (!userData) {
    throw new UnauthorizedException();
  }

  return c.json({ data: userData });
});

router
  .put("/", vValidator("json", updateUserInfoSchema), async (c) => {
    const client = c.get("db");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const [exists] = await client
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, sub));

    if (!exists) {
      throw new ForbiddenException();
    }

    const data = c.req.valid("json");

    await client.update(users).set(data).where(eq(users.id, sub));

    return c.body(null, 204);
  })
  .delete(async (c) => {
    const client = c.get("db");
    const payload = c.get("jwtPayload");
    const { sub } = payload;

    const [exists] = await client
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, sub));

    if (!exists) {
      throw new UnauthorizedException();
    }

    await client.delete(users).where(eq(users.id, sub));

    return c.body(null, 204);
  });

router.put("/password", vValidator("json", changePasswordSchema), async (c) => {
  const client = c.get("db");
  const payload = c.get("jwtPayload");
  const { sub } = payload;

  const [exists] = await client
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, sub));

  if (!exists) {
    throw new UnauthorizedException();
  }

  const { newPassword, oldPassword } = c.req.valid("json");

  const passwordsMatch = await auth.verifyPassword(
    exists.password,
    oldPassword,
  );

  if (!passwordsMatch) {
    throw new HTTPException(400);
  }

  const newHash = await auth.hashPassword(newPassword);
  await client
    .update(users)
    .set({ password: newHash })
    .where(eq(users.id, sub));

  return c.body(null, 204);
});

export default router;
