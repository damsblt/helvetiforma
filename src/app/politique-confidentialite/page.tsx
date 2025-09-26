import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-CH')}
            </p>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                HelvetiForma s'engage à protéger votre vie privée et vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons et 
                protégeons vos informations lorsque vous utilisez notre plateforme de formation en ligne.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Données collectées</h2>
              <p className="text-gray-700 mb-4">Nous collectons les types de données suivants :</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Informations d'identification : nom, prénom, adresse email</li>
                <li>Informations de profil : photo de profil, biographie (optionnel)</li>
                <li>Données d'utilisation : progression dans les cours, scores aux quiz</li>
                <li>Données techniques : adresse IP, type de navigateur, données de connexion</li>
                <li>Informations de paiement : traitées par nos partenaires sécurisés</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Utilisation des données</h2>
              <p className="text-gray-700 mb-4">Nous utilisons vos données pour :</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Fournir et améliorer nos services de formation</li>
                <li>Personnaliser votre expérience d'apprentissage</li>
                <li>Communiquer avec vous concernant votre compte et nos services</li>
                <li>Traiter les paiements et gérer votre abonnement</li>
                <li>Assurer la sécurité de notre plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partage des données</h2>
              <p className="text-gray-700 mb-4">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Nos prestataires de services (hébergement, paiement, analytics)</li>
                <li>Les autorités légales si requis par la loi</li>
                <li>Avec votre consentement explicite dans d'autres cas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sécurité des données</h2>
              <p className="text-gray-700 mb-4">
                Nous mettons en place des mesures de sécurité techniques et organisationnelles 
                appropriées pour protéger vos données contre tout accès non autorisé, 
                modification, divulgation ou destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vos droits</h2>
              <p className="text-gray-700 mb-4">
                Conformément au RGPD et à la loi suisse sur la protection des données, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
                <li>Droit d'opposition au traitement</li>
                <li>Droit de limitation du traitement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <p className="text-gray-700 mb-4">
                Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Conservation des données</h2>
              <p className="text-gray-700 mb-4">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour 
                fournir nos services et respecter nos obligations légales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                contactez-nous à :
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>HelvetiForma</strong><br />
                  Email : <a href="mailto:privacy@helvetiforma.ch" className="text-blue-600 hover:text-blue-700">privacy@helvetiforma.ch</a><br />
                  Support : <a href="mailto:support@helvetiforma.ch" className="text-blue-600 hover:text-blue-700">support@helvetiforma.ch</a>
                </p>
              </div>
            </section>
          </div>

          {/* Back to home */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
