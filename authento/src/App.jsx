import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const [mode, setMode] = useState('login')

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? (
        mode === 'login' ? <Login onSwitch={setMode} /> : <Register onSwitch={setMode} />
      ) : (
        <Dashboard key={session.user.id} session={session} />
      )}
    </div>
  )
}

export default App