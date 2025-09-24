import { useState } from 'react'

export default function VerifyForm({ session }) {
  const [form, setForm] = useState({
    name: '',
    roll_number: '',
    marks: '',
    degree: '',
    issue_date: '',
    institution: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const token = (await session?.access_token) || (await window?.localStorage?.getItem('sb-access-token'))
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || data?.message || 'Verification failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3>Verify Certificate</h3>
      <form onSubmit={onSubmit} className="form-widget" style={{ maxWidth: 640 }}>
        <div>
          <label htmlFor="roll_number">Certificate / Roll Number</label>
          <input id="roll_number" name="roll_number" type="text" required value={form.roll_number} onChange={onChange} />
        </div>
        <div>
          <label htmlFor="name">Student Name</label>
          <input id="name" name="name" type="text" value={form.name} onChange={onChange} />
        </div>
        <div>
          <label htmlFor="marks">Marks</label>
          <input id="marks" name="marks" type="text" value={form.marks} onChange={onChange} />
        </div>
        <div>
          <label htmlFor="degree">Degree</label>
          <input id="degree" name="degree" type="text" value={form.degree} onChange={onChange} />
        </div>
        <div>
          <label htmlFor="issue_date">Issue Date</label>
          <input id="issue_date" name="issue_date" type="date" value={form.issue_date} onChange={onChange} />
        </div>
        <div>
          <label htmlFor="institution">Institution</label>
          <input id="institution" name="institution" type="text" value={form.institution} onChange={onChange} />
        </div>
        <div>
          <button className="button primary" type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
        </div>
      </form>

      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <h4>Result: {result.verdict}</h4>
          {result.confidence_score !== undefined && <p>Confidence: {result.confidence_score}%</p>}
          <ul>
            {(result.details || []).map((d, i) => (
              <li key={i}>{d.field}: {d.status}{d.expected ? ` (expected: ${d.expected}, found: ${d.found})` : ''}</li>
            ))}
          </ul>
          <small>{result.timestamp}</small>
        </div>
      )}
    </div>
  )
}


