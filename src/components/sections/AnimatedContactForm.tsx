'use client'

import { motion } from 'framer-motion'
import { Suspense } from 'react'
import ContactForm from '@/components/forms/ContactForm'

export default function AnimatedContactForm() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <h2 className="text-4xl font-bold text-foreground dark:text-white mb-6">
        Envoyez-nous un message
      </h2>
      <p className="text-lg text-muted-foreground dark:text-gray-300 mb-12 max-w-2xl mx-auto">
        Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
      </p>
      <div className="bg-background border border-border rounded-2xl p-8 shadow-lg">
        <Suspense fallback={<div>Chargement du formulaire...</div>}>
          <ContactForm />
        </Suspense>
      </div>
    </motion.div>
  )
}

