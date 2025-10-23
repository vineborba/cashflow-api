import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { vValidator } from "@hono/valibot-validator";
import { sign, verify } from "hono/jwt";
import { deleteCookie, setCookie } from "hono/cookie";

import * as auth from "@app/lib/auth";
import { users } from "@app/db/schemas/user.schema";
import { tags } from "@app/db/schemas/tags.schema";
import type { ServerContext } from "@app/types/global";

import {
  activateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";
import {
  EmailAlreadyInUserExeption,
  InvalidAuthExeption,
  UnauthorizedException,
  UnverifiedUserException,
} from "./exceptions";

// Create default tags for the new user
const DEFAULT_TAGS = [
  "Alimentação",
  "Carro",
  "Educação",
  "Salário",
  "Transporte",
  "Saúde",
  "Moradia",
  "Lazer",
  "Serviços",
  "Outros",
  "Streaming",
];

const router = new Hono<ServerContext>();

router.post("/sign-in", vValidator("json", signInSchema), async (c) => {
  const client = c.get("db");
  const data = c.req.valid("json");

  const [user] = await client
    .select({
      id: users.id,
      email: users.email,
      verified: users.verified,
      password: users.password,
    })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (!user) {
    throw new InvalidAuthExeption();
  }

  const passwordMatch = await auth.verifyPassword(user.password, data.password);

  if (!passwordMatch) {
    throw new InvalidAuthExeption();
  }

  if (!user.verified) {
    throw new UnverifiedUserException();
  }

  const token = await sign(
    {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    c.get("jwtSecret"),
  );

  setCookie(c, "token", token, {
    path: "/",
    secure: !c.get("devMode"),
    httpOnly: true,
    sameSite: "Lax",
  });

  return c.body(null, 200);
});

router.post("/sign-up", vValidator("json", signUpSchema), async (c) => {
  const client = c.get("db");
  const data = c.req.valid("json");

  const [existsSameEmail] = await client
    .select({ id: users.email })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existsSameEmail) {
    throw new EmailAlreadyInUserExeption();
  }

  const { password, ...insertData } = data;

  const [inserted] = await client
    .insert(users)
    .values({
      password: await auth.hashPassword(password),
      ...insertData,
    })
    .returning({
      email: users.email,
      id: users.id,
    });

  await client.insert(tags).values(
    DEFAULT_TAGS.map((tagName) => ({
      name: tagName,
      userId: inserted.id,
    })),
  );

  const token = await sign(
    {
      sub: inserted.id,
      email: inserted.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 30,
    },
    c.get("newAccountSecret"),
  );

  const emailClient = c.get("emailClient");
  await emailClient.sendAccountConfirmationEmail({
    token,
    to: inserted.email,
  });

  return c.body(null, 200);
});

router.post("/activate", vValidator("json", activateSchema), async (c) => {
  const client = c.get("db");
  const { token } = c.req.valid("json");

  const { sub, email } = await verify(token, c.get("newAccountSecret")).catch(
    (e) => {
      console.error("verify failed", e);

      throw new UnauthorizedException();
    },
  );

  if (!sub || !email) {
    throw new UnauthorizedException();
  }

  const [user] = await client
    .select()
    .from(users)
    .where(and(eq(users.id, sub as string), eq(users.email, email as string)))
    .limit(1);

  if (!user) {
    throw new UnauthorizedException();
  }

  await client
    .update(users)
    .set({ verified: true })
    .where(eq(users.id, sub as string));

  return c.body(null, 200);
});

router.post(
  "/forgot-password",
  vValidator("json", forgotPasswordSchema),
  async (c) => {
    const client = c.get("db");
    const { email: userEmail } = c.req.valid("json");

    const [user] = await client
      .select({ email: users.email, id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user) {
      return c.body(null, 204);
    }

    const token = await sign(
      {
        sub: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 30,
      },
      c.get("resetPasswordSecret"),
    );

    const emailClient = c.get("emailClient");
    await emailClient.sendResetPasswordEmail({
      token,
      to: user.email,
    });

    return c.body(null, 204);
  },
);

router.post(
  "/reset-password",
  vValidator("json", resetPasswordSchema),
  async (c) => {
    const client = c.get("db");
    const { token, password } = c.req.valid("json");

    const { sub, email } = await verify(
      token,
      c.get("resetPasswordSecret"),
    ).catch(() => {
      throw new UnauthorizedException();
    });

    if (!sub || !email) {
      throw new UnauthorizedException();
    }

    const [user] = await client
      .select()
      .from(users)
      .where(and(eq(users.id, sub as string), eq(users.email, email as string)))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException();
    }

    await client
      .update(users)
      .set({ password: await auth.hashPassword(password) })
      .where(eq(users.id, sub as string));

    return c.body(null, 200);
  },
);

router.post("/sign-out", (c) => {
  deleteCookie(c, "token", { path: "/" });
  return c.body(null, 204);
});

export default router;
