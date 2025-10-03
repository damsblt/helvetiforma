'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Card {
  title: string
  description: string
  icon: string
  iconColor: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  detailText?: string
  detailIcon?: string
  detailColor?: 'blue' | 'green' | 'purple' | 'orange'
}

interface Feature {
  text: string
  icon?: string
  color?: 'blue' | 'green' | 'purple'
}

interface ThreeCardsWithCtaSectionProps {
  title: string
  subtitle?: string
  cards: Card[]
  ctaCard: {
    title: string
    subtitle?: string
    primaryButton: {
      text: string
      link: string
      icon?: string
    }
    secondaryButton?: {
      text: string
      link: string
    }
    features?: Feature[]
  }
}

const iconColorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
}

const detailColorClasses = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
}

const featureColorClasses = {
  blue: 'text-blue-500 dark:text-blue-400',
  green: 'text-green-500 dark:text-green-400',
  purple: 'text-purple-500 dark:text-purple-400',
}

export default function ThreeCardsWithCtaSection({
  title,
  subtitle,
  cards,
  ctaCard,
}: ThreeCardsWithCtaSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>

          {/* Three Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {cards.map((card, index) => {
              const iconColorClass = iconColorClasses[card.iconColor] || iconColorClasses.blue
              const detailColorClass = card.detailColor 
                ? detailColorClasses[card.detailColor] 
                : detailColorClasses.blue

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className={`w-16 h-16 ${iconColorClass} rounded-2xl flex items-center justify-center mb-6 text-3xl`}>
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {card.description}
                  </p>
                  {card.detailText && (
                    <div className={`flex items-center text-sm ${detailColorClass} font-medium`}>
                      {card.detailIcon && (
                        <span className="mr-2">{card.detailIcon}</span>
                      )}
                      {card.detailText}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Horizontal CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {ctaCard.title}
              </h3>
              {ctaCard.subtitle && (
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  {ctaCard.subtitle}
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href={ctaCard.primaryButton.link}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {ctaCard.primaryButton.icon && (
                    <span className="mr-2 text-xl">{ctaCard.primaryButton.icon}</span>
                  )}
                  {ctaCard.primaryButton.text}
                </Link>
                {ctaCard.secondaryButton && (
                  <Link
                    href={ctaCard.secondaryButton.link}
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-600 dark:border-blue-400 text-lg font-medium rounded-xl text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                  >
                    {ctaCard.secondaryButton.text}
                  </Link>
                )}
              </div>

              {/* Features */}
              {ctaCard.features && ctaCard.features.length > 0 && (
                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    {ctaCard.features.map((feature, index) => {
                      const featureColorClass = feature.color
                        ? featureColorClasses[feature.color]
                        : 'text-gray-500 dark:text-gray-400'

                      return (
                        <div key={index} className="flex items-center">
                          {feature.icon && (
                            <span className={`mr-2 ${featureColorClass}`}>
                              {feature.icon}
                            </span>
                          )}
                          {feature.text}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
