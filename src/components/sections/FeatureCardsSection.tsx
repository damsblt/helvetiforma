'use client'

import { motion } from 'framer-motion'

interface FeatureCard {
  title: string
  description: string
  icon?: string
  iconColor?: 'blue' | 'green' | 'purple' | 'orange'
}

interface FeatureCardsSectionProps {
  title?: string
  subtitle?: string
  cards: FeatureCard[]
  columns?: number
}

const iconColorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
}

export default function FeatureCardsSection({
  title,
  subtitle,
  cards,
  columns = 3,
}: FeatureCardsSectionProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Feature Cards Grid */}
        <div className={`grid grid-cols-1 ${gridCols} gap-8 max-w-7xl mx-auto`}>
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Icon */}
              {card.icon && (
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto ${
                    iconColorClasses[card.iconColor || 'blue']
                  }`}
                >
                  {card.icon}
                </div>
              )}

              {/* Card Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {card.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

