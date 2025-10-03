'use client'

import { PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { useState } from 'react'

// Helper to detect video platform
function getVideoPlatform(url: string): { platform: 'youtube' | 'vimeo' | 'direct' | 'unknown', embedUrl: string } {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }
  }
  
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
  }
  
  if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) {
    return {
      platform: 'direct',
      embedUrl: url
    }
  }
  
  return {
    platform: 'unknown',
    embedUrl: url
  }
}

// Video Embed Component
function VideoEmbed({ value }: { value: any }) {
  const { url, caption, aspectRatio = '16:9' } = value
  const [isLoaded, setIsLoaded] = useState(false)
  
  if (!url) return null
  
  const { platform, embedUrl } = getVideoPlatform(url)
  
  // Calculate padding based on aspect ratio
  const aspectRatioPadding: Record<string, string> = {
    '16:9': '56.25%',
    '4:3': '75%',
    '1:1': '100%',
    '21:9': '42.86%',
  }
  const padding = aspectRatioPadding[aspectRatio] || '56.25%'
  
  return (
    <figure className="my-8">
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800" style={{ paddingBottom: padding }}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}
        
        {platform === 'direct' ? (
          <video
            controls
            className="absolute top-0 left-0 w-full h-full"
            onLoadedData={() => setIsLoaded(true)}
          >
            <source src={embedUrl} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        ) : platform !== 'unknown' ? (
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-red-600">
            Format de vidéo non supporté
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// File Download Component
function FileDownload({ value }: { value: any }) {
  const { file, title, description } = value
  
  if (!file?.asset) return null
  
  return (
    <div className="my-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {description}
            </p>
          )}
          <a
            href={file.asset.url}
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger
          </a>
        </div>
      </div>
    </div>
  )
}

// Custom Image Component
function CustomImage({ value }: { value: any }) {
  if (!value?.asset) return null
  
  const imageUrl = urlFor(value)?.width(800).url()
  
  return (
    <figure className="my-8">
      <div className="relative w-full overflow-hidden rounded-lg">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={value.alt || 'Image'}
            className="w-full h-auto"
          />
        )}
      </div>
      {value.caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 italic">
          {value.caption}
        </figcaption>
      )}
    </figure>
  )
}

// Export custom components for PortableText
export const portableTextComponents: PortableTextComponents = {
  types: {
    image: CustomImage,
    videoEmbed: VideoEmbed,
    fileDownload: FileDownload,
  },
  block: {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-600 pl-4 py-2 my-6 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a
          href={value.href}
          rel={rel}
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          {children}
        </a>
      )
    },
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-primary-600 dark:text-primary-400">
        {children}
      </code>
    ),
  },
}

