import { useState } from 'react'
import './App.css'

function App() {
  const [apiResponse, setApiResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const testBackendConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/hello')
      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      setApiResponse({ error: 'Failed to connect to backend. Make sure the Go server is running on port 8080.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Greact-Bones
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            A modern full-stack skeleton with Go + React
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Technology Stack
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Frontend</h3>
                <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  <li>✓ React + Vite</li>
                  <li>✓ Tailwind CSS</li>
                  <li>✓ TanStack Query</li>
                  <li>✓ Zustand</li>
                </ul>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-300">Backend</h3>
                <ul className="text-sm text-green-600 dark:text-green-400 mt-2">
                  <li>✓ Go + Gin</li>
                  <li>✓ REST API</li>
                  <li>✓ CORS enabled</li>
                  <li>✓ Health checks</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Test Backend Connection
              </h3>
              
              <button
                onClick={testBackendConnection}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Connecting...' : 'Test API Connection'}
              </button>
              
              {apiResponse && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    API Response:
                  </h4>
                  <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-auto">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-gray-500 dark:text-gray-400">
            <p>Edit <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">src/App.jsx</code> to start building your application</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 