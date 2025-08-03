import * as v from "valibot";

import { insertBudgetSchema } from "@app/db/schemas/budgets.schema";

const newBudgetData = v.pick(insertBudgetSchema, ["name", "maxValue"]);

export const newBudgetSchema = v.object({
  ...newBudgetData.entries,
  tags: v.array(v.pipe(v.string(), v.uuid())),
});
