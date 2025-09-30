'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface CTASectionProps {
  title?: string
  subtitle?: string
  cta_primary?: {
    text: string
    link: string
  }
  cta_secondary?: {
    text: string
    link: string
  }
  markdownHtml?: string
}

export default function CTASection({ title, subtitle, cta_primary, cta_secondary, markdownHtml }: CTASectionProps) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-primary via-accent to-helvetiforma-purple rounded-2xl p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24" />
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white rounded-full -translate-y-10" />
          </div>
          
          <div className="relative z-10">
            {/* Title */}
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                {title}
              </motion.h2>
            )}
            
            {/* Subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl mb-8 opacity-90"
              >
                {subtitle}
              </motion.p>
            )}

            {markdownHtml && (
              <div className="prose prose-invert max-w-none text-left md:text-center mx-auto mb-8" dangerouslySetInnerHTML={{ __html: markdownHtml }} />
            )}
            
            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {cta_primary && (
                <Link
                  href={cta_primary.link}
                  className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  {cta_primary.text}
                </Link>
              )}
              
              {cta_secondary && (
                <Link
                  href={cta_secondary.link}
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105"
                >
                  {cta_secondary.text}
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
