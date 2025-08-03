import * as v from "valibot";

import { insertUserSchema } from "@app/db/schemas/user.schema";

export const updateUserInfoSchema = v.pick(insertUserSchema, ["name"]);

export const changePasswordSchema = v.object({
  newPassword: insertUserSchema.entries.password,
  oldPassword: insertUserSchema.entries.password,
});
