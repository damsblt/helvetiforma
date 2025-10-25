'use client'

import { useState } from 'react'

export default function WordPressMediaTest() {
  const [mediaId, setMediaId] = useState('4630')
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testMediaAccess = async () => {
    setLoading(true)
    setTestResults(null)

    const results: any = {
      mediaId,
      tests: []
    }

    try {
      // Test 1: Accès direct à l'API WordPress Media
      console.log('🔍 Test 1: Accès direct à l\'API WordPress Media')
      const directUrl = `https://api.helvetiforma.ch/wp-json/wp/v2/media/${mediaId}`
      
      try {
        const directResponse = await fetch(directUrl)
        results.tests.push({
          name: 'Accès direct API WordPress',
          url: directUrl,
          status: directResponse.status,
          success: directResponse.ok,
          data: directResponse.ok ? await directResponse.json() : await directResponse.text()
        })
      } catch (error) {
        results.tests.push({
          name: 'Accès direct API WordPress',
          url: directUrl,
          success: false,
          error: error.message
        })
      }

      // Test 2: Accès via notre proxy
      console.log('🔍 Test 2: Accès via notre proxy')
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(`https://api.helvetiforma.ch/wp-content/uploads/2025/10/Logo-1024x1024.png`)}`
      
      try {
        const proxyResponse = await fetch(proxyUrl)
        results.tests.push({
          name: 'Accès via proxy',
          url: proxyUrl,
          status: proxyResponse.status,
          success: proxyResponse.ok,
          contentType: proxyResponse.headers.get('content-type')
        })
      } catch (error) {
        results.tests.push({
          name: 'Accès via proxy',
          url: proxyUrl,
          success: false,
          error: error.message
        })
      }

      // Test 3: Test de l'URL d'image directe
      console.log('🔍 Test 3: Test de l\'URL d\'image directe')
      const imageUrl = `https://api.helvetiforma.ch/wp-content/uploads/2025/10/Logo-1024x1024.png`
      
      try {
        const imageResponse = await fetch(imageUrl, { method: 'HEAD' })
        results.tests.push({
          name: 'Accès direct image',
          url: imageUrl,
          status: imageResponse.status,
          success: imageResponse.ok,
          contentType: imageResponse.headers.get('content-type')
        })
      } catch (error) {
        results.tests.push({
          name: 'Accès direct image',
          url: imageUrl,
          success: false,
          error: error.message
        })
      }

      // Test 4: Test avec authentification WordPress
      console.log('🔍 Test 4: Test avec authentification WordPress')
      const auth = Buffer.from(`${process.env.NEXT_PUBLIC_WORDPRESS_APP_USER || 'damien.balet@me.com'}:${process.env.NEXT_PUBLIC_WORDPRESS_APP_PASSWORD || 'EchU Msw4 5veB hETM aJvb Omcw'}`).toString('base64')
      
      try {
        const authResponse = await fetch(`https://api.helvetiforma.ch/wp-json/wp/v2/media/${mediaId}`, {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        })
        results.tests.push({
          name: 'Accès avec authentification',
          url: `https://api.helvetiforma.ch/wp-json/wp/v2/media/${mediaId}`,
          status: authResponse.status,
          success: authResponse.ok,
          data: authResponse.ok ? await authResponse.json() : await authResponse.text()
        })
      } catch (error) {
        results.tests.push({
          name: 'Accès avec authentification',
          url: `https://api.helvetiforma.ch/wp-json/wp/v2/media/${mediaId}`,
          success: false,
          error: error.message
        })
      }

    } catch (error) {
      console.error('❌ Erreur générale:', error)
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Test d'Accès aux Médias WordPress</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">ID du média WordPress :</label>
        <input
          type="text"
          value={mediaId}
          onChange={(e) => setMediaId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="4630"
        />
      </div>

      <button
        onClick={testMediaAccess}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {loading ? 'Test en cours...' : 'Tester l\'accès aux médias'}
      </button>

      {testResults && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Résultats des tests :</h3>
          
          {testResults.tests.map((test: any, index: number) => (
            <div key={index} className={`p-4 rounded-lg border ${test.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{test.name}</h4>
                <span className={`px-2 py-1 rounded text-sm ${test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {test.success ? '✅ Succès' : '❌ Échec'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <strong>URL :</strong> <code className="bg-gray-100 px-1 rounded">{test.url}</code>
              </div>
              
              {test.status && (
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Status HTTP :</strong> {test.status}
                </div>
              )}
              
              {test.contentType && (
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Content-Type :</strong> {test.contentType}
                </div>
              )}
              
              {test.error && (
                <div className="text-sm text-red-600 mb-2">
                  <strong>Erreur :</strong> {test.error}
                </div>
              )}
              
              {test.data && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium">Données de réponse</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Test d'affichage d'image */}
      {testResults && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Test d'affichage d'image :</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Image via Proxy :</h4>
              <img
                src={`/api/proxy-image?url=${encodeURIComponent('https://api.helvetiforma.ch/wp-content/uploads/2025/10/Logo-1024x1024.png')}`}
                alt="Test via proxy"
                className="w-full h-auto border border-gray-300 rounded"
                onLoad={() => console.log('✅ Image proxy chargée')}
                onError={(e) => console.error('❌ Erreur image proxy:', e)}
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Image Directe :</h4>
              <img
                src="https://api.helvetiforma.ch/wp-content/uploads/2025/10/Logo-1024x1024.png"
                alt="Test direct"
                className="w-full h-auto border border-gray-300 rounded"
                onLoad={() => console.log('✅ Image directe chargée')}
                onError={(e) => console.error('❌ Erreur image directe:', e)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
