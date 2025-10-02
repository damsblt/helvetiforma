'use client'

import { motion } from 'framer-motion'

interface ContactItem {
  icon: string
  title: string
  content: string[]
  link?: string
  linkText?: string
}

interface ContactInfoSectionProps {
  title?: string
  subtitle?: string
  contactItems: ContactItem[]
}

export default function ContactInfoSection({
  title,
  subtitle,
  contactItems,
}: ContactInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      {title && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground dark:text-white mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground dark:text-gray-300">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Contact Items */}
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
              <h3 className="font-semibold text-foreground dark:text-white mb-2">
                {item.title}
              </h3>
              <div className="space-y-1">
                {item.content.map((line, lineIndex) => (
                  <p key={lineIndex} className="text-muted-foreground dark:text-gray-300">
                    {line}
                  </p>
                ))}
              </div>
              {item.link && item.linkText && (
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
    </div>
  )
}

