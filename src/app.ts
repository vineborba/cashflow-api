import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { requestId } from "hono/request-id";
import { jwt } from "hono/jwt";
import { cors } from "hono/cors";

import type { AppEnvironment, ServerContext } from "./types/global";
import { connectDatabase } from "./db/client";
import { EmailClient } from "./lib/email/client";
import constants from "./shared/constants";
import {
  accountsRouter,
  authRouter,
  banksRouter,
  budgetsRouter,
  healthRouter,
  tagsRouter,
  transactionsRouter,
  usersRouter,
} from "./modules";

export class Application {
  private app: Hono<ServerContext>;

  constructor() {
    this.app = new Hono<ServerContext>();

    this.parseSettings();
    this.injectRouterMiddlewares();
    this.registerRoutes();
  }

  get fetch() {
    return this.app.fetch;
  }

  private parseSettings() {
    this.app.use(async (c, next) => {
      const settings = {
        app: {
          host: c.env.APP_HOST,
          corsOrigins: c.env.APP_CORS_ORIGINS.includes(",")
            ? c.env.APP_CORS_ORIGINS.split(",")
            : c.env.APP_CORS_ORIGINS,
          environment: (c.env.APP_ENVIRONMENT ||
            "development") as AppEnvironment,
        },
        db: {
          token: c.env.DB_AUTH_TOKEN,
          url: c.env.DB_URL,
        },
        email: {
          key: c.env.EMAIL_KEY,
          sender: c.env.EMAIL_SENDER,
          serverUrl: c.env.EMAIL_HOST,
        },
        secrets: {
          jwt: c.env.SECRETS_JWT,
          newAccount: c.env.SECRETS_NEW_ACCOUNT,
          resetPassword: c.env.SECRETS_RESET_PASSWORD,
        },
      };
      c.set("settings", settings);
      await next();
    });
  }

  private injectRouterMiddlewares() {
    this.app.use(async (c, next) => {
      const settings = c.get("settings");
      const emailClient = new EmailClient(settings);
      const connection = connectDatabase(settings);
      c.set("emailClient", emailClient);
      c.set("db", connection);
      c.set("jwtSecret", settings.secrets.jwt);
      c.set("resetPasswordSecret", settings.secrets.resetPassword);
      c.set("newAccountSecret", settings.secrets.newAccount);
      c.set("devMode", settings.app.environment !== "production");
      await next();
    });

    this.app.use(async (c, next) => {
      const settings = c.get("settings");
      const corsMiddleware = cors({
        origin: settings.app.corsOrigins,
        credentials: true,
        exposeHeaders: [
          constants.HEADERS.TOTAL_COUNT,
          constants.HEADERS.TOTAL_PAGES,
        ],
      });
      return corsMiddleware(c, next);
    });

    this.app.use(logger());
    this.app.use("*", requestId());
    this.app.use("*", secureHeaders());
  }

  private registerRoutes() {
    this.registerPublicRoutes();
    this.registerPrivateRoutes();
  }

  private registerPublicRoutes() {
    this.app.route("/health", healthRouter);
    this.app.route("/auth", authRouter);
  }

  private registerPrivateRoutes() {
    this.app.use("*", (c, next) => {
      const jwtMiddleware = jwt({
        secret: c.get("jwtSecret"),
        cookie: "token",
      });
      return jwtMiddleware(c, next);
    });

    this.app.route("/users", usersRouter);
    this.app.route("/accounts", accountsRouter);
    this.app.route("/budgets", budgetsRouter);
    this.app.route("/transactions", transactionsRouter);
    this.app.route("/tags", tagsRouter);
    this.app.route("/banks", banksRouter);
  }
}
