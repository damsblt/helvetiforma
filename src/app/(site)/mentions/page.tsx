import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et informations légales de HelvetiForma Sàrl',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Mentions légales
          </h1>
          
          <div className="bg-muted/50 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Informations sur l'entreprise
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Raison sociale</h3>
                <p className="text-muted-foreground">HelvetiForma Sàrl</p>
                <p className="text-sm text-muted-foreground mt-1">
                  (HelvetiForma GmbH) (HelvetiForma Ltd liab Co) (HelvetiForma Sagl)
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Forme juridique</h3>
                <p className="text-muted-foreground">Société à responsabilité limitée</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Représentant</h3>
                <p className="text-muted-foreground">Oksan Lopez-Cöcel</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Statut</h3>
                <p className="text-muted-foreground">Active</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Adresse</h3>
                <p className="text-muted-foreground">
                  Route de Choëx 90<br />
                  1871 Choëx
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Siège</h3>
                <p className="text-muted-foreground">Monthey</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Numéro IDE</h3>
                <p className="text-muted-foreground">CHE-325.675.546</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Numéro CH-ID</h3>
                <p className="text-muted-foreground">CH-621-4012889-9</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Numéro OFRC-ID</h3>
                <p className="text-muted-foreground">1698391</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Éditeur du site
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le présent site web est édité par HelvetiForma Sàrl, société à responsabilité limitée 
                de droit suisse, dont le siège social est situé à Monthey, Suisse.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Hébergement
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Propriété intellectuelle
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est protégé par 
                le droit d'auteur et appartient à HelvetiForma Sàrl ou à ses partenaires. Toute 
                reproduction, distribution, modification ou utilisation sans autorisation préalable 
                est interdite.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Responsabilité
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                HelvetiForma Sàrl s'efforce de fournir des informations exactes et à jour sur ce site. 
                Toutefois, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des 
                informations diffusées. L'utilisation des informations et contenus disponibles sur 
                l'ensemble du site se fait sous l'entière responsabilité de l'utilisateur.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Droit applicable
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le présent site est soumis au droit suisse. En cas de litige, les tribunaux suisses 
                seront seuls compétents.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
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
