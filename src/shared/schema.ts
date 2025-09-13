import * as v from "valibot";

import defaults from "./defaults";

export const paginationSchema = v.object({
  limit: v.pipe(
    v.optional(v.string(), defaults.pagination.limit),
    v.decimal(),
    v.transform(Number),
    v.integer(),
  ),
  page: v.pipe(
    v.optional(v.string(), defaults.pagination.page),
    v.decimal(),
    v.transform(Number),
    v.integer(),
    v.minValue(1),
    v.transform((v) => v - 1),
  ),
});

export const querySortSchema = v.pipe(
  v.optional(v.string(), ""),
  v.rawCheck(({ addIssue, dataset }) => {
    if (dataset.typed && dataset.value) {
      const [prop, order] = dataset.value.toLowerCase().split("-");
      if (!prop || !order) {
        addIssue({
          message: "Parâmetro de ordenação inválido",
        });
      } else if (order !== "asc" && order !== "desc") {
        addIssue({
          message: "Sentido de ordenação inválido",
        });
      }
    }
  }),
);

export const idSchema = v.object({
  id: v.pipe(v.string(), v.uuid("ID inválido")),
});

export const tokenSchema = v.object({
  token: v.string(),
});
