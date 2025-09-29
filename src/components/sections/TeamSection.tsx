'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface TeamMember {
  name: string
  role: string
  email: string
  phone?: string
  expertise: string[]
  image?: string
}

interface TeamSectionProps {
  title?: string
  subtitle?: string
  items?: TeamMember[]
}

export default function TeamSection({ title, subtitle, items }: TeamSectionProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
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
        
        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
            >
              {/* Photo */}
              <div className="w-24 h-24 mx-auto mb-4 relative">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {member.name}
              </h3>
              
              <p className="text-primary font-medium mb-4">
                {member.role}
              </p>
              
              {/* Contact */}
              <div className="space-y-2 mb-4">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>✉️</span>
                  {member.email}
                </a>
                
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>📞</span>
                    {member.phone}
                  </a>
                )}
              </div>
              
              {/* Expertise */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Expertise :</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {member.expertise.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
