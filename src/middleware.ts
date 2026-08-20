import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET || "kgykrental-secret-key-2026";
  const token = await getToken({ req, secret });
  const pathname = req.nextUrl.pathname;

  // 1. Protect Admin Routes (/admin, /admin/mobil, /admin/transaksi, /admin/pengaturan)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token || token.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Prevent logged in Admin from visiting /admin/login again
  if (pathname === "/admin/login" && token && token.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 3. Protect Customer Private Routes (/booking, /history)
  if (pathname.startsWith("/booking") || pathname.startsWith("/history")) {
    if (!token) {
      const homeUrl = new URL("/", req.url);
      homeUrl.searchParams.set("openLogin", "true");
      homeUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/booking",
    "/history",
  ],
};
