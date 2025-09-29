'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatItem {
  number: string
  label: string
}

interface StatsSectionProps {
  title?: string
  items?: StatItem[]
}

// Hook pour animer les nombres
function useCountUp(end: string, duration: number = 2000) {
  const [count, setCount] = useState('0')
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    // Extraire le nombre de la chaîne (ex: "500+" -> 500)
    const numericValue = parseInt(end.replace(/[^0-9]/g, ''))
    if (isNaN(numericValue)) {
      setCount(end)
      return
    }

    const suffix = end.replace(/[0-9]/g, '')
    let startTime: number | null = null
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const currentValue = Math.floor(progress * numericValue)
      setCount(currentValue + suffix)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration, hasStarted])

  return { count, startAnimation: () => setHasStarted(true) }
}

function AnimatedStat({ item, delay }: { item: StatItem; delay: number }) {
  const { count, startAnimation } = useCountUp(item.number)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      onViewportEnter={startAnimation}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-2">
        {count}
      </div>
      <div className="text-lg text-muted-foreground">
        {item.label}
      </div>
    </motion.div>
  )
}

export default function StatsSection({ title, items }: StatsSectionProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16"
          >
            {title}
          </motion.h2>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {items.map((item, index) => (
            <AnimatedStat
              key={index}
              item={item}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
