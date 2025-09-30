'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface PromoBandProps {
  title?: string
  subtitle?: string
  primary?: { text: string; href: string }
  secondary?: { text: string; href: string }
}

export default function PromoBand({
  title = "Prêt à développer vos compétences ?",
  subtitle = "Nous préparons l'édition de contenu avec Payload CMS. Cette section est un exemple de contenu entre le header et le footer.",
  primary = { text: 'Découvrir nos formations', href: '/formations' },
  secondary = { text: 'Nous contacter', href: '/contact' },
}: PromoBandProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl p-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-56 h-56 bg-white rounded-full" />
            <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-white rounded-full" />
          </div>
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold mb-2"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              viewport={{ once: true }}
              className="text-white/90 mb-6"
            >
              {subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href={primary.href} className="bg-white text-blue-700 hover:bg-white/90 px-6 py-3 rounded-lg font-medium text-center">
                {primary.text}
              </Link>
              <Link href={secondary.href} className="border border-white text-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-lg font-medium text-center">
                {secondary.text}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}


