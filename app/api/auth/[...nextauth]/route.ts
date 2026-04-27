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
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/register',
  },

  providers: [
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
          emailVerified: new Date(),
        }
      }
    }),

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
          emailVerified: user.emailVerified,
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
        token.emailVerified = (user as any).emailVerified;
        token.lastChecked = Date.now();
      }


      const TWO_MINUTES = 2 * 60 * 1000;
      const now = Date.now();

      if (!token.lastChecked || (now - (token.lastChecked as number)) > TWO_MINUTES) {
        if (token.sub) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { isSuspended: true, emailVerified: true }
          });

          token.isSuspended = dbUser?.isSuspended || false;
          token.emailVerified = dbUser?.emailVerified;
          token.lastChecked = now;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.isSuspended) {
        (session as any).isSuspended = true;
        session.user = undefined as any;
      } else if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).emailVerified = token.emailVerified;
        (session as any).isSuspended = false;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };