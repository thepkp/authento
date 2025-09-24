import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root')
const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !anon) {
  rootEl.innerHTML = '<div style="max-width:720px;margin:40px auto;font-family:sans-serif;line-height:1.5">'+
    '<h2>Configuration required</h2>'+
    '<p>The environment variables <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> are not set.</p>'+ 
    '<p>Create a <code>.env</code> file in the <code>authento/</code> folder with your Supabase URL and anon key, then restart the dev server.</p>'+ 
    '<pre style="background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto">VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=YOUR-ANON-KEY</pre>'+
    '</div>'
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
