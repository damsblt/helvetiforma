import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const noEmailAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For testing, accept any credentials
        if (credentials?.email) {
          return {
            id: "1",
            email: credentials.email,
            name: "Test User"
          }
        }
        return null
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session
      if (token?.sub && session.user) {
        (session.user as any).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      // Persist user ID in token
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
}
