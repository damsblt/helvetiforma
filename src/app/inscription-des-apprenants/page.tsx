'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function StudentRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Tous les champs obligatoires doivent être remplis.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'subscriber'
      });

      if (result.success) {
        setSuccess(result.message || 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          acceptTerms: false
        });
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/tutor-login?message=registration-success');
        }, 3000);
      } else {
        setError(result.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer plus tard.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie !</h2>
          <p className="text-gray-600 mb-4">{success}</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inscription des apprenants
          </h1>
          <p className="text-gray-600">
            Créez votre compte apprenant et accédez à nos formations
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Votre prénom"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Adresse email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="votre.email@exemple.com"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="acceptTerms" className="ml-3 block text-sm text-gray-900">
                J'accepte les{' '}
                <Link href="/conditions-utilisation" className="text-blue-600 hover:text-blue-700 underline">
                  conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link href="/politique-confidentialite" className="text-blue-600 hover:text-blue-700 underline">
                  politique de confidentialité
                </Link>
                {' '}*
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link href="/tutor-login" className="text-blue-600 hover:text-blue-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Avantages apprenant
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>✓ Accès à toutes nos formations</li>
              <li>✓ Suivi personnalisé de votre progression</li>
              <li>✓ Certificats de formation reconnus</li>
              <li>✓ Support technique et pédagogique</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-green-900 mb-4">
              Domaines de formation
            </h3>
            <ul className="space-y-2 text-green-800">
              <li>• Comptabilité générale et analytique</li>
              <li>• Gestion de la paie suisse</li>
              <li>• Charges sociales et fiscalité</li>
              <li>• Impôt à la source</li>
            </ul>
          </div>
        </div>

        {/* Help section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Besoin d'aide ?
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• <Link href="/tutor-login" className="underline hover:no-underline">Se connecter avec un compte existant</Link></p>
            <p>• <Link href="/inscription-des-formateurs-et-formatrices" className="underline hover:no-underline">Devenir formateur</Link></p>
            <p>• En cas de problème : <a href="mailto:support@helvetiforma.ch" className="underline hover:no-underline">support@helvetiforma.ch</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
