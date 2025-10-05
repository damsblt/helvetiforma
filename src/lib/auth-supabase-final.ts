import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const supabaseAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔍 Supabase Auth - Credentials received:', { 
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('🔍 Missing credentials - returning null')
          return null
        }

        try {
          console.log('🔍 Starting Supabase query for user:', credentials.email)
          
          // Vérifier l'utilisateur dans Supabase
          const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', credentials.email)
            .single()

          console.log('🔍 Supabase query result:', { 
            userFound: !!user,
            error: error?.message,
            userId: user?.id
          })

          if (error || !user) {
            console.log('🔍 No user found with email:', credentials.email)
            return null
          }

          // Vérifier le mot de passe
          const isValid = await bcrypt.compare(credentials.password, user.password_hash)
          
          if (!isValid) {
            console.log('🔍 Password mismatch for user:', user.email)
            return null
          }

          console.log('🔍 Password match - User authorized:', { id: user.id, email: user.email })
          
          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`.trim() || user.email
          }
        } catch (error) {
          console.error('🔍 Supabase Auth error:', error)
          return null
        }
      }
    })
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
    }
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error('NextAuth Error:', code, metadata)
    },
    warn: (code) => {
      console.warn('NextAuth Warning:', code)
    },
    debug: (code, metadata) => {
      console.log('NextAuth Debug:', code, metadata)
    }
  }
}

// Fonction pour créer un utilisateur dans Supabase
export async function createSupabaseUser(userData: {
  email: string
  password: string
  first_name?: string
  last_name?: string
}) {
  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .single()
    
    if (existingUser) {
      return { success: false, error: 'Un utilisateur avec cet email existe déjà' }
    }
    
    // Créer l'utilisateur
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        email: userData.email,
        password_hash: hashedPassword,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erreur création utilisateur Supabase:', error)
      return { success: false, error: 'Erreur lors de la création du compte' }
    }
    
    console.log('✅ Utilisateur créé dans Supabase:', {
      userId: data.id,
      email: data.email
    })
    
    return { success: true, userId: data.id }
    
  } catch (error) {
    console.error('Erreur création utilisateur:', error)
    return { success: false, error: 'Erreur interne du serveur' }
  }
}

// Fonction pour vérifier les achats dans Supabase
export async function checkUserPurchaseSupabase(userId: string, postId: string): Promise<boolean> {
  try {
    console.log('🔍 checkUserPurchaseSupabase called with:', { userId, postId })
    
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('status', 'completed')
    
    if (error) {
      console.error('Erreur vérification achat Supabase:', error)
      return false
    }
    
    console.log('🔍 checkUserPurchaseSupabase result:', { 
      found: purchases.length > 0, 
      count: purchases.length
    })
    
    return purchases.length > 0
  } catch (error) {
    console.error('Erreur lors de la vérification des achats Supabase:', error)
    return false
  }
}

// Fonction pour enregistrer un achat dans Supabase
export async function recordPurchaseSupabase(purchaseData: {
  userId: string
  postId: string
  postTitle: string
  amount: number
  stripeSessionId?: string
  stripePaymentIntentId?: string
}) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        user_id: purchaseData.userId,
        post_id: purchaseData.postId,
        post_title: purchaseData.postTitle,
        amount: purchaseData.amount,
        currency: 'chf',
        stripe_session_id: purchaseData.stripeSessionId,
        stripe_payment_intent_id: purchaseData.stripePaymentIntentId,
        status: 'completed',
        purchased_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erreur enregistrement achat Supabase:', error)
      return { success: false, error: 'Erreur lors de l\'enregistrement de l\'achat' }
    }
    
    console.log('✅ Achat enregistré dans Supabase:', {
      purchaseId: data.id,
      userId: data.user_id,
      postId: data.post_id,
      amount: data.amount
    })
    
    return { success: true, purchaseId: data.id }
    
  } catch (error) {
    console.error('Erreur enregistrement achat:', error)
    return { success: false, error: 'Erreur interne du serveur' }
  }
}
