import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Conditions d'utilisation
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-CH')}
            </p>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
              <p className="text-gray-700 mb-4">
                En accédant et en utilisant la plateforme HelvetiForma, vous acceptez d'être lié par 
                ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
                veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description du service</h2>
              <p className="text-gray-700 mb-4">
                HelvetiForma est une plateforme de formation en ligne qui propose des cours, 
                des ressources pédagogiques et des outils d'apprentissage. Nous nous réservons 
                le droit de modifier, suspendre ou interrompre le service à tout moment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Inscription et compte utilisateur</h2>
              <p className="text-gray-700 mb-4">Pour utiliser certains services, vous devez :</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Créer un compte avec des informations exactes et complètes</li>
                <li>Maintenir la sécurité de votre mot de passe</li>
                <li>Être responsable de toutes les activités sous votre compte</li>
                <li>Nous notifier immédiatement de toute utilisation non autorisée</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Utilisation acceptable</h2>
              <p className="text-gray-700 mb-4">Vous vous engagez à ne pas :</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Utiliser le service à des fins illégales ou non autorisées</li>
                <li>Partager votre compte ou vos identifiants avec des tiers</li>
                <li>Télécharger ou redistribuer le contenu sans autorisation</li>
                <li>Perturber ou interférer avec le service</li>
                <li>Utiliser des robots, scripts ou autres moyens automatisés</li>
                <li>Publier du contenu offensant, diffamatoire ou inapproprié</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Propriété intellectuelle</h2>
              <p className="text-gray-700 mb-4">
                Tout le contenu de la plateforme (cours, vidéos, textes, images, logos) 
                est protégé par le droit d'auteur et appartient à HelvetiForma ou à ses partenaires. 
                Vous obtenez une licence limitée pour utiliser ce contenu à des fins d'apprentissage personnel uniquement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Paiements et remboursements</h2>
              <p className="text-gray-700 mb-4">
                Les prix sont indiqués en francs suisses (CHF) et incluent la TVA applicable. 
                Les paiements sont traités de manière sécurisée par nos partenaires certifiés.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Politique de remboursement :</strong> Vous disposez de 30 jours pour demander 
                un remboursement complet si vous n'êtes pas satisfait d'un cours, 
                à condition de ne pas avoir terminé plus de 30% du contenu.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
              <p className="text-gray-700 mb-4">
                HelvetiForma ne peut être tenu responsable des dommages directs, indirects, 
                accessoires ou consécutifs résultant de l'utilisation ou de l'impossibilité 
                d'utiliser le service. Nous fournissons le service "en l'état" sans garantie d'aucune sorte.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Certificats et accréditations</h2>
              <p className="text-gray-700 mb-4">
                Les certificats délivrés par HelvetiForma attestent de la completion des cours 
                sur notre plateforme. Ils ne constituent pas des diplômes officiels sauf 
                mention contraire explicite.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Suspension et résiliation</h2>
              <p className="text-gray-700 mb-4">
                Nous nous réservons le droit de suspendre ou résilier votre compte en cas de 
                violation de ces conditions. Vous pouvez résilier votre compte à tout moment 
                en nous contactant.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Droit applicable</h2>
              <p className="text-gray-700 mb-4">
                Ces conditions sont régies par le droit suisse. Tout litige sera soumis 
                à la compétence exclusive des tribunaux suisses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications</h2>
              <p className="text-gray-700 mb-4">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications importantes vous seront notifiées par email ou via la plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant ces conditions d'utilisation, contactez-nous :
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>HelvetiForma</strong><br />
                  Email : <a href="mailto:legal@helvetiforma.ch" className="text-blue-600 hover:text-blue-700">legal@helvetiforma.ch</a><br />
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
