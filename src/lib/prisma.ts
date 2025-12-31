import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@/generated/prisma/client";
import type { PrismaClient as PrismaClientType } from "@/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

function resolveSqliteFilePath(databaseUrl: string | undefined) {
  // FIX: Force check root directory first for dev.db
  // This resolves issues where Next.js execution context differs from project root
  const rootDbPath = path.join(process.cwd(), "dev.db");
  return rootDbPath;
}

const sqliteFilePath = resolveSqliteFilePath(process.env["DATABASE_URL"]);
const adapter = new PrismaBetterSqlite3({ url: sqliteFilePath });

export const prisma =
  globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env["NODE_ENV"] !== "production") {
  globalThis.prisma = prisma;
}
