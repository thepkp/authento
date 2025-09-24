import { useState } from 'react'

export default function BulkUpload({ session }) {
  const [jsonText, setJsonText] = useState('[\n  {\n    "certificate_number": "CS-2025-09-001",\n    "student_name": "Alice Kumar",\n    "degree": "Bachelor of Computer Science",\n    "issue_date": "2025-06-15",\n    "marks": "85%",\n    "institution": "Tech University"\n  }\n]')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) throw new Error('Top-level JSON must be an array of certificates')
      const token = session?.access_token
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/certificates-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({ certificates: parsed })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || data?.message || 'Bulk upload failed')
      setResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3>Bulk Upload Certificates (Admin)</h3>
      <form onSubmit={onSubmit} className="form-widget" style={{ maxWidth: 840 }}>
        <div>
          <label htmlFor="json">Certificates JSON</label>
          <textarea id="json" value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={14} style={{ width: '100%', fontFamily: 'monospace' }} />
        </div>
        <div>
          <button className="button primary" type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </form>

      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {response && (
        <div style={{ marginTop: 16 }}>
          <h4>{response.message}</h4>
          <p>Inserted: {response.inserted_count} | Failed: {response.failed_count}</p>
          {response.errors && response.errors.length > 0 && (
            <ul>
              {response.errors.map((e, i) => (
                <li key={i}>Row {e.index} ({e.certificate_number}): {e.error}</li>
              ))}
            </ul>
          )}
          <small>{response.timestamp}</small>
        </div>
      )}
    </div>
  )
}


