import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hint, setHint] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setHint('')

    // Basic validation to reduce common mistakes
    if (!email.includes('@')) {
      setLoading(false)
      setError('Please enter a valid email address (e.g., name@example.com)')
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Friendlier messages for the most common cases
      if (error.message.toLowerCase().includes('invalid login')) {
        setError('Invalid email or password')
        setHint('If you just registered, check your inbox and confirm your email first.')
      } else {
        setError(error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="row flex flex-center" style={{ minHeight: '70vh' }}>
      <div className="col-6">
        <div className="auth-card">
          <h2 className="header" style={{ marginBottom: 8 }}>Login</h2>
          <p className="description" style={{ marginTop: 0 }}>Use your registered email and password</p>
          <form onSubmit={onSubmit} className="form-widget">
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {hint && <div style={{ color: '#6b7280' }}>{hint}</div>}
            <div className="auth-actions">
              <button className="button primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
              <button className="button" type="button" onClick={() => onSwitch('register')}>Create an account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


