import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const workingAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔍 Credentials received:', { email: credentials?.email })
        
        // For testing, accept any credentials
        if (credentials?.email) {
          const user = {
            id: "1",
            email: credentials.email,
            name: "Test User"
          }
          console.log('🔍 User authorized:', user)
          return user
        }
        console.log('🔍 No credentials provided')
        return null
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      console.log('🔍 Session callback:', { session, token })
      // Add user ID to session
      if (token?.sub && session.user) {
        (session.user as any).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      console.log('🔍 JWT callback:', { token, user })
      // Persist user ID in token
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  debug: true,
}
