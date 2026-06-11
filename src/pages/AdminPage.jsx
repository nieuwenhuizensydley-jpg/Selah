import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Shield, Users, DollarSign, Tag, Copy, RefreshCw, Check } from 'lucide-react'

// Simulated platform stats (in real app these come from backend)
const PLATFORM_STATS = {
  totalBusinesses: 47,
  activeToday: 12,
  totalRevenue: 'R 142,800',
  appointmentsThisMonth: 1243,
  topPlan: 'Pro',
  newThisWeek: 5,
}

const REGISTERED_BUSINESSES = [
  { name: 'Glow Hair Studio', plan: 'pro',     joined: '2026-05-01', active: true  },
  { name: 'Beauty by Sarah',  plan: 'premium', joined: '2026-04-12', active: true  },
  { name: 'Nails by Priya',   plan: 'free',    joined: '2026-06-01', active: true  },
  { name: 'Salon 19',         plan: 'pro',     joined: '2026-03-20', active: false },
  { name: 'Wax Studio JHB',   plan: 'free',    joined: '2026-06-08', active: true  },
]

function generateCode(type) {
  const prefix = type === 'lifetime' ? 'LIFE' : type === 'beta' ? 'BETA' : type === 'promo' ? 'PROMO' : 'CODE'
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SELAH-${prefix}-${rand}`
}

export default function AdminPage() {
  const { user, subscription, showToast, business } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [generatedCode, setGeneratedCode] = useState(null)
  const [codeType, setCodeType] = useState('lifetime')
  const [copied, setCopied] = useState(false)

  // Only allow access if dev/admin
  const isAdmin = user?.email?.includes('selah') || user?.email?.includes('admin') || subscription.type === 'lifetime' || subscription.type === 'beta'

  if (!isAdmin) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <Shield size={48} color="var(--text-faint)" style={{ marginBottom: 16 }} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>Admin Access Only</div>
      <div style={{ color: 'var(--text-light)', marginBottom: 20 }}>This area is restricted to platform administrators.</div>
      <button className="btn btn-secondary" onClick={() => navigate('/settings')}>← Back to Settings</button>
    </div>
  )

  function handleGenerate() {
    setGeneratedCode(generateCode(codeType))
    setCopied(false)
  }

  function handleCopy() {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const planColor = (plan) => plan === 'premium' ? '#6B3F6B' : plan === 'pro' ? '#A0784A' : '#718096'

  return (
    <div>
      <div className="page-hero" style={{ paddingBottom: 20 }}>
        <button onClick={() => navigate('/settings')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 'var(--r-full)', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Settings
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={28} color="white" />
          <div>
            <div className="hero-title" style={{ fontSize: 26 }}>Admin Dashboard</div>
            <div className="hero-sub">Platform owner control panel</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['overview', 'Overview'], ['businesses', 'Businesses'], ['codes', 'Access Codes']].map(([v, l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ padding: '16px 20px' }}>
          <div className="stat-grid" style={{ padding: 0, marginBottom: 10 }}>
            <div className="stat-card">
              <div className="stat-val">{PLATFORM_STATS.totalBusinesses}</div>
              <div className="stat-lbl">Total Businesses</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ color: 'var(--success)' }}>{PLATFORM_STATS.activeToday}</div>
              <div className="stat-lbl">Active Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{PLATFORM_STATS.newThisWeek}</div>
              <div className="stat-lbl">New This Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{PLATFORM_STATS.appointmentsThisMonth}</div>
              <div className="stat-lbl">Appointments</div>
            </div>
          </div>

          <div className="card card-gold card-pad" style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Platform Revenue</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'white', marginTop: 4 }}>{PLATFORM_STATS.totalRevenue}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Most popular plan: {PLATFORM_STATS.topPlan}</div>
          </div>

          <div style={{ marginTop: 16, background: 'var(--white)', borderRadius: 'var(--r-md)', padding: '16px', border: '1px solid var(--blush-dark)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Plan Distribution</div>
            {[['Premium', 8, '#6B3F6B'], ['Pro', 24, '#A0784A'], ['Free', 15, '#718096']].map(([name, count, color]) => (
              <div key={name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-mid)' }}>{name}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{count} businesses</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(count / PLATFORM_STATS.totalBusinesses) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BUSINESSES ── */}
      {tab === 'businesses' && (
        <div>
          <div className="section-label">Registered Businesses ({REGISTERED_BUSINESSES.length} shown)</div>
          <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden' }}>
            {REGISTERED_BUSINESSES.map((biz, i) => (
              <div key={i} style={{ padding: '14px 16px', borderBottom: i < REGISTERED_BUSINESSES.length - 1 ? '1px solid var(--blush)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${planColor(biz.plan)}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 16, color: planColor(biz.plan), fontWeight: 600 }}>
                  {biz.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{biz.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Joined {biz.joined}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className="badge" style={{ background: `${planColor(biz.plan)}18`, color: planColor(biz.plan), border: `1px solid ${planColor(biz.plan)}40`, fontSize: 10 }}>
                    {biz.plan.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: biz.active ? 'var(--success)' : 'var(--text-faint)' }}>
                    {biz.active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
            Full business management available once connected to backend
          </div>
        </div>
      )}

      {/* ── ACCESS CODES ── */}
      {tab === 'codes' && (
        <div style={{ padding: '16px 20px' }}>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Generate Access Code</div>

            <div className="form-group">
              <label className="form-label">Code Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['lifetime', '♾️ Lifetime Premium'], ['beta', '🧪 Beta Tester'], ['promo', '🎁 Promotional Pro'], ['free', '🆓 Free Plan']].map(([v, l]) => (
                  <button key={v} onClick={() => setCodeType(v)} className={`pay-btn ${codeType === v ? 'sel' : ''}`} style={{ fontSize: 12, padding: '10px 8px' }}>{l}</button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleGenerate}>
              <RefreshCw size={15} /> Generate Code
            </button>

            {generatedCode && (
              <div style={{ marginTop: 14, background: 'var(--blush-mid)', borderRadius: 'var(--r-sm)', padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Generated Code</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)', borderRadius: 'var(--r-sm)', padding: '12px 14px', border: '1px solid var(--blush-dark)' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold-dark)' }}>{generatedCode}</span>
                  <button onClick={handleCopy} style={{ background: copied ? 'var(--success-bg)' : 'var(--blush-mid)', border: 'none', borderRadius: 'var(--r-sm)', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: copied ? 'var(--success)' : 'var(--text-mid)' }}>
                    {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 8 }}>
                  Share this code with the client. They enter it under Settings → Subscription.
                </div>
              </div>
            )}
          </div>

          {/* Built-in codes reference */}
          <div className="card card-pad">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Built-in Codes (always active)</div>
            {[
              ['SELAH-LIFETIME', 'Lifetime Premium', '#6B3F6B'],
              ['SELAH-BETA',     'Beta Tester Access', '#2471A3'],
              ['SELAH-PRO2026',  'Promotional Pro', '#A0784A'],
            ].map(([code, label, color]) => (
              <div key={code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--blush)' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: color }}>{code}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{label}</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(code); showToast('Code copied!') }} style={{ background: 'var(--blush-mid)', border: 'none', borderRadius: 'var(--r-sm)', padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Copy size={11} /> Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="spacer-24" />
    </div>
  )
}
