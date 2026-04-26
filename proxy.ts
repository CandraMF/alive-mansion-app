import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. CEGAH USER LOGIN MASUK KE AREA (auth)
    const authPaths = ["/register", "/forgot-password", "/reset-password"];
    const isAuthPath = authPaths.some((prefix) => path.startsWith(prefix));
    
    if (isAuthPath && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. PROTEKSI KHUSUS ADMIN
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      if (token?.role !== "ADMIN") {
        // Jika request berupa API, return JSON 403 Forbidden. Jika halaman web, redirect ke Home.
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

        // Biarkan halaman auth lewat (karena validasi loginnya di-handle fungsi proxy di atas)
        const authPaths = ["/register", "/forgot-password", "/reset-password"];
        if (authPaths.some((prefix) => path.startsWith(prefix))) return true;

        // 🚀 DAFTAR RUTE (protected) YANG WAJIB PUNYA TOKEN (CUSTOMER & ADMIN)
        const protectedPaths = [
          "/checkout", 
          "/account", 
          "/orders",        // <-- Celah tertutup: Orders sekarang aman
          "/admin", 
          "/api/admin",
          "/api/rajaongkir" // <-- Celah API terekspos tertutup
        ];
        
        const isProtected = protectedPaths.some((prefix) => path.startsWith(prefix));

        if (isProtected) {
          return !!token; // Akan return 401 Unauthorized jika tidak ada session valid
        }

        // Biarkan rute lain lewat (termasuk public pages, cart, dan webhook xendit)
        return true; 
      },
    },
  }
);

// 🚀 MATCHER: Daftarkan semua rute (auth), (protected), dan admin agar diawasi satpam Proxy
export const config = {
  matcher: [
    // Area Admin
    "/admin/:path*", 
    "/api/admin/:path*",
    
    // Area Auth
    "/register",
    "/forgot-password",
    "/reset-password",
    
    // Area Customer
    "/checkout/:path*",
    "/account/:path*",
    "/orders/:path*",
    
    // API Sensitif Berbayar
    "/api/rajaongkir/:path*"
  ],
};