import * as v from "valibot";

import { insertIncomeSchema } from "@app/db/schemas/income.schema";

export const newIncomeSchema = v.object({
  description: insertIncomeSchema.entries.description,
  observation: insertIncomeSchema.entries.observation,
  value: insertIncomeSchema.entries.value,
  accountId: insertIncomeSchema.entries.accountId,
  date: v.pipe(
    v.string(),
    v.transform((v) => new Date(v)),
    insertIncomeSchema.entries.date,
  ),
});
