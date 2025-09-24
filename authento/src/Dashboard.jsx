import { useState } from 'react'
import { supabase } from './supabaseClient'
import VerifyForm from './VerifyForm'
import BulkUpload from './BulkUpload'
import Stats from './Stats'
import CertificatesForm from './CertificatesForm'
import OCRUpload from './OCRUpload'

export default function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('verify')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 20 }}>
        <div className="col-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>AUTHENTO Dashboard</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>{session?.user?.email}</span>
            <button className="button" type="button" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <div className="col-12" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`button ${activeTab === 'verify' ? 'primary' : ''}`} onClick={() => setActiveTab('verify')}>Verify</button>
          <button className={`button ${activeTab === 'add' ? 'primary' : ''}`} onClick={() => setActiveTab('add')}>Add Certificate</button>
          <button className={`button ${activeTab === 'ocr' ? 'primary' : ''}`} onClick={() => setActiveTab('ocr')}>OCR Upload</button>
          <button className={`button ${activeTab === 'bulk' ? 'primary' : ''}`} onClick={() => setActiveTab('bulk')}>Bulk Upload</button>
          <button className={`button ${activeTab === 'stats' ? 'primary' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {activeTab === 'verify' && <VerifyForm session={session} />}
          {activeTab === 'add' && <CertificatesForm />}
          {activeTab === 'ocr' && <OCRUpload />}
          {activeTab === 'bulk' && <BulkUpload session={session} />}
          {activeTab === 'stats' && <Stats session={session} />}
        </div>
      </div>
    </div>
  )
}


