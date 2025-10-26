'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  subject: string
  message: string
  interest: string
}

export default function ContactForm() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    interest: '',
  })
  const [isWebinarRegistration, setIsWebinarRegistration] = useState(false)

  // Handle webinar parameters from URL
  useEffect(() => {
    const webinar = searchParams.get('webinar')
    const webinarId = searchParams.get('webinarId')
    const webinarDateTime = searchParams.get('webinarDateTime')
    const webinarLocation = searchParams.get('webinarLocation')
    const webinarPrice = searchParams.get('webinarPrice')
    
    if (webinar) {
      setIsWebinarRegistration(true)
      const priceInfo = webinarPrice ? `\n- Prix : ${webinarPrice}` : ''
      setFormData(prev => ({
        ...prev,
        subject: `Inscription au webinaire: ${webinar}`,
        message: `Bonjour,\n\nJe souhaite m'inscrire au webinaire "${webinar}" organisé par HelvetiForma.\n\nPouvez-vous m'envoyer les informations nécessaires ?\n\nInformations sur la session :\n- Titre: ${webinar}\n- Date et heure : ${webinarDateTime || '[date and time]'}\n- Emplacement : ${webinarLocation || '[location]'}${priceInfo}\n\nCordialement`,
        interest: 'sessions'
      }))
    }
  }, [searchParams])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
      
      // If it's a session registration, redirect to confirmation page
      if (isWebinarRegistration) {
        // Store registration data for the confirmation page
        const registrationData = {
          webinar: searchParams.get('webinar'),
          date: searchParams.get('webinarDateTime'),
          location: searchParams.get('webinarLocation'),
          price: searchParams.get('webinarPrice'),
          name: formData.name,
          email: formData.email
        }
        localStorage.setItem('registrationData', JSON.stringify(registrationData))
        
        // Redirect to confirmation page
        window.location.href = '/demande-inscription'
        return
      }
      
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        interest: '',
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const interestOptions = [
    { value: '', label: 'Sélectionnez un domaine' },
    { value: 'sessions', label: 'Sessions' },
    { value: 'comptabilite', label: 'Comptabilité générale' },
    { value: 'salaires', label: 'Gestion des salaires' },
    { value: 'charges-sociales', label: 'Charges sociales' },
    { value: 'impot-source', label: 'Impôt à la source' },
    { value: 'tva', label: 'TVA et fiscalité' },
    { value: 'formation-entreprise', label: 'Formation en entreprise' },
    { value: 'autre', label: 'Autre' },
  ]

  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center"
      >
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2">
          Message envoyé !
        </h3>
        <p className="text-green-700 dark:text-green-300 mb-6">
          Votre message a été envoyé avec succès à contact@helvetiforma.ch. Nous vous répondrons dans les plus brefs délais.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Envoyer un autre message
        </button>
      </motion.div>
    )
  }

  return (
    <>
      {/* Webinar Registration Notice */}
      {isWebinarRegistration && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-blue-500 text-xl">📅</span>
            <div>
              <h3 className="text-blue-800 dark:text-blue-400 font-semibold">
                Inscription à une session
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Le formulaire a été pré-rempli pour votre inscription. Remplissez vos informations personnelles et envoyez votre demande.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom et Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Votre nom complet"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="votre@email.com"
          />
        </div>
      </div>

      {/* Téléphone et Entreprise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="+41 XX XXX XX XX"
          />
        </div>
        
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
            Entreprise
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Nom de votre entreprise"
          />
        </div>
      </div>

      {/* Domaine d'intérêt */}
      <div>
        <label htmlFor="interest" className="block text-sm font-medium text-foreground mb-2">
          Domaine d'intérêt
        </label>
        <select
          id="interest"
          name="interest"
          value={formData.interest}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        >
          {interestOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sujet */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
          Sujet *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          placeholder="Objet de votre demande"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-vertical"
          placeholder="Décrivez votre demande en détail..."
        />
      </div>

      {/* Error Status */}
      {submitStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-xl">❌</span>
            <span className="text-red-700 dark:text-red-300">
              Une erreur est survenue. Veuillez réessayer ou nous contacter directement.
            </span>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <div className="spinner w-5 h-5" />
            Envoi en cours...
          </>
        ) : (
          <>
            <span>📧</span>
            Envoyer le message
          </>
        )}
      </motion.button>

      {/* Privacy Notice */}
      <p className="text-sm text-muted-foreground text-center">
        En soumettant ce formulaire, vous acceptez notre{' '}
        <a href="/privacy" className="text-primary hover:underline">
          politique de confidentialité
        </a>
        . Nous nous engageons à protéger vos données personnelles.
      </p>
    </form>
    </>
  )
}
