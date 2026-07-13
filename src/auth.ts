import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  logger: {
    error(error: any) {
      if (error?.name !== "JWTSessionError") {
        // Log real errors somewhere else, but not via console.error/warn
      }
    },
  },
  ...authConfig,
});
