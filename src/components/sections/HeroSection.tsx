'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/lib/sanity'

interface HeroProps {
  hero: {
    title?: string
    subtitle?: string
    cta_primary?: {
      text?: string
      link?: string
    }
    cta_secondary?: {
      text?: string
      link?: string
    }
    background_image?: string
    backgroundImage?: any  // Sanity image object
    features?: string[]
  }
}

export default function HeroSection({ hero }: HeroProps) {
  // Get the background image URL from Sanity or use the provided string
  const backgroundImageUrl = hero.backgroundImage 
    ? (typeof hero.backgroundImage === 'string' 
        ? hero.backgroundImage 
        : urlFor(hero.backgroundImage).width(1920).height(1080).url())
    : hero.background_image

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundImageUrl ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImageUrl}
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-accent to-helvetiforma-purple" />
      )}
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title */}
          {hero.title && (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              {hero.title}
            </h1>
          )}
          
          {/* Subtitle */}
          {hero.subtitle && (
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              {hero.subtitle}
            </p>
          )}
          
          {/* Features */}
          {hero.features && hero.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {hero.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  {feature}
                </span>
              ))}
            </motion.div>
          )}
          
          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {hero.cta_primary?.text && hero.cta_primary?.link && (
              <Link
                href={hero.cta_primary.link}
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {hero.cta_primary.text}
              </Link>
            )}
            
            {hero.cta_secondary?.text && hero.cta_secondary?.link && (
              <Link
                href={hero.cta_secondary.link}
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105"
              >
                {hero.cta_secondary.text}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  )
}
