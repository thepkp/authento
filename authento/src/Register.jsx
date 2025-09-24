import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('employer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, role } } })
    if (error) setError(error.message)
    setLoading(false)
    if (!error) onSwitch('login')
  }

  return (
    <div className="row flex flex-center" style={{ minHeight: '70vh' }}>
      <div className="col-6">
        <div className="auth-card">
          <h2 className="header" style={{ marginBottom: 8 }}>Create Account</h2>
          <p className="description" style={{ marginTop: 0 }}>Register with your email and set a role</p>
          <form onSubmit={onSubmit} className="form-widget">
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employer">Employer</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div className="auth-actions">
              <button className="button primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
              <button className="button" type="button" onClick={() => onSwitch('login')}>Back to login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


