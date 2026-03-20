import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  logger: {
    error(error: any) {
      if (error?.name === "JWTSessionError") {
        console.warn("AVISO: Detectado cookie inválido/antigo de autenticação (JWTSessionError). Ignorando para não travar a tela.");
      } else {
        console.error(error);
      }
    },
  },
  ...authConfig,
});
