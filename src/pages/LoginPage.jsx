import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-brand">SELAH</div>
      <div className="auth-tagline">Salon Booking</div>

      <div className="auth-card">
        <div className="auth-title">Welcome back</div>

        {error && <div className="alert-banner alert-danger" style={{ margin: '0 0 16px' }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ paddingRight: 44 }} />
            <button onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button className="btn btn-primary btn-full mt-16" onClick={handleLogin} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-light)' }}>
          New business? <Link to="/register" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
        </p>
      </div>

      <p style={{ marginTop: 36, fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textAlign: 'center' }}>© 2026 SELAH · All rights reserved</p>
    </div>
  )
}
