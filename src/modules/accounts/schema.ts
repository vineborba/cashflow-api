import * as v from "valibot";

import { insertAccountSchema } from "@app/db/schemas/accounts.schema";

export const newAccountSchema = v.pick(insertAccountSchema, [
  "bankCode",
  "balance",
  "description",
  "type",
]);
