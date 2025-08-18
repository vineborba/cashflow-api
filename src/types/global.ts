import type { JwtVariables } from "hono/jwt";
import type { DbClient } from "@app/db/client";
import type { EmailClient } from "@app/lib/email/client";

type JwtData = {
  sub: string;
};

export type Settings = {
  app: ApplicationSettings;
  db: DatabaseSettings;
  email: EmailSettings;
  secrets: Secrets;
};

export type AppEnvironment = "test" | "development" | "production";

export type ApplicationSettings = {
  environment: AppEnvironment;
  corsOrigins: string | string[];
  host: string;
};

export type DatabaseSettings = {
  url: string;
  token: string;
};

export type EmailSettings = {
  sender: string;
  key: string;
  serverUrl: string;
};

export type Secrets = {
  jwt: string;
  resetPassword: string;
  newAccount: string;
};

export type Bindings = {
  APP_ENVIRONMENT: string;
  APP_CORS_ORIGINS: string;
  APP_HOST: string;
  DB_AUTH_TOKEN: string;
  DB_URL: string;
  EMAIL_KEY: string;
  EMAIL_SENDER: string;
  EMAIL_HOST: string;
  SECRETS_JWT: string;
  SECRETS_NEW_ACCOUNT: string;
  SECRETS_RESET_PASSWORD: string;
};

export type ServerContext = {
  Bindings: Bindings;
  Variables: {
    settings: Settings;
    db: DbClient;
    emailClient: EmailClient;
    jwtSecret: string;
    newAccountSecret: string;
    resetPasswordSecret: string;
    devMode: boolean;
  } & JwtVariables<JwtData>;
};
