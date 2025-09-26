import AuthWrapper from '@/components/tutor/AuthWrapper';
import TutorIframe from '@/components/tutor/TutorIframe';

export default function CheckoutPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Validation de la commande
            </h1>
            <p className="text-lg text-gray-600">
              Finalisez votre achat et accédez immédiatement à vos formations
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <TutorIframe 
              slug="validation-de-la-commande" 
              title="Checkout HelvetiForma"
              height="700px"
            />
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-blue-900 mb-1">Sécurisé</h3>
              <p className="text-sm text-blue-700">Paiement SSL crypté</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-green-900 mb-1">Instantané</h3>
              <p className="text-sm text-green-700">Accès immédiat</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-purple-900 mb-1">Garantie</h3>
              <p className="text-sm text-purple-700">Satisfaction garantie</p>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
