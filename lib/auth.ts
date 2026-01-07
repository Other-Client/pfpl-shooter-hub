import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

// Define a custom user type to avoid 'any'
interface CustomUser extends User {
  id: string;
  role: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", // Correct: This triggers the JWT workflow
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
        if (!credentials?.email || !credentials.password) return null;

        await connectDB();
        const email = credentials.email.toLowerCase();
        let shooter = await Shooter.findOne({ email });

        if (!shooter) {
          if (!credentials.name) throw new Error("Name required for signup");
          
          const hash = await bcrypt.hash(credentials.password, 10);
          shooter = await Shooter.create({
            name: credentials.name,
            email,
            passwordHash: hash,
            role: "shooter",
          });
        } else {
          const isValid = await bcrypt.compare(credentials.password, shooter.passwordHash);
          if (!isValid) throw new Error("Invalid credentials");
        }

        // Return object must match the CustomUser interface
        return {
          id: shooter._id.toString(),
          name: shooter.name,
          email: shooter.email,
          role: shooter.role,
        } as CustomUser;
      },
    }),
  ],
  callbacks: {
    // 1. Initial login: 'user' is what you returned from authorize()
    // 2. Subsequent requests: 'user' is undefined, but 'token' persists
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as CustomUser).id;
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    // This passes data from the JWT to the frontend session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  // Recommended: Secret is required for production JWT signing
  secret: process.env.NEXTAUTH_SECRET,
};