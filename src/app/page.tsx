import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWordPressPageBySlug } from '@/lib/wordpress';

export default async function Home() {
  // Fetch the Accueil page content from WordPress
  const homePage = await getWordPressPageBySlug('accueil');
  
  // Fallback content if WordPress content is not available
  const heroTitle = homePage?.content?.rendered 
    ? extractHeroTitle(homePage.content.rendered)
    : 'Bienvenue sur <span class="text-blue-400">Helvetiforma</span>';
    
  const heroDescription = homePage?.content?.rendered
    ? extractHeroDescription(homePage.content.rendered)
    : 'Votre plateforme de formation professionnelle en Suisse. Découvrez nos formations spécialisées et développez vos compétences avec une approche moderne et flexible.';

  return (
    <div className="min-h-screen">
      {/* Hero Section with Full-Screen Background Image */}
      <div className="relative h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Formation professionnelle en Suisse"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            dangerouslySetInnerHTML={{ __html: heroTitle }}
          />
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/formations"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
            >
              Découvrir nos formations
            </Link>
            <Link
              href="/concept"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 font-medium text-lg border-2 border-white shadow-lg"
            >
              Notre approche
            </Link>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* WordPress Content Section */}
      {homePage?.content?.rendered && (
        <div className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div 
              className="prose prose-lg max-w-none mx-auto"
              dangerouslySetInnerHTML={{ __html: homePage.content.rendered }}
            />
          </div>
        </div>
      )}

      {/* Features Section with SVG Icons */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Pourquoi choisir Helvetiforma ?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Formations Certifiantes</h3>
              <p className="text-gray-600">
                Nos programmes délivrent des certificats reconnus qui attestent 
                de vos compétences acquises et valorisent votre CV.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Apprentissage Flexible</h3>
              <p className="text-gray-600">
                Combinez cours en ligne et sessions en présentiel selon vos disponibilités. 
                Apprenez à votre rythme, où et quand vous voulez.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Support Personnalisé</h3>
              <p className="text-gray-600">
                Bénéficiez d'un accompagnement sur mesure avec nos formateurs experts 
                et notre équipe dédiée à votre réussite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to extract content from WordPress HTML
function extractHeroTitle(htmlContent: string): string {
  // Look for h1 tags or specific content patterns
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1];
  }
  
  // Fallback: look for content between specific markers
  const titleMatch = htmlContent.match(/<!--hero-title-->(.*?)<!--\/hero-title-->/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  // Default fallback
  return 'Bienvenue sur <span class="text-blue-400">Helvetiforma</span>';
}

function extractHeroDescription(htmlContent: string): string {
  // Look for p tags or specific content patterns
  const pMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pMatch) {
    return pMatch[1];
  }
  
  // Fallback: look for content between specific markers
  const descMatch = htmlContent.match(/<!--hero-description-->(.*?)<!--\/hero-description-->/);
  if (descMatch) {
    return descMatch[1].trim();
  }
  
  // Default fallback
  return 'Votre plateforme de formation professionnelle en Suisse. Découvrez nos formations spécialisées et développez vos compétences avec une approche moderne et flexible.';
}
