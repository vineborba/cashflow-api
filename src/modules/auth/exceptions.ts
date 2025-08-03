import { HTTPException } from "hono/http-exception";

export class InvalidAuthExeption extends HTTPException {
  constructor() {
    super(401, {
      message: "E-mail ou senha inválidos",
    });
  }
}

export class UnverifiedUserException extends HTTPException {
  constructor() {
    super(403, {
      message: "Usuário não verificado",
    });
  }
}

export class EmailAlreadyInUserExeption extends HTTPException {
  constructor() {
    super(400, {
      message: "E-mail inválido",
    });
  }
}

export class UnauthorizedException extends HTTPException {
  constructor() {
    super(401);
  }
}
