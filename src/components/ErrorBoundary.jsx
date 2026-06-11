import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Selah Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#FAF6F1', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#A0784A', marginBottom: 8, letterSpacing: '0.1em' }}>SELAH</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1E1410', marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 14, color: '#9C826E', marginBottom: 32, maxWidth: 280, lineHeight: 1.6 }}>
            Don't worry — tap the button below to reload the app. Your data is safe.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #7A5A35, #C9A96E)', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          >
            Reload App
          </button>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: 24, padding: 16, background: '#fee2e2', borderRadius: 8, fontSize: 12, color: '#c0392b', maxWidth: 380, textAlign: 'left', wordBreak: 'break-all' }}>
              {this.state.error?.toString()}
            </div>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
