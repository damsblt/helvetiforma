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
        console.log('🔍 AUTHORIZE CALLED - Credentials received:', { 
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('🔍 Missing credentials - returning null')
          return null
        }

        try {
          console.log('🔍 Starting Sanity query for user:', credentials.email)
          
          // Check if user exists in Sanity
          const { sanityClient } = await import('@/lib/sanity')
          
          const users = await sanityClient.fetch(
            `*[_type == "user" && email == $email]`,
            { 
              email: credentials.email
            }
          )

          console.log('🔍 Sanity query result:', { 
            userCount: users.length,
            users: users.map((u: any) => ({ id: u._id, email: u.email, hasPassword: !!u.password }))
          })

          if (users.length > 0) {
            const user = users[0]
            
            // Check password
            if (user.password === credentials.password) {
              console.log('🔍 Password match - User authorized:', { id: user._id, email: user.email })
              return {
                id: user._id,
                email: user.email,
                name: user.name || user.email
              }
            } else {
              console.log('🔍 Password mismatch for user:', user.email)
              return null
            }
          }

          console.log('🔍 No user found with email:', credentials.email)
          return null
        } catch (error) {
          console.error('🔍 Auth error:', error)
          return null
        }
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
