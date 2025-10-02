'use client'

import { motion } from 'framer-motion'
import { Suspense } from 'react'
import ContactForm from '@/components/forms/ContactForm'

export default function AnimatedContactForm() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-foreground dark:text-white mb-6">
        Envoyez-nous un message
      </h2>
      <p className="text-muted-foreground dark:text-gray-300 mb-8">
        Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
      </p>
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <ContactForm />
      </Suspense>
    </motion.div>
  )
}

