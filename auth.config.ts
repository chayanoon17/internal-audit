import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage =
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register")

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/board", request.url))
        return true
      }

      return isLoggedIn
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as Record<string, unknown>).role as string
        token.departmentId = (user as Record<string, unknown>).departmentId as string | null
        token.departmentName = (user as Record<string, unknown>).departmentName as string | null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.departmentId = token.departmentId as string | null
        session.user.departmentName = token.departmentName as string | null
      }
      return session
    },
  },
} satisfies NextAuthConfig
