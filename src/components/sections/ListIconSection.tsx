'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PortableTextBlock } from '@portabletext/types'
import PortableText from '@/components/ui/PortableText'

interface ListItem {
  title: string
  description: string
  icon?: string
  iconColor?: 'blue' | 'green' | 'purple' | 'orange'
}

interface ListIconSectionProps {
  title?: string
  subtitle?: string
  description?: PortableTextBlock[]
  items: ListItem[]
  ctaText?: string
  ctaLink?: string
}

const iconColorClasses = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-600',
}

export default function ListIconSection({
  title,
  subtitle,
  description,
  items,
  ctaText,
  ctaLink,
}: ListIconSectionProps) {
  // Helper function to convert full URLs to relative paths
  const normalizeUrl = (url: string | undefined): string => {
    if (!url) return ''
    // If it's a full URL (http/https), extract just the path
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const urlObj = new URL(url)
        return urlObj.pathname
      } catch (e) {
        return url
      }
    }
    return url
  }

  const normalizedCtaLink = normalizeUrl(ctaLink)

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-center">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title && (
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-xl text-gray-600 dark:text-white mb-6">
                {subtitle}
              </p>
            )}

            {description && description.length > 0 && (
              <div className="text-gray-600 dark:text-white mb-8 prose prose-lg max-w-none">
                <PortableText content={description} />
              </div>
            )}

            {ctaText && normalizedCtaLink && (
              <Link
                href={normalizedCtaLink}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-lg group"
              >
                {ctaText}
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}
          </motion.div>

          {/* Right Column: List Items */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-white dark:to-gray-800 rounded-2xl p-8"
          >
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${
                    iconColorClasses[item.iconColor || 'blue']
                  }`}
                >
                  {item.icon || '✓'}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-white">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

