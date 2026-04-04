import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req });

  if (path === "/admin/login") {
    if (token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.rewrite(new URL("/admin-login", req.url));
  }

  if (path === "/admin" || path.startsWith("/admin/")) {
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (path === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.redirect(new URL("/overview", req.url));
  }

  // Old admin route-group URLs (from `app/(admin)/*`) — keep redirects for existing bookmarks.
  const legacyAdminPaths = [
    "/dashboard",
    "/customers",
    "/payments",
    "/settings",
    "/delivery-map",
  ];
  if (legacyAdminPaths.includes(path)) {
    return NextResponse.redirect(new URL(`/admin${path}`, req.url));
  }
  if (path.startsWith("/customers/")) {
    return NextResponse.redirect(
      new URL(`/admin${path}`, req.url)
    );
  }

  const customerProtected = ["/my-mess", "/overview", "/account"];
  if (customerProtected.includes(path) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/my-mess",
    "/overview",
    "/account",
    "/dashboard",
    "/customers",
    "/customers/:path*",
    "/payments",
    "/settings",
    "/delivery-map",
    "/admin/:path*",
    "/admin",
    "/admin-login",
    "/login",
    "/register",
  ],
};
