import * as v from "valibot";

import { insertTransactionSchema } from "@app/db/schemas/transactions.schema";

export const newTransactionSchema = v.object({
  type: insertTransactionSchema.entries.type,
  description: insertTransactionSchema.entries.description,
  observation: insertTransactionSchema.entries.observation,
  value: insertTransactionSchema.entries.value,
  accountId: insertTransactionSchema.entries.accountId,
  date: v.pipe(
    v.string(),
    v.transform((v) => new Date(v)),
    insertTransactionSchema.entries.date,
  ),
  tags: v.array(
    v.pipe(v.string(), v.uuid("Cada tag deve ser um UUID válido")),
    "Tags deve ser um array de UUIDs",
  ),
});

export const transactionQuerySchema = v.object({
  description: v.optional(
    v.union([
      v.literal(""),
      v.pipe(
        v.string(),
        v.minLength(5, "Deve conter pelo menos 5 caracteres"),
        v.maxLength(120, "Deve conter no máximo 120 caracteres"),
      ),
    ]),
  ),
  tag: v.optional(
    v.union([
      v.literal(""),
      v.pipe(v.string(), v.uuid("Deve ser um UUID válido")),
    ]),
  ),
  type: v.optional(
    v.union([
      v.literal(""),
      v.pipe(
        v.string(),
        v.picklist(
          ["income", "expense"],
          "Tipo deve ser 'income' ou 'expense'",
        ),
      ),
    ]),
  ),
});
