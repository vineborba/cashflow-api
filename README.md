# Cashflow API

REST API for **Cashflow**, a personal finance app: bank accounts, transactions,
tags and monthly budgets. Built as my undergraduate capstone project (TCC) in
Information Systems.

It runs on **Cloudflare Workers** and stores data in **Turso** (libSQL), so the
whole backend is serverless and edge-deployed. The web client lives in
[cashflow-front](https://github.com/vineborba/cashflow-front).

## Stack

- **[Hono](https://hono.dev)** on Cloudflare Workers, TypeScript
- **[Drizzle ORM](https://orm.drizzle.team)** + **Turso / libSQL**, with versioned SQL migrations
- **[Valibot](https://valibot.dev)** for request validation, with schemas derived from the database tables via `drizzle-valibot`
- **Web Crypto API** for password hashing (no native dependencies, so it runs on the Workers runtime)
- **Wrangler** for local development and deployment

## Features

- **Accounts** linked to Brazilian banks, each with its own balance
- **Transactions** (income/expense) that update the account balance inside a database transaction
- **Tags** to categorise transactions — every new user gets a default set
- **Budgets** with a monthly spending cap, tracked against the current month's tagged expenses
- **Authentication**: sign-up with email activation, sign-in, password reset and change

## Design notes

- **Auth**: passwords are hashed with PBKDF2-SHA256 (100k iterations, random
  salt). Sessions are JWTs in an `httpOnly`, `SameSite=Lax` cookie. Activation
  and password-reset links use short-lived tokens (30 min), each signed with
  its own secret, so leaking one kind of token doesn't compromise the others.
- **Money** is stored as integer cents, avoiding floating-point rounding.
- **Multi-tenancy**: every query is scoped to the authenticated user (`sub`
  from the JWT); tag ownership is checked before tags are attached to
  transactions or budgets.
- **Pagination**: the transaction list is paginated and filterable by period,
  with totals in `X-Total-Count` / `X-Total-Pages` headers (exposed via CORS).
- **Middleware**: request IDs, secure headers, logging and CORS with
  configurable origins.

## Project structure

```
src/
  app.ts            Hono app: settings, middlewares, public and private routes
  db/schemas/       Drizzle tables, relations and insert schemas
  lib/auth.ts       password hashing (Web Crypto)
  lib/email/        email client and templates (activation, password reset)
  modules/<name>/   router + validation schemas + exceptions per resource
drizzle/            generated SQL migrations
yaak/               API collection for the Yaak HTTP client
```

## Running locally

Requires Node.js, pnpm and a Turso database (or a local libSQL server).

```sh
pnpm install
cp .dev.vars.example .dev.vars   # fill in the values below
pnpm migration:run               # needs DB_URL and DB_AUTH_TOKEN in the environment
pnpm dev                         # wrangler dev
```

Environment variables (`.dev.vars` locally, Worker secrets in production):

| Variable | Purpose |
|---|---|
| `APP_HOST` | Public URL of the web client, used in email links |
| `APP_CORS_ORIGINS` | Allowed origins, comma-separated |
| `APP_ENVIRONMENT` | `development` or `production` (enables secure cookies) |
| `DB_URL`, `DB_AUTH_TOKEN` | Turso / libSQL connection |
| `EMAIL_HOST`, `EMAIL_KEY`, `EMAIL_SENDER` | Transactional email provider API |
| `SECRETS_JWT` | Signs session tokens |
| `SECRETS_NEW_ACCOUNT` | Signs account-activation tokens |
| `SECRETS_RESET_PASSWORD` | Signs password-reset tokens |

Deploy with `pnpm deploy`.
