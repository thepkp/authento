import { useState } from 'react'
import Tesseract from 'tesseract.js'
import { supabase } from './supabaseClient'

// Defer pdfjs loading to runtime to avoid breaking the app on startup

export default function OCRUpload() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function renderPdfToImage(file) {
    const pdfjsLib = await import('pdfjs-dist')
    // Attempt to use min worker; fallback if pathing fails
    try {
      const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
    } catch {}
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: context, viewport }).promise
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
  }

  const onExtract = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      let input = file
      if (file.type === 'application/pdf') {
        const imageBlob = await renderPdfToImage(file)
        input = imageBlob
      }
      const { data } = await Tesseract.recognize(input, 'eng', { logger: () => {} })
      setText(data.text || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      // Ensure a storage bucket named 'documents' exists and RLS allows authenticated uploads
      const fileExt = file.name.split('.').pop()
      const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { data, error } = await supabase.storage.from('documents').upload(filePath, file, { upsert: false })
      if (error) throw error
      const { data: publicUrl } = supabase.storage.from('documents').getPublicUrl(data.path)
      setUploadUrl(publicUrl.publicUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3>OCR Upload</h3>
      <div className="form-widget" style={{ maxWidth: 640 }}>
        <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="button" onClick={onExtract} disabled={loading || !file}>{loading ? 'Processing...' : 'Extract Text'}</button>
          <button className="button" onClick={onUpload} disabled={loading || !file}>Upload to Storage</button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {uploadUrl && <div>Uploaded: <a href={uploadUrl} target="_blank" rel="noreferrer">View</a></div>}
        <label>Extracted Text</label>
        <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
    </div>
  )
}


