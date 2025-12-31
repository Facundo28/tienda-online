import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("tienda_session")?.value;
  const { pathname } = request.nextUrl;

  // 1. Define Protected Routes
  const protectedPaths = ["/admin", "/logistics", "/delivery", "/account"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // 2. Define Auth Routes (Guest Only)
  const authPaths = ["/login", "/register"];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // Case A: Accessing Protected Route WITHOUT Session
  // Action: Redirect to Login
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    // Optional: Add ?returnUrl=... to support redirecting back after login
    // loginUrl.searchParams.set("returnUrl", pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // Case B: Accessing Auth Page WITH Session
  // Action: Redirect to Dashboard/Home (prevent double login)
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Case C: Allowed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
