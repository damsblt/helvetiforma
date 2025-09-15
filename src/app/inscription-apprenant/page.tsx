'use client';

import React, { useState, useEffect } from 'react';

interface RegistrationFormData {
  form_html: string;
  page_title: string;
  page_url: string;
  page_id: number;
}

export default function InscriptionApprenantPage() {
  const [formData, setFormData] = useState<RegistrationFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRegistrationForm = async () => {
      try {
        const response = await fetch('/api/tutor-form');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du formulaire');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setFormData(data);
        } else {
          setError(data.error || 'Erreur inconnue');
        }
      } catch (err) {
        console.error('Error fetching registration form:', err);
        setError('Impossible de charger le formulaire d\'inscription');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationForm();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
    };

    try {
      // Call Next.js API (will use Tutor LMS Pro once activated)
      const response = await fetch('/api/tutor-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message);
      } else {
        setError(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du formulaire d'inscription...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Inscription Réussie !</h1>
            <div className="text-gray-600 mb-4 whitespace-pre-line">
              {successMessage}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Nouvelle Inscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Aucun formulaire d'inscription disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {formData.page_title}
            </h1>
            <p className="text-gray-600">
              Rejoignez HelvetiForma pour accéder à nos formations professionnelles
            </p>
          </div>
          
          <div className="registration-form">
            <form onSubmit={handleFormSubmit}>
              <div className="tutor-form-group">
                <label htmlFor="first_name">Prénom *</label>
                <input 
                  type="text" 
                  id="first_name" 
                  name="first_name" 
                  required 
                  disabled={submitting}
                />
              </div>
              
              <div className="tutor-form-group">
                <label htmlFor="last_name">Nom *</label>
                <input 
                  type="text" 
                  id="last_name" 
                  name="last_name" 
                  required 
                  disabled={submitting}
                />
              </div>
              
              <div className="tutor-form-group">
                <label htmlFor="email">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  disabled={submitting}
                />
              </div>
              
              <div className="tutor-form-group">
                <button 
                  type="submit" 
                  className="tutor-btn tutor-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              En vous inscrivant, vous acceptez nos{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                politique de confidentialité
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .tutor-registration-form {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
        }
        
        .tutor-form-group {
          margin-bottom: 20px;
        }
        
        .tutor-form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        
        .tutor-form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .tutor-form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
        
        .tutor-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          text-decoration: none;
          display: inline-block;
          text-align: center;
          width: 100%;
        }
        
        .tutor-btn-primary {
          background-color: #3e64de;
          color: white;
        }
        
        .tutor-btn-primary:hover:not(:disabled) {
          background-color: #395bca;
        }
        
        .tutor-btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
