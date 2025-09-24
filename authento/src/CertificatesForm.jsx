import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function CertificatesForm() {
  const [form, setForm] = useState({
    certificate_number: '',
    student_name: '',
    degree: '',
    issue_date: '',
    marks: '',
    institution: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const { data, error } = await supabase.from('certificates').insert([{ ...form, status: 'pending', verification_result: 'pending' }]).select('id')
      if (error) throw error
      setMessage('Certificate added successfully')
      setForm({ certificate_number: '', student_name: '', degree: '', issue_date: '', marks: '', institution: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3>Add Certificate</h3>
      <form onSubmit={onSubmit} className="form-widget" style={{ maxWidth: 640 }}>
        <div>
          <label htmlFor="certificate_number">Certificate Number</label>
          <input id="certificate_number" name="certificate_number" type="text" value={form.certificate_number} onChange={onChange} required />
        </div>
        <div>
          <label htmlFor="student_name">Student Name</label>
          <input id="student_name" name="student_name" type="text" value={form.student_name} onChange={onChange} required />
        </div>
        <div>
          <label htmlFor="degree">Degree</label>
          <input id="degree" name="degree" type="text" value={form.degree} onChange={onChange} required />
        </div>
        <div>
          <label htmlFor="issue_date">Issue Date</label>
          <input id="issue_date" name="issue_date" type="date" value={form.issue_date} onChange={onChange} required />
        </div>
        <div>
          <label htmlFor="marks">Marks</label>
          <input id="marks" name="marks" type="text" value={form.marks} onChange={onChange} required />
        </div>
        <div>
          <label htmlFor="institution">Institution</label>
          <input id="institution" name="institution" type="text" value={form.institution} onChange={onChange} />
        </div>
        <div>
          <button className="button primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
      {message && <div style={{ color: 'green', marginTop: 12 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
    </div>
  )
}


