'use client'

import { useState } from 'react'

export default function ImageTest() {
  const [testUrl, setTestUrl] = useState('https://api.helvetiforma.ch/wp-content/uploads/2025/10/Logo-1024x1024.png')
  const [proxyUrl, setProxyUrl] = useState('')

  const handleTest = () => {
    const encodedUrl = encodeURIComponent(testUrl)
    setProxyUrl(`/api/proxy-image?url=${encodedUrl}`)
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Test du Proxy d'Images</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">URL de l'image WordPress :</label>
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        onClick={handleTest}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
      >
        Tester le Proxy
      </button>

      {proxyUrl && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">URL du Proxy :</h3>
            <code className="bg-gray-100 p-2 rounded text-sm break-all">{proxyUrl}</code>
          </div>

          <div>
            <h3 className="font-medium mb-2">Image via Proxy :</h3>
            <img
              src={proxyUrl}
              alt="Test image"
              className="max-w-full h-auto border border-gray-300 rounded"
              onLoad={() => console.log('✅ Image chargée avec succès via proxy')}
              onError={(e) => {
                console.error('❌ Erreur de chargement de l\'image:', e)
                console.error('URL du proxy:', proxyUrl)
              }}
            />
          </div>

          <div>
            <h3 className="font-medium mb-2">Image Directe (pour comparaison) :</h3>
            <img
              src={testUrl}
              alt="Test image direct"
              className="max-w-full h-auto border border-gray-300 rounded"
              onLoad={() => console.log('✅ Image chargée directement')}
              onError={(e) => {
                console.error('❌ Erreur de chargement direct:', e)
                console.error('URL directe:', testUrl)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
