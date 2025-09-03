'use client';

import React, { useRef, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { emailjsConfig } from '../../config/emailjs';
import { contentService, WebsiteContent } from '@/services/contentService';
import EditableContent from '@/components/EditableContent';

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [content, setContent] = useState<WebsiteContent | null>(null);

  useEffect(() => {
    // Load content from the content service
    setContent(contentService.getContent());
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setErrorMessage('');

    try {
      console.log('EmailJS Config:', {
        serviceId: emailjsConfig.serviceId,
        templateId: emailjsConfig.templateId,
        publicKey: emailjsConfig.publicKey
      });
      
      console.log('Form Data:', formRef.current);
      
      const result = await emailjs.sendForm(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        formRef.current!,
        emailjsConfig.publicKey
      );
      
      console.log('EmailJS result:', result);
      setSubmitMessage('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      
      // Handle error safely with proper typing
      let errorMessage = 'Une erreur est survenue lors de l\'envoi de votre message.';
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        errorMessage = `Une erreur est survenue lors de l'envoi de votre message: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        console.error('Error details:', error);
        errorMessage = 'Une erreur inconnue est survenue lors de l\'envoi de votre message.';
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <EditableContent
            fieldName="contactTitle"
            value={content.contactTitle}
            type="text"
            placeholder="Titre de la page contact"
            className="mb-4"
          >
            <h1 className="text-4xl font-bold text-gray-900">
              {content.contactTitle}
            </h1>
          </EditableContent>
          
          <EditableContent
            fieldName="contactDescription"
            value={content.contactDescription}
            type="textarea"
            placeholder="Description de la page contact"
            className="max-w-2xl mx-auto"
          >
            <p className="text-xl text-gray-600">
              {content.contactDescription}
            </p>
          </EditableContent>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Informations de contact</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <EditableContent
                      fieldName="contactEmail"
                      value={content.contactEmail}
                      type="text"
                      placeholder="Adresse email de contact"
                      className="text-gray-600"
                    >
                      <p className="text-gray-600">{content.contactEmail}</p>
                    </EditableContent>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Localisation</h3>
                    <EditableContent
                      fieldName="contactLocation"
                      value={content.contactLocation}
                      type="text"
                      placeholder="Localisation"
                      className="text-gray-600"
                    >
                      <p className="text-gray-600">{content.contactLocation}</p>
                    </EditableContent>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Réponse rapide</h3>
                    <EditableContent
                      fieldName="contactResponseTime"
                      value={content.contactResponseTime}
                      type="text"
                      placeholder="Temps de réponse"
                      className="text-gray-600"
                    >
                      <p className="text-gray-600">{content.contactResponseTime}</p>
                    </EditableContent>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <EditableContent
                fieldName="whyChooseUsTitle"
                value={content.whyChooseUsTitle}
                type="text"
                placeholder="Titre de la section pourquoi nous choisir"
                className="mb-4"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {content.whyChooseUsTitle}
                </h3>
              </EditableContent>
              
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <EditableContent
                    fieldName="whyChooseUsPoint1"
                    value={content.whyChooseUsPoint1}
                    type="text"
                    placeholder="Premier point"
                    className="inline"
                  >
                    <span>{content.whyChooseUsPoint1}</span>
                  </EditableContent>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <EditableContent
                    fieldName="whyChooseUsPoint2"
                    value={content.whyChooseUsPoint2}
                    type="text"
                    placeholder="Deuxième point"
                    className="inline"
                  >
                    <span>{content.whyChooseUsPoint2}</span>
                  </EditableContent>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <EditableContent
                    fieldName="whyChooseUsPoint3"
                    value={content.whyChooseUsPoint3}
                    type="text"
                    placeholder="Troisième point"
                    className="inline"
                  >
                    <span>{content.whyChooseUsPoint3}</span>
                  </EditableContent>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>
            
            {submitMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800 font-medium">Message envoyé avec succès !</span>
                </div>
                <p className="text-green-700 text-sm mt-1">Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-800 font-medium">Erreur lors de l'envoi</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="from_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="from_name"
                    name="from_name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div>
                  <label htmlFor="from_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="from_email"
                    name="from_email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Sujet de votre message"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  'Envoyer le message'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <EditableContent
            fieldName="faqTitle"
            value={content.faqTitle}
            type="text"
            placeholder="Titre de la section FAQ"
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              {content.faqTitle}
            </h2>
          </EditableContent>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <EditableContent
                fieldName="faqQuestion1"
                value={content.faqQuestion1}
                type="text"
                placeholder="Première question FAQ"
                className="mb-3"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {content.faqQuestion1}
                </h3>
              </EditableContent>
              <EditableContent
                fieldName="faqAnswer1"
                value={content.faqAnswer1}
                type="textarea"
                placeholder="Réponse à la première question"
                className="text-gray-600"
              >
                <p className="text-gray-600">{content.faqAnswer1}</p>
              </EditableContent>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <EditableContent
                fieldName="faqQuestion2"
                value={content.faqQuestion2}
                type="text"
                placeholder="Deuxième question FAQ"
                className="mb-3"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {content.faqQuestion2}
                </h3>
              </EditableContent>
              <EditableContent
                fieldName="faqAnswer2"
                value={content.faqAnswer2}
                type="textarea"
                placeholder="Réponse à la deuxième question"
                className="text-gray-600"
              >
                <p className="text-gray-600">{content.faqAnswer2}</p>
              </EditableContent>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <EditableContent
                fieldName="faqQuestion3"
                value={content.faqQuestion3}
                type="text"
                placeholder="Troisième question FAQ"
                className="mb-3"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {content.faqQuestion3}
                </h3>
              </EditableContent>
              <EditableContent
                fieldName="faqAnswer3"
                value={content.faqAnswer3}
                type="textarea"
                placeholder="Réponse à la troisième question"
                className="text-gray-600"
              >
                <p className="text-gray-600">{content.faqAnswer3}</p>
              </EditableContent>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <EditableContent
                fieldName="faqQuestion4"
                value={content.faqQuestion4}
                type="text"
                placeholder="Quatrième question FAQ"
                className="mb-3"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {content.faqQuestion4}
                </h3>
              </EditableContent>
              <EditableContent
                fieldName="faqAnswer4"
                value={content.faqAnswer4}
                type="textarea"
                placeholder="Réponse à la quatrième question"
                className="text-gray-600"
              >
                <p className="text-gray-600">{content.faqAnswer4}</p>
              </EditableContent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
