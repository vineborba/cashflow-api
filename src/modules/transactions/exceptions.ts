import { HTTPException } from "hono/http-exception";

export class InvalidTransactionTags extends HTTPException {
  constructor() {
    super(400, {
      message:
        "Uma ou mais tags fornecidas não existem ou não pertencem ao usuário",
    });
  }
}
