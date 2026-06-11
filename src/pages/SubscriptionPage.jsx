import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Check, Lock, Unlock, ArrowLeft, Tag } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'R0',
    period: '/month',
    yearlyPrice: null,
    color: '#718096',
    features: [
      { label: 'Client Management', included: true },
      { label: 'Appointment Calendar', included: true },
      { label: 'Point of Sale / Checkout', included: true },
      { label: 'Up to 50 Clients', included: true },
      { label: 'Inventory Management', included: false },
      { label: 'Expense Tracking', included: false },
      { label: 'Reports & Analytics', included: false },
      { label: 'Staff Management', included: false },
      { label: 'White-Label Branding', included: false },
      { label: 'Export to CSV / PDF', included: false },
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R119',
    period: '/month',
    yearlyPrice: 'R1,099',
    yearlySaving: 'Save R329',
    color: '#A0784A',
    popular: true,
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'Unlimited Clients', included: true },
      { label: 'Inventory Management', included: true },
      { label: 'Expense Tracking', included: true },
      { label: 'Reports & Analytics', included: true },
      { label: 'Staff Management', included: true },
      { label: 'End of Day Cash-Up', included: true },
      { label: 'White-Label Branding', included: false },
      { label: 'Export to CSV / PDF', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R199',
    period: '/month',
    yearlyPrice: 'R1,999',
    yearlySaving: 'Save R389',
    color: '#6B3F6B',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'White-Label Branding', included: true },
      { label: 'Logo & Colour Themes', included: true },
      { label: 'Export to CSV / PDF', included: true },
      { label: 'Advanced Reports', included: true },
      { label: 'Priority Support', included: true },
    ]
  }
]

export default function SubscriptionPage() {
  const { subscription, redeemCode, showToast } = useApp()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [codeMsg, setCodeMsg] = useState(null)
  const [showCodeInput, setShowCodeInput] = useState(false)

  function handleRedeem() {
    if (!code.trim()) return
    const result = redeemCode(code)
    setCodeMsg(result)
    if (result.success) {
      showToast(result.message)
      setCode('')
      setTimeout(() => setCodeMsg(null), 4000)
    }
  }

  const [billing, setBilling] = useState('monthly')

  const planLabels = { free: 'Free', pro: 'Pro', premium: 'Premium' }

  return (
    <div>
      <div className="page-header-simple">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/settings')} className="btn-icon btn"><ArrowLeft size={18} /></button>
          <div>
            <div className="page-title">Subscription</div>
            <div className="page-subtitle">Manage your plan</div>
          </div>
        </div>
      </div>

      {/* Current plan badge */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: subscription.plan === 'premium' ? 'linear-gradient(135deg, #6B3F6B, #9B5E9B)' : subscription.plan === 'pro' ? 'linear-gradient(135deg, #7A5A35, #C9A96E)' : 'linear-gradient(135deg, #4A5568, #718096)', borderRadius: 'var(--r-md)', padding: '16px 20px', color: 'white' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current Plan</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginTop: 4 }}>{planLabels[subscription.plan]} {subscription.type === 'lifetime' ? '· Lifetime' : subscription.type === 'beta' ? '· Beta' : ''}</div>
          {subscription.code && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Code: {subscription.code}</div>}
        </div>
      </div>

      {/* Access code */}
      <div style={{ padding: '16px 20px 0' }}>
        <button onClick={() => setShowCodeInput(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--white)', border: '1.5px solid var(--blush-dark)', borderRadius: 'var(--r-md)', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--gold-dark)' }}>
          <Tag size={17} color="var(--gold-dark)" />
          Have an access code? Tap to enter
        </button>

        {showCodeInput && (
          <div style={{ marginTop: 10, background: 'var(--white)', border: '1px solid var(--blush-dark)', borderRadius: 'var(--r-md)', padding: '16px' }}>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Access Code</label>
              <input
                className="form-input"
                placeholder="Enter your access code"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
                onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                autoFocus
              />
            </div>
            {codeMsg && (
              <div className={`alert-banner ${codeMsg.success ? 'alert-success' : 'alert-danger'}`} style={{ margin: '0 0 10px' }}>
                {codeMsg.message}
              </div>
            )}
            <button className="btn btn-primary btn-full" onClick={handleRedeem}>
              <Unlock size={15} /> Redeem Code
            </button>
          </div>
        )}
      </div>

      {/* Billing toggle */}
      <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', background: 'var(--blush-mid)', borderRadius: 'var(--r-full)', padding: 4, gap: 4 }}>
          {[['monthly', 'Monthly'], ['yearly', 'Yearly']].map(([v, l]) => (
            <button key={v} onClick={() => setBilling(v)} style={{ padding: '8px 22px', borderRadius: 'var(--r-full)', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: billing === v ? 'var(--white)' : 'transparent', color: billing === v ? 'var(--gold-dark)' : 'var(--text-light)', boxShadow: billing === v ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}>
              {l} {v === 'yearly' && <span style={{ fontSize: 10, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 6px', borderRadius: 'var(--r-full)', marginLeft: 4, fontWeight: 700 }}>Save more</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="section-label">Choose a Plan</div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PLANS.map(plan => {
          const isCurrent = subscription.plan === plan.id
          return (
            <div key={plan.id} style={{ background: 'var(--white)', border: `2px solid ${isCurrent ? plan.color : 'var(--blush-dark)'}`, borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: isCurrent ? 'var(--shadow-md)' : 'var(--shadow-xs)', position: 'relative' }}>
              {plan.popular && !isCurrent && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: plan.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)', letterSpacing: '0.06em' }}>POPULAR</div>
              )}
              {isCurrent && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: plan.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={10} strokeWidth={3} /> ACTIVE
                </div>
              )}

              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--blush)' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: plan.color }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text-dark)' }}>
                    {billing === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-light)' }}>
                    {billing === 'yearly' && plan.yearlyPrice ? '/year' : plan.period}
                  </span>
                </div>
                {billing === 'yearly' && plan.yearlySaving && (
                  <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700, marginTop: 4 }}>✓ {plan.yearlySaving} vs monthly</div>
                )}
                {billing === 'monthly' && plan.yearlyPrice && (
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>or {plan.yearlyPrice}/year</div>
                )}
              </div>

              {/* Features */}
              <div style={{ padding: '14px 20px' }}>
                {plan.features.map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 13 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: f.included ? `${plan.color}18` : 'var(--blush-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {f.included
                        ? <Check size={11} color={plan.color} strokeWidth={3} />
                        : <Lock size={10} color="var(--text-faint)" />
                      }
                    </div>
                    <span style={{ color: f.included ? 'var(--text-dark)' : 'var(--text-faint)', fontWeight: f.included ? 500 : 400 }}>{f.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {!isCurrent && (
                <div style={{ padding: '0 20px 16px' }}>
                  <button style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-sm)', border: `2px solid ${plan.color}`, background: 'transparent', color: plan.color, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    {plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6 }}>
        Payment processing coming soon via PayFast & Stripe.{'\n'}
        Use an access code to unlock plans for free in the meantime.
      </div>

      <div className="spacer-24" />
    </div>
  )
}
