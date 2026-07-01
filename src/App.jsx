import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleUpload() {
    if (!file) return
    setStatus('uploading')
    setError('')

    try {
      const res = await fetch(`${API_URL}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content_type: file.type }),
      })
      if (!res.ok) throw new Error(`Backend error: ${res.status}`)
      const { url, key } = await res.json()

      const put = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!put.ok) throw new Error(`S3 upload failed: ${put.status}`)

      setResult({ filename: file.name, key })
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function reset() {
    setFile(null)
    setStatus('idle')
    setResult(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">S3 File Upload</h1>
        <p className="text-sm text-gray-500 mb-6">Upload an image or PDF directly to AWS S3</p>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700 mb-1 block">Select file</span>
          <input
            type="file"
            accept="image/*,.pdf"
            disabled={status === 'uploading'}
            onChange={e => {
              setFile(e.target.files[0] || null)
              setStatus('idle')
              setResult(null)
              setError('')
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </label>

        {file && status === 'idle' && (
          <p className="text-xs text-gray-400 mb-4">
            {file.name} — {(file.size / 1024).toFixed(1)} KB
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'uploading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading…
            </span>
          ) : 'Upload to S3'}
        </button>

        {status === 'success' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold text-sm mb-1">Upload successful!</p>
            <p className="text-green-700 text-xs break-all">File: {result.filename}</p>
            <p className="text-green-600 text-xs mt-0.5 break-all">S3 key: {result.key}</p>
            <button
              onClick={reset}
              className="mt-3 text-xs text-green-700 underline hover:no-underline"
            >
              Upload another
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold text-sm mb-1">Upload failed</p>
            <p className="text-red-600 text-xs break-all">{error}</p>
            <button
              onClick={reset}
              className="mt-3 text-xs text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
