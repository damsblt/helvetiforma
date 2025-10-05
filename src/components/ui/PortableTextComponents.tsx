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
    <figure className="my-10">
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-lg ring-1 ring-slate-200/50 dark:ring-gray-700/50" style={{ paddingBottom: padding }}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <figcaption className="mt-4 text-center text-sm text-slate-600 dark:text-white italic leading-relaxed">
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
    <div className="my-8 p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/10">
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-slate-600 dark:text-white mb-3 leading-relaxed">
              {description}
            </p>
          )}
          <a
            href={file.asset.url}
            download
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
    <figure className="my-10">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200/50 dark:ring-gray-700/50">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={value.alt || 'Image'}
            className="w-full h-auto"
          />
        )}
      </div>
      {value.caption && (
        <figcaption className="mt-4 text-center text-sm text-slate-600 dark:text-white italic leading-relaxed">
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
      <h1 className="text-4xl font-bold mt-10 mb-6 text-slate-900 dark:text-white leading-tight tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-10 mb-5 text-slate-900 dark:text-white leading-tight tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white leading-tight">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white leading-tight">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mb-6 text-slate-700 dark:text-white leading-relaxed text-lg">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-6 py-4 my-8 italic text-slate-700 dark:text-white bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-r-xl shadow-sm">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside mb-6 space-y-3 text-slate-700 dark:text-white text-lg leading-relaxed">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside mb-6 space-y-3 text-slate-700 dark:text-white text-lg leading-relaxed">
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
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors duration-200"
        >
          {children}
        </a>
      )
    },
    strong: ({ children }) => (
      <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-800 dark:text-white">{children}</em>
    ),
    code: ({ children }) => (
      <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-sm font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
        {children}
      </code>
    ),
  },
}

