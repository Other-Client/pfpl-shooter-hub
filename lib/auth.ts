import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const name = String(credentials.name || "").trim();
        const password = credentials.password;

        await connectDB();

        let shooter = await Shooter.findOne({ email });

        if (!shooter) {
          if (!name) {
            // Require name for first-time signup
            throw new Error("Please provide your name to create an account.");
          }

          const hash = await bcrypt.hash(password, 10);
          shooter = await Shooter.create({
            name,
            email,
            passwordHash: hash,
            role: "shooter",
          });
        } else {
          const isValid = await bcrypt.compare(password, shooter.passwordHash);
          if (!isValid) {
            throw new Error("Invalid email or password.");
          }
        }

        return {
          id: shooter._id.toString(),
          name: shooter.name,
          email: shooter.email,
          role: shooter.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
