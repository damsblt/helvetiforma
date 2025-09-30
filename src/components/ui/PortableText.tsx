import { PortableText as PortableTextReact } from '@portabletext/react'
import { PortableTextBlock } from '@portabletext/types'
import { urlFor } from '@/lib/sanity'

interface PortableTextProps {
  content: PortableTextBlock[]
}

const components = {
  block: {
    h1: ({ children }: any) => <h1 className="text-4xl font-bold mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-3xl font-bold mb-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-2xl font-bold mb-3">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-xl font-bold mb-2">{children}</h4>,
    normal: ({ children }: any) => <p className="mb-4 text-gray-600">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-600 pl-4 italic my-4 text-gray-700">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc list-inside mb-4 text-gray-600">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal list-inside mb-4 text-gray-600">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="mb-2">{children}</li>,
    number: ({ children }: any) => <li className="mb-2">{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    link: ({ children, value }: any) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null
      }
      return (
        <div className="my-6">
          <img
            src={urlFor(value).width(800).url()}
            alt={value.alt || 'Image'}
            className="rounded-lg w-full"
          />
          {value.caption && (
            <p className="text-sm text-gray-500 mt-2 text-center">{value.caption}</p>
          )}
        </div>
      )
    },
  },
}

export default function PortableText({ content }: PortableTextProps) {
  if (!content || content.length === 0) {
    return null
  }

  return <PortableTextReact value={content} components={components} />
}

