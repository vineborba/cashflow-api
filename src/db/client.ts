import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import type { Settings } from "@app/types/global";

import * as schema from "./schemas/schema";

export function connectDatabase(settings: Settings) {
  const client = createClient({
    url: settings.db.url,
    authToken: settings.db.token,
  });

  return drizzle({
    client,
    schema,
    casing: "snake_case",
  });
}

export type DbClient = ReturnType<typeof connectDatabase>;
