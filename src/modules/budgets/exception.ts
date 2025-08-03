import { HTTPException } from "hono/http-exception";

export class InvalidBudgetTags extends HTTPException {
  constructor() {
    super(400, {
      message: "Uma tag inválida foi usada para registrar o orçamento.",
    });
  }
}
