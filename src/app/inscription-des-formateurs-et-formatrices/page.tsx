import TutorIframe from '@/components/tutor/TutorIframe';

export default function InstructorRegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Inscription des formateurs et formatrices
          </h1>
          <p className="text-lg text-gray-600">
            Rejoignez notre équipe de formateurs experts
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <TutorIframe 
            slug="inscription-des-formateurs-et-formatrices" 
            title="Inscription formateur HelvetiForma"
            height="700px"
          />
        </div>

        {/* Information Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">
              Devenir formateur
            </h3>
            <ul className="space-y-2 text-purple-800">
              <li>✓ Partagez votre expertise</li>
              <li>✓ Outils de création de contenu</li>
              <li>✓ Gestion simplifiée des cours</li>
              <li>✓ Rémunération attractive</li>
            </ul>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-orange-900 mb-4">
              Critères requis
            </h3>
            <ul className="space-y-2 text-orange-800">
              <li>• Expertise professionnelle reconnue</li>
              <li>• Expérience pédagogique appréciée</li>
              <li>• Connaissance du marché suisse</li>
              <li>• Passion pour la transmission</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
