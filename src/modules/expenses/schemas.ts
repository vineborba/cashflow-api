import * as v from "valibot";

import { insertExpenseSchema } from "@app/db/schemas/expense.schema";

export const newExpenseSchema = v.object({
  description: insertExpenseSchema.entries.description,
  observation: insertExpenseSchema.entries.observation,
  value: insertExpenseSchema.entries.value,
  date: v.pipe(
    v.string(),
    v.transform((v) => new Date(v)),
    insertExpenseSchema.entries.date,
  ),
});
