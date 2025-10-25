import ImageTest from '@/components/ImageTest'
import WordPressMediaTest from '@/components/WordPressMediaTest'

export default function TestImagesPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-6xl px-4 space-y-8">
        <WordPressMediaTest />
        <ImageTest />
      </div>
    </main>
  )
}
