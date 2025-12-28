import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@/generated/prisma/client";
import type { PrismaClient as PrismaClientType } from "@/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

function resolveSqliteFilePath(databaseUrl: string | undefined) {
  const fallback = path.join(process.cwd(), "dev.db");
  if (!databaseUrl) return fallback;

  if (databaseUrl.startsWith("file:")) {
    const raw = databaseUrl.slice("file:".length);
    if (raw.startsWith("./")) return path.join(process.cwd(), raw.slice(2));
    if (raw.startsWith("/")) return raw.slice(1);
    return raw || fallback;
  }

  return databaseUrl;
}

const sqliteFilePath = resolveSqliteFilePath(process.env["DATABASE_URL"]);
const adapter = new PrismaBetterSqlite3({ url: sqliteFilePath });

export const prisma =
  globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env["NODE_ENV"] !== "production") {
  globalThis.prisma = prisma;
}

// Force rebuild of Prisma Client imports
