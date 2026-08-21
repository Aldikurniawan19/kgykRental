import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { ensureDbInitialized } from "@/lib/db-init";

export const authOptions: NextAuthOptions = {
  providers: [
    // Standard User Authentication Provider
    CredentialsProvider({
      id: "user-credentials",
      name: "User Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await ensureDbInitialized();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });

        if (!user) {
          throw new Error("Email atau password tidak terdaftar.");
        }

        if (user.password !== credentials.password) {
          throw new Error("Email atau password salah.");
        }

        return {
          id: String(user.id),
          name: user.fullName,
          email: user.email,
          phone: user.phone || "",
          role: "USER",
        };
      },
    }),

    // Admin Authentication Provider
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await ensureDbInitialized();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password admin wajib diisi.");
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        let validAdminEmail = "admin@kgyk.com";
        let validAdminPassword = "admin123";

        try {
          const rows: any[] = await prisma.$queryRawUnsafe(
            `SELECT "adminEmail", "adminPassword" FROM "Setting" WHERE "id" = 1`
          );
          if (rows && rows.length > 0) {
            if (rows[0]?.adminEmail) validAdminEmail = String(rows[0].adminEmail).trim().toLowerCase();
            if (rows[0]?.adminPassword) validAdminPassword = String(rows[0].adminPassword);
          } else {
            const setting: any = await prisma.setting.findUnique({ where: { id: 1 } });
            if (setting?.adminEmail) validAdminEmail = setting.adminEmail.trim().toLowerCase();
            if (setting?.adminPassword) validAdminPassword = setting.adminPassword;
          }
        } catch (err) {
          console.error("Failed to fetch admin settings for NextAuth:", err);
          try {
            const setting: any = await prisma.setting.findUnique({ where: { id: 1 } });
            if (setting?.adminEmail) validAdminEmail = setting.adminEmail.trim().toLowerCase();
            if (setting?.adminPassword) validAdminPassword = setting.adminPassword;
          } catch {}
        }

        if (
          (email === validAdminEmail || email === "admin") &&
          password === validAdminPassword
        ) {
          return {
            id: "admin-1",
            name: "Admin Operasional KGYK",
            email: validAdminEmail,
            phone: "+62 881-0233-31644",
            role: "ADMIN",
          };
        }

        throw new Error("Kredensial admin tidak valid.");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.phone = (user as any).phone || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "kgykrental-secret-key-2026",
};

export default NextAuth(authOptions);
