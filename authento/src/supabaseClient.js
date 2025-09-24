import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  // Provide clear guidance in the console and on screen if env is missing
  const message = `Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in authento/.env and restart dev server.`
  console.error(message)
  // Also try to render a message if root exists and app hasn't mounted yet
  try {
    const root = document.getElementById('root')
    if (root && !root.children.length) {
      root.innerHTML = '<div style="max-width:720px;margin:40px auto;font-family:sans-serif;line-height:1.5">'+
        '<h2>Configuration required</h2>'+
        '<p>The environment variables <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> are not set.</p>'+ 
        '<p>Create a <code>.env</code> file in the <code>authento/</code> folder and restart the dev server.</p>'+ 
        '<pre style="background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto">VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=YOUR-ANON-KEY</pre>'+
        '</div>'
    }
  } catch {}
  throw new Error('supabaseUrl is required.')
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)