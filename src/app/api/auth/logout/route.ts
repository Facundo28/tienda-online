import crypto from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "tienda_session";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = sha256(token);
    await prisma.session
      .delete({ where: { tokenHash } })
      .catch(() => undefined);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
  return res;
}
