'use client'

import { motion } from 'framer-motion'

const contactItems = [
  {
    icon: '📍',
    title: 'Adresse',
    content: [
      'HelvetiForma SA',
      'Rue de la Formation 15',
      '1200 Genève',
      'Suisse'
    ],
    link: 'https://maps.google.com/?q=Rue+de+la+Formation+15,+1200+Genève',
    linkText: 'Voir sur la carte'
  },
  {
    icon: '📞',
    title: 'Téléphone',
    content: ['+41 22 123 45 67'],
    link: 'tel:+41221234567',
    linkText: 'Appeler maintenant'
  },
  {
    icon: '✉️',
    title: 'Email',
    content: ['contact@helvetiforma.ch'],
    link: 'mailto:contact@helvetiforma.ch',
    linkText: 'Envoyer un email'
  },
  {
    icon: '🕒',
    title: 'Horaires',
    content: [
      'Lun-Ven: 8h00-18h00',
      'Sam: 9h00-12h00',
      'Dim: Fermé'
    ]
  }
]

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      {contactItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-background border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">{item.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <div className="space-y-1">
                {item.content.map((line, lineIndex) => (
                  <p key={lineIndex} className="text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
              {item.link && (
                <a
                  href={item.link}
                  target={item.link.startsWith('http') ? '_blank' : undefined}
                  rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2 mt-3 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {item.linkText}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Quick Response Promise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-primary/10 border border-primary/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⚡</span>
          <h3 className="font-semibold text-foreground">Réponse Rapide Garantie</h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Nous nous engageons à vous répondre dans les 24 heures maximum, 
          souvent bien plus rapidement pendant les heures ouvrables.
        </p>
        <div className="flex items-center gap-2 text-sm text-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Conseil gratuit et sans engagement</span>
        </div>
      </motion.div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🚨</span>
          <h3 className="font-semibold text-foreground">Support Urgent</h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Pour toute urgence technique ou pédagogique en dehors des heures ouvrables :
        </p>
        <div className="space-y-2">
          <a
            href="tel:+41221234599"
            className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            <span>📞</span>
            <span className="font-medium">+41 22 123 45 99</span>
          </a>
          <a
            href="mailto:urgent@helvetiforma.ch"
            className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            <span>✉️</span>
            <span className="font-medium">urgent@helvetiforma.ch</span>
          </a>
        </div>
      </motion.div>
    </div>
  )
}
