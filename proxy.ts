import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. CEK SUSPEND
    if (token?.isSuspended) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Account suspended." }, { status: 403 });
      }
    }

    // 🚀 2. PROTEKSI VERIFIKASI EMAIL (BLOKIR AKSES KE CHECKOUT & ACCOUNT)
    const protectedCustomerPaths = ["/checkout", "/account", "/orders"];
    const isCustomerProtected = protectedCustomerPaths.some((prefix) => path.startsWith(prefix));

    if (isCustomerProtected && token && !token.emailVerified) {
      // Tendang mereka ke halaman peringatan verifikasi
      return NextResponse.redirect(new URL("/verify-notice", req.url));
    }

    // 3. CEGAH USER LOGIN MASUK KE AREA (auth)
    const authPaths = ["/register", "/forgot-password", "/reset-password"];
    const isAuthPath = authPaths.some((prefix) => path.startsWith(prefix));
    
    if (isAuthPath && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 4. PROTEKSI KHUSUS ADMIN
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      if (token?.role !== "SUPER_ADMIN") {
        if (path.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        const authPaths = ["/register", "/forgot-password", "/reset-password"];
        if (authPaths.some((prefix) => path.startsWith(prefix))) return true;

        const protectedPaths = [
          "/checkout", 
          "/account", 
          "/orders",        
          "/admin", 
          "/api/admin",
          "/api/rajaongkir" 
        ];
        
        const isProtected = protectedPaths.some((prefix) => path.startsWith(prefix));

        if (isProtected) {
          if (token?.isSuspended) return false; 
          return !!token; 
        }

        return true; 
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/admin/:path*",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/checkout/:path*",
    "/account/:path*",
    "/orders/:path*",
    "/api/rajaongkir/:path*"
  ],
};