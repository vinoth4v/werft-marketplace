import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// Next 16 calls this convention "proxy"; it is what earlier versions called
// middleware, and it still runs before every matched request.
export default NextAuth(authConfig).auth

/**
 * Everything is private unless listed here. Closed by default is the whole
 * point of the single-user gate: a new route is protected because it exists,
 * not because someone remembered to protect it.
 *
 * api/registry is the one deliberate exception: it has its own bearer-token
 * check (see /api/registry/upsert), independent of this session gate, and
 * every other app's CI — which has no session — has to be able to reach it.
 */
export const config = {
  matcher: ["/((?!api/auth|api/registry|login|_next/static|_next/image|favicon.ico|icon.svg).*)"],
}
