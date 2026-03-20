import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

export function proxy(request: Request) {
  return NextAuth(authConfig).auth(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
