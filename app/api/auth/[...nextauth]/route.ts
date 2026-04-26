import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Hari
  },

  pages: {
    signIn: '/register',
  },

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
          role: 'CUSTOMER',
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Email tidak terdaftar atau login menggunakan Google");
        }

        // 🚀 PROTEKSI 1: Tolak jika akun sedang di-suspend (Email/Password)
        if (user.isSuspended) {
          throw new Error("Akun Anda telah ditangguhkan. Silakan hubungi admin.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

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

  callbacks: {
    // 🚀 PROTEKSI 2: Tolak jika akun di-suspend (Berlaku juga untuk Google Login)
    async signIn({ user }) {
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { isSuspended: true }
        });

        if (dbUser?.isSuspended) {
          // Akan melempar error kembali ke halaman login (URL: /register?error=...)
          throw new Error("Akun Anda telah ditangguhkan. Silakan hubungi admin.");
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // 1. Saat pertama kali login
      if (user) {
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isSuspended: true }
        });

        if (dbUser?.isSuspended) {
          return {};
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token || Object.keys(token).length === 0) {
        return { ...session, user: undefined as any };
      }

      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).id = token.sub;
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };