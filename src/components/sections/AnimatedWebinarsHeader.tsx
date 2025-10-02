'use client'

import { motion } from 'framer-motion'

export default function AnimatedWebinarsHeader() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Nos Webinaires
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-300">
        Découvrez nos prochaines sessions en direct
      </p>
    </motion.div>
  )
}

