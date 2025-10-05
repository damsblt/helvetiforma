'use client'

import { motion } from 'framer-motion'
import PortableText from '@/components/ui/PortableText'

interface AnimatedRichTextSectionProps {
  section: {
    _key: string
    title?: string
    subtitle?: string
    content?: any[]
    backgroundColor?: string
  }
}

export default function AnimatedRichTextSection({ section }: AnimatedRichTextSectionProps) {
  const bgColor = section.backgroundColor === 'gray' 
    ? 'bg-gray-50 dark:bg-gray-800' 
    : section.backgroundColor === 'lightblue' 
    ? 'bg-blue-50 dark:bg-blue-900/20' 
    : 'bg-white dark:bg-gray-900'

  return (
    <section className={`${bgColor} py-16`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {section.title && (
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white"
          >
            {section.title}
          </motion.h2>
        )}
        {section.subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-center text-gray-600 dark:text-white mb-8"
          >
            {section.subtitle}
          </motion.p>
        )}
        {section.content && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-4xl mx-auto dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-strong:text-gray-900 dark:prose-strong:text-white"
          >
            <PortableText content={section.content} />
          </motion.div>
        )}
      </div>
    </section>
  )
}
