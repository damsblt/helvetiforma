'use client'

import { motion } from 'framer-motion'

interface ColumnItem {
  title?: string
  description?: string
  emoji?: string
  markdownHtml?: string
  image?: string
  cta?: { text: string; link: string }
}

interface ColumnsSectionProps {
  title?: string
  subtitle?: string
  columns?: 1 | 2 | 3
  columnsContent?: ColumnItem[]
}

export default function ColumnsSection({ title, subtitle, columns = 3, columnsContent = [] }: ColumnsSectionProps) {
  if (!columnsContent || columnsContent.length === 0) return null

  const gridCols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-14">
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-foreground mb-3"
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
                className="text-lg text-muted-foreground max-w-3xl mx-auto"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        <div className={`grid ${gridCols} gap-8`}>
          {columnsContent.map((col, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-background border border-border rounded-xl p-6"
            >
              {col.image && (
                <img src={col.image} alt={col.title || ''} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}

              {col.emoji && (
                <div className="text-4xl mb-3">{col.emoji}</div>
              )}

              {col.title && <h3 className="text-xl font-semibold mb-2">{col.title}</h3>}
              {col.description && <p className="text-muted-foreground mb-3">{col.description}</p>}
              {col.markdownHtml && (
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: col.markdownHtml }} />
              )}
              {col.cta && (
                <a href={col.cta.link} className="inline-flex mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                  {col.cta.text}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


