import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuthPage = req.nextUrl.pathname.startsWith("/register");

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      if (token?.role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/register")) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/register"],
};