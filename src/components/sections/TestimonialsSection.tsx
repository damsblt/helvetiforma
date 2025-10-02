'use client'

import { motion } from 'framer-motion'

interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
}

interface TestimonialsSectionProps {
  title?: string
  subtitle?: string
  items?: Testimonial[]
}

export default function TestimonialsSection({ title, subtitle, items }: TestimonialsSectionProps) {
  if (!items || items.length === 0) return null

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <section className="py-16 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              {title}
            </motion.h2>
          )}
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary/20 text-4xl">
                "
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              {/* Content */}
              <blockquote className="text-foreground mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              
              {/* Author */}
              <div className="border-t border-border pt-4">
                <div className="font-semibold text-foreground">
                  {testimonial.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
