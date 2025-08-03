import * as v from "valibot";

import {
  insertUserSchema,
  selectUserSchema,
} from "@app/db/schemas/user.schema";
import { tokenSchema } from "@app/shared/schema";

export const signInSchema = v.pick(selectUserSchema, ["email", "password"]);

export const signUpSchema = v.object({
  name: insertUserSchema.entries.name,
  password: insertUserSchema.entries.password,
  email: insertUserSchema.entries.email,
  terms: v.pipe(v.boolean(), v.literal(true)),
});

export const activateSchema = tokenSchema;

export const forgotPasswordSchema = v.pick(selectUserSchema, ["email"]);

export const resetPasswordSchema = v.object({
  token: tokenSchema.entries.token,
  password: insertUserSchema.entries.password,
});
