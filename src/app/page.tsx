'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { contentService, WebsiteContent } from '@/services/contentService';
import { authService } from '@/services/authService';
import EditableContent from '@/components/EditableContent';

export default function Home() {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Load content from the content service
    const loadContent = async () => {
      // Wait for content to be loaded
      while (!contentService.isContentLoaded()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setContent(contentService.getContent());
    };
    
    loadContent();
    
    // Check if user is admin
    const checkAdmin = () => {
      const admin = authService.isAuthenticated() && authService.getUser()?.isAdmin;
      setIsAdmin(admin || false);
    };
    checkAdmin();
    
    // Listen for content changes (when admin updates content)
    const handleStorageChange = () => {
      setContent(contentService.getContent());
    };
    
    // Listen for custom content update events
    const handleContentUpdate = () => {
      setContent(contentService.getContent());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contentUpdated', handleContentUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contentUpdated', handleContentUpdate);
    };
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du contenu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      
      {/* Hero Section with Full-Screen Background Image */}
      <div className="relative h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 hero-image-container">
          <Image
            src="/images/hero-bg.jpg"
            alt="Formation professionnelle en Suisse"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                      <EditableContent
              fieldName="heroTitle"
              value={content.heroTitle}
              type="html"
              placeholder="Titre principal de la page d'accueil"
              className="mb-6"
              editTextColor="text-white"
              editBackgroundColor="bg-black"
            >
            <h1 
              className="text-5xl md:text-6xl font-bold leading-tight"
              dangerouslySetInnerHTML={{ __html: content.heroTitle }}
            />
          </EditableContent>
          
                      <EditableContent
              fieldName="heroDescription"
              value={content.heroDescription}
              editTextColor="text-white"
              editBackgroundColor="bg-black"
              type="textarea"
              placeholder="Description sous le titre principal"
              className="mb-8"
            >
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              {content.heroDescription}
            </p>
          </EditableContent>
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

      {/* About Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <EditableContent
                fieldName="aboutTitle"
                value={content.aboutTitle}
                type="text"
                placeholder="Titre de la section à propos"
                className="mb-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">
                  {content.aboutTitle}
                </h2>
              </EditableContent>
              
              <EditableContent
                fieldName="aboutContent"
                value={content.aboutContent}
                type="textarea"
                placeholder="Contenu principal de la section à propos"
                className="mb-6"
              >
                <p className="text-lg text-gray-600">
                  {content.aboutContent}
                </p>
              </EditableContent>
              
              <EditableContent
                fieldName="aboutSubContent"
                value={content.aboutSubContent}
                type="textarea"
                placeholder="Contenu supplémentaire de la section à propos"
                className="mb-8"
              >
                <p className="text-gray-600">
                  {content.aboutSubContent}
                </p>
              </EditableContent>
              <Link
                href="/concept"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg"
              >
                En savoir plus sur notre approche
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Formations en ligne</h3>
                    <p className="text-sm text-gray-600">Apprenez à votre rythme</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sessions en présentiel</h3>
                    <p className="text-sm text-gray-600">Validation des acquis</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Suivi personnalisé</h3>
                    <p className="text-sm text-gray-600">Accompagnement sur mesure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with SVG Icons */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <EditableContent
            fieldName="featuresTitle"
            value={content.featuresTitle}
            type="text"
            placeholder="Titre de la section fonctionnalités"
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              {content.featuresTitle}
            </h2>
          </EditableContent>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <EditableContent
                fieldName="feature1Title"
                value={content.feature1Title}
                type="text"
                placeholder="Titre de la première fonctionnalité"
                className="mb-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {content.feature1Title}
                </h3>
              </EditableContent>
              <EditableContent
                fieldName="feature1Description"
                value={content.feature1Description}
                type="textarea"
                placeholder="Description de la première fonctionnalité"
              >
                <p className="text-gray-600">
                  {content.feature1Description}
                </p>
              </EditableContent>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <EditableContent
                fieldName="feature2Title"
                value={content.feature2Title}
                type="text"
                placeholder="Titre de la deuxième fonctionnalité"
                className="mb-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {content.feature2Title}
                </h3>
              </EditableContent>
              <EditableContent
                fieldName="feature2Description"
                value={content.feature2Description}
                type="textarea"
                placeholder="Description de la deuxième fonctionnalité"
              >
                <p className="text-gray-600">
                  {content.feature2Description}
                </p>
              </EditableContent>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <EditableContent
                fieldName="feature3Title"
                value={content.feature3Title}
                type="text"
                placeholder="Titre de la troisième fonctionnalité"
                className="mb-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {content.feature3Title}
                </h3>
              </EditableContent>
              <EditableContent
                fieldName="feature3Description"
                value={content.feature3Description}
                type="textarea"
                placeholder="Description de la troisième fonctionnalité"
              >
                <p className="text-gray-600">
                  {content.feature3Description}
                </p>
              </EditableContent>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section with Gradient Background */}
      <div className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="container mx-auto px-4 text-center">
          <EditableContent
            fieldName="statsTitle"
            value={content.statsTitle}
            type="text"
            placeholder="Titre de la section statistiques"
            className="mb-6"
          >
            <h2 className="text-3xl font-bold text-white">
              {content.statsTitle}
            </h2>
          </EditableContent>
          
          <EditableContent
            fieldName="statsSubtitle"
            value={content.statsSubtitle}
            type="text"
            placeholder="Sous-titre de la section statistiques"
            className="mb-8 max-w-2xl mx-auto"
          >
            <p className="text-xl text-blue-100">
              {content.statsSubtitle}
            </p>
          </EditableContent>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <EditableContent
                fieldName="statsLearners"
                value={content.statsLearners}
                type="text"
                placeholder="Nombre d'apprenants formés"
                className="mb-2"
              >
                <div className="text-4xl font-bold">
                  {content.statsLearners}
                </div>
              </EditableContent>
              <div className="text-blue-200">Apprenants formés</div>
            </div>
            <div className="text-center text-white">
              <EditableContent
                fieldName="statsFormations"
                value={content.statsFormations}
                type="text"
                placeholder="Nombre de formations disponibles"
                className="mb-2"
              >
                <div className="text-4xl font-bold">
                  {content.statsFormations}
                </div>
              </EditableContent>
              <div className="text-blue-200">Formations disponibles</div>
            </div>
            <div className="text-center text-white">
              <EditableContent
                fieldName="statsSatisfaction"
                value={content.statsSatisfaction}
                type="text"
                placeholder="Taux de satisfaction"
                className="mb-2"
              >
                <div className="text-4xl font-bold">
                  {content.statsSatisfaction}
                </div>
              </EditableContent>
              <div className="text-blue-200">Taux de satisfaction</div>
            </div>
            <div className="text-center text-white">
              <EditableContent
                fieldName="statsSupport"
                value={content.statsSupport}
                type="text"
                placeholder="Disponibilité du support"
                className="mb-2"
              >
                <div className="text-4xl font-bold">
                  {content.statsSupport}
                </div>
              </EditableContent>
              <div className="text-blue-200">Support disponible</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Gradient Background */}
      <div className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="container mx-auto px-4 text-center">
          <EditableContent
            fieldName="ctaTitle"
            value={content.ctaTitle}
            type="text"
            placeholder="Titre de la section CTA"
            className="mb-6"
          >
            <h2 className="text-3xl font-bold text-white">
              {content.ctaTitle}
            </h2>
          </EditableContent>
          
          <EditableContent
            fieldName="ctaSubtitle"
            value={content.ctaSubtitle}
            type="text"
            placeholder="Sous-titre de la section CTA"
            className="mb-8 max-w-2xl mx-auto"
          >
            <p className="text-xl text-blue-100">
              {content.ctaSubtitle}
            </p>
          </EditableContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <EditableContent
              fieldName="ctaButton1"
              value={content.ctaButton1}
              type="text"
              placeholder="Texte du premier bouton"
            >
              <Link
                href="/docs"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
              >
                {content.ctaButton1}
              </Link>
            </EditableContent>
            
            <EditableContent
              fieldName="ctaButton2"
              value={content.ctaButton2}
              type="text"
              placeholder="Texte du deuxième bouton"
            >
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
              >
                {content.ctaButton2}
              </Link>
            </EditableContent>
          </div>
        </div>
      </div>
    </div>
  );
}
