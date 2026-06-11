import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function RegisterPage() {
  const { register } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ businessName: '', ownerName: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }

  async function handleRegister() {
    if (!form.businessName || !form.ownerName || !form.email || !form.password) {
      setError('All fields are required.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    setLoading(true)
    setError('')
    const result = await register(form.email, form.password, form.businessName, form.ownerName, null)
    setLoading(false)
    if (result.success) {
      navigate('/setup')
    } else {
      setError(result.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-brand">SELAH</div>
      <div className="auth-tagline">Salon Booking</div>

      <div className="auth-card">
        <div className="auth-title">Create your business</div>

        {error && <div className="alert-banner alert-danger" style={{ margin: '0 0 16px' }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Business Name *</label>
          <input className="form-input" placeholder="e.g. Glow Hair Studio" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Your Name *</label>
          <input className="form-input" placeholder="Owner name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password *</label>
          <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRegister()} />
        </div>

        <button className="btn btn-primary btn-full mt-16" onClick={handleRegister} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-light)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
