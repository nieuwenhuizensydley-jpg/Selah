import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Scissors, Sparkles, CheckCircle } from 'lucide-react'

const OPTIONS = [
  {
    value: 'hair',
    icon: '✂️',
    title: 'Hair Salon',
    desc: 'Colour formulas, developer, hair record cards, cut & colour services',
    features: ['Hair Record Cards', 'Colour Formula Tracking', 'Developer & Product Logs'],
    color: '#A0784A',
  },
  {
    value: 'beauty',
    icon: '💅',
    title: 'Beauty Studio',
    desc: 'Nails, lashes, brows, waxing, facials, makeup & aesthetics',
    features: ['Beauty Record Cards', 'Skin Reaction Tracking', 'Treatment Notes & Follow-up'],
    color: '#8B5E8B',
  },
  {
    value: 'both',
    icon: '✨',
    title: 'Hair & Beauty',
    desc: 'Full salon — both hair and beauty record cards available',
    features: ['Hair Record Cards', 'Beauty Record Cards', 'All Services Unlocked'],
    color: '#5C7A5C',
    recommended: true,
  },
]

export default function OnboardingPage() {
  const { setBusiness, business, showToast } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('both')

  function handleContinue() {
    setBusiness(b => ({ ...b, salonType: selected }))
    showToast('Welcome to Selah! 🎉')
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--blush)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 32px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: '0.18em', color: 'var(--gold-dark)', marginBottom: 6 }}>SELAH</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-dark)', marginBottom: 8 }}>Welcome, {business?.name}!</div>
        <div style={{ fontSize: 14, color: 'var(--text-light)', maxWidth: 300, lineHeight: 1.6 }}>
          What type of salon are you? This unlocks the right record cards and features for your business.
        </div>
      </div>

      {/* Options */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {OPTIONS.map(opt => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              style={{
                width: '100%',
                background: isSelected ? 'var(--white)' : 'var(--white)',
                border: `2.5px solid ${isSelected ? opt.color : 'var(--blush-dark)'}`,
                borderRadius: 'var(--r-lg)',
                padding: '18px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                boxShadow: isSelected ? `0 4px 20px ${opt.color}25` : 'var(--shadow-xs)',
                transition: 'all 0.2s',
              }}
            >
              {opt.recommended && (
                <div style={{ position: 'absolute', top: -10, right: 16, background: opt.color, color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 'var(--r-full)', textTransform: 'uppercase' }}>
                  Most Popular
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ fontSize: 30, lineHeight: 1, marginTop: 2 }}>{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: isSelected ? opt.color : 'var(--text-dark)' }}>{opt.title}</div>
                    {isSelected && <CheckCircle size={20} color={opt.color} />}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4, lineHeight: 1.5 }}>{opt.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                    {opt.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isSelected ? opt.color : 'var(--text-light)', fontWeight: isSelected ? 600 : 400 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? opt.color : 'var(--blush-dark)', flexShrink: 0 }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Note */}
      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
        You can change this later in Settings
      </div>

      {/* Continue button */}
      <div style={{ width: '100%', maxWidth: 420, marginTop: 28 }}>
        <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: 16 }} onClick={handleContinue}>
          Continue to Selah →
        </button>
      </div>
    </div>
  )
}
