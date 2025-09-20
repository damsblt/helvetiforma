import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    // Rich course data with images and videos
    const richCourseData = {
      name: `Formation Complète ${courseId || 'Demo'}`,
      description: `
        <div class="course-intro">
          <h2>🎯 Formation Complète - Gestion des Salaires</h2>
          <p><strong>Une formation professionnelle complète pour maîtriser la gestion des salaires en entreprise.</strong></p>
          
          <div class="course-highlight">
            <h3>📋 Objectifs de la formation</h3>
            <ul>
              <li>✅ Comprendre la législation suisse en matière de salaires</li>
              <li>✅ Maîtriser le calcul des cotisations sociales</li>
              <li>✅ Gérer les déclarations fiscales et obligations légales</li>
              <li>✅ Utiliser les outils de paie modernes et automatisés</li>
              <li>✅ Optimiser les processus de gestion des ressources humaines</li>
            </ul>
          </div>
          
          <div class="course-content">
            <h3>📚 Programme détaillé</h3>
            <div class="module">
              <h4>Module 1: Introduction à la paie suisse</h4>
              <p>Découvrez les bases du système de paie suisse, la législation en vigueur et les organismes compétents.</p>
              <ul>
                <li>Historique et évolution de la paie en Suisse</li>
                <li>Organismes sociaux et leurs rôles</li>
                <li>Conventions collectives de travail</li>
              </ul>
            </div>
            
            <div class="module">
              <h4>Module 2: Calcul des salaires bruts et nets</h4>
              <p>Apprenez à calculer précisément les salaires bruts et nets selon la législation suisse.</p>
              <ul>
                <li>Structure des salaires en Suisse</li>
                <li>Calcul des heures supplémentaires</li>
                <li>Primes et gratifications</li>
                <li>Déductions obligatoires</li>
              </ul>
            </div>
            
            <div class="module">
              <h4>Module 3: Cotisations sociales et assurances</h4>
              <p>Maîtrisez le calcul et la gestion des cotisations sociales et des assurances.</p>
              <ul>
                <li>AVS/AI/APG (1er pilier)</li>
                <li>LPP (2ème pilier)</li>
                <li>Assurance chômage (AC)</li>
                <li>Assurance accidents (AA)</li>
                <li>Assurance maladie (LAMal)</li>
              </ul>
            </div>
            
            <div class="module">
              <h4>Module 4: Déclarations et obligations légales</h4>
              <p>Gérez efficacement les déclarations fiscales et les obligations légales.</p>
              <ul>
                <li>Déclaration à la source</li>
                <li>Certificats de salaire</li>
                <li>Rapports aux organismes sociaux</li>
                <li>Archivage et conservation des documents</li>
              </ul>
            </div>
          </div>
          
          <div class="course-methods">
            <h3>🎓 Méthodes pédagogiques</h3>
            <p>La formation combine théorie et pratique avec :</p>
            <ul>
              <li>📖 Cours théoriques interactifs</li>
              <li>💻 Exercices pratiques sur cas réels</li>
              <li>🔄 Simulations de calculs de paie</li>
              <li>👥 Travaux de groupe et échanges d'expériences</li>
              <li>📊 Utilisation d'outils de paie professionnels</li>
            </ul>
          </div>
          
          <div class="course-certification">
            <h3>🏆 Certification</h3>
            <p>À l'issue de la formation, vous recevrez :</p>
            <ul>
              <li>📜 Un certificat de participation reconnu</li>
              <li>📚 Un support de cours complet</li>
              <li>🔧 Des outils pratiques utilisables immédiatement</li>
              <li>📞 Un suivi post-formation de 3 mois</li>
            </ul>
          </div>
          
          <div class="course-target">
            <h3>👥 Public cible</h3>
            <p>Cette formation s'adresse à :</p>
            <ul>
              <li>Responsables RH et gestionnaires de paie</li>
              <li>Comptables et assistants comptables</li>
              <li>Chefs d'entreprise et dirigeants</li>
              <li>Professionnels souhaitant se reconvertir</li>
            </ul>
          </div>
        </div>
      `,
      short_description: `
        <p><strong>Formation professionnelle complète sur la gestion des salaires en entreprise.</strong></p>
        <p>Apprenez les bases de la paie, les cotisations sociales, et la législation suisse. 
        Durée: 3 jours - Niveau: Intermédiaire - Certification incluse</p>
        <p>🎯 <em>Formation pratique avec exercices concrets et cas d'étude réels</em></p>
      `,
      status: 'publish',
      virtual: true,
      downloadable: false,
      regular_price: '1500',
      meta_data: [
        {
          key: '_tutor_course_id',
          value: (courseId || '888').toString()
        },
        {
          key: '_tutor_product',
          value: 'yes'
        },
        {
          key: '_course_duration',
          value: '3 jours'
        },
        {
          key: '_course_level',
          value: 'Intermédiaire'
        },
        {
          key: '_course_price',
          value: '1500'
        },
        {
          key: '_intro_video',
          value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
          key: '_course_instructor',
          value: 'Dr. Marie Dubois'
        },
        {
          key: '_course_language',
          value: 'Français'
        },
        {
          key: '_course_certificate',
          value: 'Oui'
        }
      ]
    };

    // Create the product
    const product = await wooCommerceService.createProduct(richCourseData);

    return NextResponse.json({
      success: true,
      data: {
        product_id: product.id,
        product_name: product.name,
        description_length: product.description?.length || 0,
        short_description_length: product.short_description?.length || 0,
        images_count: product.images?.length || 0,
        intro_video: product.meta_data?.find((meta: any) => meta.key === '_intro_video')?.value,
        message: 'Rich course product created with images and video'
      },
      message: 'Produit de formation riche créé avec images et vidéo'
    });

  } catch (error) {
    console.error('Create rich course error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create rich course',
        message: 'Erreur lors de la création du cours riche'
      },
      { status: 500 }
    );
  }
}
