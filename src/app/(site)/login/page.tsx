import { Metadata } from 'next'
import { signIn } from '@/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Connexion - HelvetiForma',
  description: 'Connectez-vous pour accéder aux webinaires gratuits Microsoft Teams',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">
            Connectez-vous avec votre compte Microsoft pour accéder aux webinaires gratuits
          </p>
        </div>

        {/* Error Message */}
        {params.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">
              {params.error === 'OAuthSignin' && 'Erreur lors de la connexion avec Microsoft'}
              {params.error === 'OAuthCallback' && 'Erreur de callback OAuth'}
              {params.error === 'OAuthCreateAccount' && 'Erreur lors de la création du compte'}
              {params.error === 'Callback' && 'Erreur de redirection'}
              {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'Callback'].includes(params.error) && 
                'Une erreur est survenue lors de la connexion'}
            </p>
          </div>
        )}

        {/* Microsoft Sign In Button */}
        <form
          action={async () => {
            'use server'
            await signIn('microsoft-entra-id', {
              redirectTo: params.callbackUrl || '/calendrier',
            })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 11H0V0h11v11z" fill="#F25022"/>
              <path d="M23 11H12V0h11v11z" fill="#7FBA00"/>
              <path d="M11 23H0V12h11v11z" fill="#00A4EF"/>
              <path d="M23 23H12V12h11v11z" fill="#FFB900"/>
            </svg>
            Se connecter avec Microsoft
          </button>
        </form>

        {/* Info */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Vous n'avez pas de compte Microsoft ?{' '}
            <a
              href="https://signup.microsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Créez-en un gratuitement
            </a>
          </p>
        </div>

        {/* Features */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Après connexion, vous pourrez :
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Vous inscrire aux webinaires gratuits</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Recevoir les liens Teams directement</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Gérer vos inscriptions en un clic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

