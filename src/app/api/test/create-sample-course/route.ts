import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceService } from '@/services/woocommerceService';

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    // Sample course data with rich description
    const sampleCourseData = {
      name: `Formation Test ${courseId || 'Demo'}`,
      description: `
        <h2>Description complète du cours</h2>
        <p>Cette formation vous permettra d'acquérir des compétences essentielles dans le domaine de la gestion des salaires.</p>
        
        <h3>Objectifs de la formation</h3>
        <ul>
          <li>Comprendre la législation suisse en matière de salaires</li>
          <li>Maîtriser le calcul des cotisations sociales</li>
          <li>Gérer les déclarations fiscales</li>
          <li>Utiliser les outils de paie modernes</li>
        </ul>
        
        <h3>Programme détaillé</h3>
        <ol>
          <li><strong>Module 1:</strong> Introduction à la paie suisse</li>
          <li><strong>Module 2:</strong> Calcul des salaires bruts et nets</li>
          <li><strong>Module 3:</strong> Cotisations sociales et assurances</li>
          <li><strong>Module 4:</strong> Déclarations et obligations légales</li>
        </ol>
        
        <h3>Méthodes pédagogiques</h3>
        <p>La formation combine théorie et pratique avec des exercices concrets et des cas d'étude réels.</p>
        
        <h3>Certification</h3>
        <p>À l'issue de la formation, vous recevrez un certificat de participation reconnu par les organismes professionnels.</p>
      `,
      short_description: `
        Formation complète sur la gestion des salaires en entreprise. 
        Apprenez les bases de la paie, les cotisations sociales, et la législation suisse.
        Durée: 3 jours - Niveau: Intermédiaire
      `,
      status: 'publish',
      virtual: true,
      downloadable: false,
      regular_price: '1200',
      meta_data: [
        {
          key: '_tutor_course_id',
          value: (courseId || '999').toString()
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
          value: '1200'
        },
        {
          key: '_intro_video',
          value: 'https://example.com/intro-video.mp4'
        }
      ]
    };

    // Create the product
    const product = await wooCommerceService.createProduct(sampleCourseData);

    return NextResponse.json({
      success: true,
      data: {
        product_id: product.id,
        product_name: product.name,
        description_length: product.description?.length || 0,
        short_description_length: product.short_description?.length || 0,
        message: 'Sample course product created with full description'
      },
      message: 'Produit de formation d\'exemple créé avec description complète'
    });

  } catch (error) {
    console.error('Create sample course error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create sample course',
        message: 'Erreur lors de la création du cours d\'exemple'
      },
      { status: 500 }
    );
  }
}
