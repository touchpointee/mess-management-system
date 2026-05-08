import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@/lib/constants";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req });

  if (path === "/admin/login") {
    if (token?.role === Role.ADMIN) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.rewrite(new URL("/admin-login", req.url));
  }

  if (path === "/admin" || path.startsWith("/admin/")) {
    if (token?.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (path === "/delivery/login") {
    if (token?.role === Role.DELIVERY_PARTNER || token?.role === Role.ADMIN) {
      return NextResponse.redirect(new URL("/delivery/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (path === "/delivery" || path.startsWith("/delivery/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/delivery/login", req.url));
    }
    if (token.role !== Role.DELIVERY_PARTNER && token.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/my-mess", req.url));
    }
    return NextResponse.next();
  }

  if (path === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role === Role.ADMIN) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (token.role === Role.DELIVERY_PARTNER) {
      return NextResponse.redirect(new URL("/delivery/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/my-mess", req.url));
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
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }
  if (customerProtected.includes(path)) {
    if (token?.role === Role.ADMIN) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (token?.role === Role.DELIVERY_PARTNER) {
      return NextResponse.redirect(new URL("/delivery/dashboard", req.url));
    }
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
    "/delivery/:path*",
    "/delivery",
    "/admin/:path*",
    "/admin",
    "/admin-login",
    "/login",
    "/register",
  ],
};
