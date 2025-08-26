'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CourseRecap {
  id: string;
  title: string;
  description: string;
  type: string;
  theme: string;
  sessions: any[];
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const formationId = searchParams.get('formationId');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Suisse',
    specialRequirements: ''
  });

  const [courseRecap, setCourseRecap] = useState<CourseRecap | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch course data based on formationId
  useEffect(() => {
    if (formationId) {
      fetchCourseData(formationId);
    } else {
      // Fallback if no formationId provided
      setCourseRecap({
        id: 'unknown',
        title: 'Formation',
        description: 'Détails de la formation',
        type: 'En ligne',
        theme: '',
        sessions: []
      });
      setIsLoading(false);
    }
  }, [formationId]);

  const fetchCourseData = async (id: string) => {
    setIsLoading(true);
    try {
      // Use the list API approach since individual API is failing
      const listRes = await fetch('http://localhost:1337/api/formations?populate=*', { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!listRes.ok) {
        throw new Error(`HTTP error! status: ${listRes.status}`);
      }
      
      const listData = await listRes.json();
      console.log('Formations list API response:', listData);
      
      // Find the specific formation by ID
      const formation = listData.data?.find((f: any) => f.id.toString() === id);
      
      if (formation) {
        console.log('Found formation:', formation);
        setCourseRecap({
          id: formation.id.toString(),
          title: formation.Title || 'Formation sans titre',
          description: formation.Description || '',
          type: formation.Type || 'En ligne',
          theme: formation.Theme || '',
          sessions: formation.sessions || []
        });
      } else {
        console.error('Formation not found with ID:', id);
        // Set a default course recap if formation not found
        setCourseRecap({
          id: id,
          title: 'Formation',
          description: 'Détails de la formation',
          type: 'En ligne',
          theme: '',
          sessions: []
        });
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      // Set a default course recap if API fails
      setCourseRecap({
        id: id,
        title: 'Formation',
        description: 'Détails de la formation',
        type: 'En ligne',
        theme: '',
        sessions: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // First, create or find user account with password "1"
      const userAccountData = {
        data: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: '1', // Set password to "1" for testing
          isActive: true
        }
      };

      // Try to create user account
      const userRes = await fetch('http://localhost:1337/api/user-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userAccountData),
      });

      let userAccountId = null;

      if (userRes.ok) {
        const userData = await userRes.json();
        userAccountId = userData.data.id;
        console.log('User account created:', userData.data);
      } else if (userRes.status === 400) {
        // User already exists, try to find them
        const findUserRes = await fetch(`http://localhost:1337/api/user-accounts?filters[email]=${formData.email}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (findUserRes.ok) {
          const findUserData = await findUserRes.json();
          if (findUserData.data && findUserData.data.length > 0) {
            userAccountId = findUserData.data[0].id;
            console.log('Existing user account found:', findUserData.data[0]);
          }
        }
      }

      // Create registration with user account linking
      const registrationData = {
        data: {
          ...formData,
          formation: formationId,
          status: 'pending', // Back to pending for approval workflow
          userAccount: userAccountId
        }
      };

      const res = await fetch('http://localhost:1337/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (res.ok) {
        console.log('Registration created successfully');
        
        // For now, we'll just create the registration
        // The personal space will fetch registrations instead of enrolledFormations
        // This avoids the Strapi permissions issue

        // Create password setup token
        if (userAccountId) {
          try {
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

            const tokenData = {
              data: {
                token: token,
                email: formData.email,
                userAccount: userAccountId,
                expiresAt: expiresAt.toISOString(),
                isUsed: false
              }
            };

            const tokenRes = await fetch('http://localhost:1337/api/password-setup-tokens', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tokenData),
            });

            if (tokenRes.ok) {
              // Send email with password setup link
              const emailData = {
                to: formData.email,
                from: 'noreply@helvetiforma.com',
                subject: 'Configurez votre mot de passe - Helvetiforma',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb; margin-bottom: 20px;">Bienvenue chez Helvetiforma!</h2>
                    
                    <p>Bonjour ${formData.firstName},</p>
                    
                    <p>Votre inscription a été confirmée. Pour accéder à votre espace personnel, veuillez configurer votre mot de passe en cliquant sur le lien ci-dessous :</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="http://localhost:3000/setup-password?token=${token}" 
                         style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Configurer mon mot de passe
                      </a>
                    </div>
                    
                    <p><strong>Important :</strong> Ce lien expire dans 24 heures et ne peut être utilisé qu'une seule fois.</p>
                    
                    <p>Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    
                    <p style="font-size: 12px; color: #6b7280;">
                      Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.
                    </p>
                  </div>
                `,
                text: `
                  Bienvenue chez Helvetiforma!
                  
                  Bonjour ${formData.firstName},
                  
                  Votre inscription a été confirmée. Pour accéder à votre espace personnel, veuillez configurer votre mot de passe en visitant le lien suivant :
                  
                  http://localhost:3000/setup-password?token=${token}
                  
                  Important : Ce lien expire dans 24 heures et ne peut être utilisé qu'une seule fois.
                  
                  Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.
                `
              };

              // Send email using Strapi's email service
              const emailRes = await fetch('http://localhost:1337/api/email/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
              });

              if (emailRes.ok) {
                console.log('Password setup email sent successfully');
              } else {
                console.error('Failed to send email:', await emailRes.text());
              }
              
              // For demo purposes, also show the link in console
              console.log('Password setup link:', `http://localhost:3000/setup-password?token=${token}`);
            }
          } catch (error) {
            console.error('Error creating password setup token:', error);
          }
        }

        setSubmitStatus('success');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'Suisse',
          specialRequirements: ''
        });
      } else {
        setSubmitStatus('error');
        console.error('Registration failed:', await res.text());
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!courseRecap || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chargement...</h1>
            <p className="text-gray-600">Récupération des informations de la formation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/formations" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Retour aux formations
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inscription à la formation</h1>
          <p className="text-gray-600">Complétez le formulaire ci-dessous pour vous inscrire</p>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-600">✅</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Inscription réussie!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Votre inscription a été enregistrée et votre compte utilisateur a été créé. 
                  Vous pouvez maintenant vous connecter avec votre email et le mot de passe "1".
                </p>
                <div className="mt-3 space-x-4">
                  <Link 
                    href="/login" 
                    className="text-sm text-green-800 underline hover:text-green-900"
                  >
                    Se connecter maintenant →
                  </Link>
                  <Link 
                    href="/personal-space" 
                    className="text-sm text-green-800 underline hover:text-green-900"
                  >
                    Accéder à mon espace personnel →
                  </Link>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <strong>Connexion:</strong> Utilisez votre email et le mot de passe "1"
                </div>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-600">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur lors de l'inscription</h3>
                <p className="text-sm text-red-700 mt-1">
                  Une erreur s'est produite. Veuillez réessayer ou nous contacter.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Registration Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Poste
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="Suisse">Suisse</option>
                    <option value="France">France</option>
                    <option value="Allemagne">Allemagne</option>
                    <option value="Italie">Italie</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                  Besoins particuliers
                </label>
                <textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Accessibilité, régime alimentaire, etc."
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Confirmer l\'inscription'}
              </button>
            </form>
          </div>

          {/* Right Column - Course Recap */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Récapitulatif de la formation</h2>
            
            {/* Course Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{courseRecap.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{courseRecap.description}</p>
              
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{courseRecap.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thème:</span>
                  <span className="font-medium">{courseRecap.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions:</span>
                  <span className="font-medium">{courseRecap.sessions.length}</span>
                </div>
              </div>
            </div>

            {/* Sessions */}
            {courseRecap.sessions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Sessions programmées</h4>
                <div className="space-y-2">
                  {courseRecap.sessions.map((session, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <span className="text-blue-600">📅</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {formatDate(session.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Conditions d'inscription</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• L'inscription est confirmée après validation</li>
                <li>• Annulation possible jusqu'à 7 jours avant</li>
                <li>• Matériel de formation fourni</li>
                <li>• Certificat de participation délivré</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chargement...</h1>
            <p className="text-gray-600">Préparation de la page d'inscription</p>
          </div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
} 