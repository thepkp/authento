import { useEffect, useState } from 'react'

export default function Stats({ session }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let ignore = false
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const token = session?.access_token
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verification-stats?days=30`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to fetch stats')
        if (!ignore) setStats(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchStats()
    return () => { ignore = true }
  }, [session])

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!stats) return null

  return (
    <div>
      <h3>Verification Statistics (30 days)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard title="Total" value={stats.total_verifications} />
        <StatCard title="Valid" value={stats.valid_count} />
        <StatCard title="Fake" value={stats.fake_count} />
        <StatCard title="Suspicious" value={stats.suspicious_count} />
        <StatCard title="Success Rate" value={`${stats.success_rate}%`} />
      </div>

      <h4>Recent Verifications</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Certificate</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Result</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Confidence</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {(stats.recent_verifications || []).map((v) => (
            <tr key={v.id}>
              <td style={{ borderBottom: '1px solid #f1f1f1', padding: 8 }}>{v.certificate_number}</td>
              <td style={{ borderBottom: '1px solid #f1f1f1', padding: 8 }}>{v.result}</td>
              <td style={{ borderBottom: '1px solid #f1f1f1', padding: 8 }}>{v.confidence_score ?? '-'}</td>
              <td style={{ borderBottom: '1px solid #f1f1f1', padding: 8 }}>{v.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 20 }}>Daily Totals</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {(stats.daily_stats || []).map((d) => (
          <div key={d.date} style={{ padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
            <div style={{ fontWeight: 600 }}>{d.date}</div>
            <div>Total: {d.total}</div>
            <div>Valid: {d.valid}</div>
            <div>Fake: {d.fake}</div>
            <div>Suspicious: {d.suspicious}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  )
}


