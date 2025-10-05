import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et protection des données personnelles de HelvetiForma',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Politique de confidentialité
          </h1>
          
          <div className="bg-muted/50 rounded-xl p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              HelvetiForma Sàrl s'engage à protéger votre vie privée et vos données personnelles. 
              Cette politique de confidentialité explique comment nous collectons, utilisons et 
              protégeons vos informations.
            </p>
          </div>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                1. Collecte des données
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous collectons les données personnelles dans le cadre de nos formations et pour 
                la connexion au coin des docs, notamment :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Nom et prénom</li>
                <li>Adresse e-mail</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Informations professionnelles (secteur d'activité, fonction)</li>
                <li>Données de connexion au coin des docs</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Utilisation des données
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vos données personnelles sont utilisées pour :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Fournir nos services de formation</li>
                <li>Gérer votre inscription aux sessions</li>
                <li>Permettre votre connexion au coin des docs</li>
                <li>Vous envoyer des informations sur nos formations</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. Partage des données
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, 
                sauf dans les cas suivants :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
                <li>Avec votre consentement explicite</li>
                <li>Pour respecter une obligation légale</li>
                <li>Avec nos prestataires de services (hébergement, e-mail) sous contrat de confidentialité</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Sécurité des données
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous mettons en place des mesures techniques et organisationnelles appropriées pour 
                protéger vos données contre la perte, l'utilisation abusive, l'accès non autorisé, 
                la divulgation, l'altération ou la destruction.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Vos droits
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Conformément à la loi suisse sur la protection des données, vous avez le droit de :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Accéder à vos données personnelles</li>
                <li>Demander la rectification de données inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Retirer votre consentement à tout moment</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Conservation des données
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour 
                fournir nos services de formation et respecter nos obligations légales.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Modifications
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour exercer 
                vos droits, contactez-nous :
              </p>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>HelvetiForma Sàrl</strong><br />
                  Route de Choëx 90<br />
                  1871 Choëx, Suisse<br />
                  Email : contact@helvetiforma.ch
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
