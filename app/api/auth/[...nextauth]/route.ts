import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  // 1. Hubungkan NextAuth dengan Prisma
  adapter: PrismaAdapter(prisma) as any,

  // 2. Gunakan strategi JWT untuk performa maksimal (tanpa query database terus-menerus)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Hari
  },

  // 3. Arahkan halaman login ke halaman custom kita
  pages: {
    signIn: '/register', // Karena kita menggabungkan Login & Register di halaman ini
  },

  // 4. Konfigurasi Provider (Metode Login)
  providers: [
    // --- A. GOOGLE LOGIN ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'CUSTOMER', // Pendaftar via Google otomatis jadi Customer
          permissions: [],
        }
      }
    }),

    // --- B. EMAIL & PASSWORD LOGIN ---
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        // Cari user di database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Email tidak terdaftar atau login menggunakan Google");
        }

        // Verifikasi Password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        // Jika sukses, kembalikan data user ke dalam token
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        };
      }
    })
  ],

  // 5. Callbacks: Menyuntikkan Role & Permission ke Sesi Frontend
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).id = token.sub;
      }
      return session;
    }
  },

  // Kunci Rahasia
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };