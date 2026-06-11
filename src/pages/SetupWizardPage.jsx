import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { applyTheme, THEMES as THEME_MAP } from '../context/ThemeContext'
import { Check, ChevronRight, ChevronLeft, Plus, X, Star } from 'lucide-react'

const THEMES = [
  { id: 'gold',   name: 'Champagne Gold',  preview: 'linear-gradient(135deg, #7A5A35, #C9A96E)' },
  { id: 'rose',   name: 'Rose Gold',       preview: 'linear-gradient(135deg, #8B3A52, #D4849A)' },
  { id: 'silver', name: 'Silver Platinum', preview: 'linear-gradient(135deg, #4A5568, #A0AEC0)' },
  { id: 'teal',   name: 'Teal',            preview: 'linear-gradient(135deg, #234E52, #4FB3B8)' },
  { id: 'forest', name: 'Forest Green',    preview: 'linear-gradient(135deg, #1A3A2A, #4A8C6A)' },
]

const SALON_TYPES = [
  { value: 'hair',   icon: '✂️', title: 'Hair Salon',     desc: 'Colour formulas, record cards, cut & colour services',           color: '#A0784A' },
  { value: 'beauty', icon: '💅', title: 'Beauty Studio',  desc: 'Nails, lashes, brows, waxing, facials, makeup & aesthetics',     color: '#8B5E8B' },
  { value: 'both',   icon: '✨', title: 'Hair & Beauty',  desc: 'Full salon — both hair and beauty features unlocked',            color: '#2E6B4A', recommended: true },
]

const QUICK_SERVICES = {
  hair:   [{ name: 'Root Retouch', category: 'Hair Colour', duration: 120, price: 650, buffer: 15 }, { name: 'Full Highlights', category: 'Hair Colour', duration: 180, price: 1200, buffer: 20 }, { name: 'Haircut & Blowdry', category: 'Hair Cut', duration: 60, price: 380, buffer: 10 }],
  beauty: [{ name: 'Full Set Gel Nails', category: 'Nails', duration: 90, price: 450, buffer: 15 }, { name: 'Pedicure', category: 'Nails', duration: 60, price: 280, buffer: 10 }, { name: 'Eyebrow Wax & Tint', category: 'Brows', duration: 45, price: 180, buffer: 5 }, { name: 'Lash Lift & Tint', category: 'Lashes', duration: 60, price: 350, buffer: 10 }, { name: 'Brazilian Wax', category: 'Waxing', duration: 45, price: 250, buffer: 10 }],
  both:   [{ name: 'Root Retouch', category: 'Hair Colour', duration: 120, price: 650, buffer: 15 }, { name: 'Haircut & Blowdry', category: 'Hair Cut', duration: 60, price: 380, buffer: 10 }, { name: 'Full Set Gel Nails', category: 'Nails', duration: 90, price: 450, buffer: 15 }, { name: 'Pedicure', category: 'Nails', duration: 60, price: 280, buffer: 10 }, { name: 'Eyebrow Wax & Tint', category: 'Brows', duration: 45, price: 180, buffer: 5 }, { name: 'Lash Lift & Tint', category: 'Lashes', duration: 60, price: 350, buffer: 10 }],
}

const STEPS = [
  { id: 'welcome',      title: 'Welcome',          icon: '👋' },
  { id: 'salontype',    title: 'Salon Type',        icon: '🏠' },
  { id: 'branding',     title: 'Branding',          icon: '🎨' },
  { id: 'bizinfo',      title: 'Business Info',     icon: '📋' },
  { id: 'services',     title: 'Services',          icon: '✂️' },
  { id: 'subscription', title: 'Subscription',      icon: '⭐' },
  { id: 'done',         title: 'All Set!',           icon: '🎉' },
]

export default function SetupWizardPage() {
  const { business, setBusiness, setServices, redeemCode, showToast, subscription } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [salonType, setSalonType] = useState('both')
  const [theme, setTheme] = useState('gold')
  const [logo, setLogo] = useState(null)
  const [bizName, setBizName] = useState(business?.name || '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [instagram, setInstagram] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [accessCode, setAccessCode] = useState('')
  const [codeResult, setCodeResult] = useState(null)
  const [customService, setCustomService] = useState({ name: '', price: '', duration: '' })
  const [showCustom, setShowCustom] = useState(false)

  const totalSteps = STEPS.length
  const progress = ((step) / (totalSteps - 1)) * 100

  function handleTheme(id) {
    setTheme(id)
    applyTheme(id)
    setBusiness(b => ({ ...(b||{}), theme: id }))
  }

  function handleLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setLogo(ev.target.result)
    reader.readAsDataURL(file)
  }

  function toggleService(svc) {
    setSelectedServices(p =>
      p.find(s => s.name === svc.name)
        ? p.filter(s => s.name !== svc.name)
        : [...p, { ...svc, id: Date.now() + Math.random(), addons: [] }]
    )
  }

  function addCustomService() {
    if (!customService.name || !customService.price || !customService.duration) return
    const svc = { id: Date.now(), name: customService.name, category: 'Other', duration: Number(customService.duration), price: Number(customService.price), buffer: 10, addons: [] }
    setSelectedServices(p => [...p, svc])
    setCustomService({ name: '', price: '', duration: '' })
    setShowCustom(false)
  }

  function handleCodeRedeem() {
    if (!accessCode.trim()) return
    const result = redeemCode(accessCode)
    setCodeResult(result)
    if (result.success) showToast(result.message)
  }

  function handleFinish() {
    try {
      // Mark setup complete and save all settings
      const cleaned = selectedServices.length > 0
        ? selectedServices.map((s, i) => ({ ...s, id: i + 1, addons: s.addons || [] }))
        : null

      setBusiness(b => ({
        ...b,
        name: bizName || b?.name || 'My Salon',
        phone,
        address,
        logo,
        theme,
        salonType,
        socialLinks: { instagram, facebook: '', tiktok: '' },
        setupComplete: true,
      }))

      if (cleaned) setServices(cleaned)
      showToast('Welcome to Selah! 🎉')

      // Small delay to let state update before navigating
      setTimeout(() => navigate('/'), 50)
    } catch (err) {
      console.error('Setup finish error:', err)
      setBusiness(b => ({ ...b, setupComplete: true }))
      setTimeout(() => navigate('/'), 50)
    }
  }

  function next() { if (step < totalSteps - 1) setStep(s => s + 1) }
  function back() { if (step > 0) setStep(s => s - 1) }

  const currentStep = STEPS[step]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--blush)', display: 'flex', flexDirection: 'column' }}>

      {/* Progress bar */}
      {step > 0 && step < totalSteps - 1 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'var(--blush-dark)', zIndex: 100 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold-deeper), var(--gold))', width: `${progress}%`, transition: 'width 0.4s' }} />
        </div>
      )}

      {/* Step indicator */}
      {step > 0 && step < totalSteps - 1 && (
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={back} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500 }}>
            <ChevronLeft size={18} /> Back
          </button>
          <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600, letterSpacing: '0.06em' }}>
            Step {step} of {totalSteps - 2}
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 13 }}>
            Skip setup
          </button>
        </div>
      )}

      {/* ════════════════════════════════
          STEP 0 — WELCOME
      ════════════════════════════════ */}
      {step === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-deeper), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 32px rgba(122,90,53,0.35)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: 'white', letterSpacing: '0.05em' }}>S</div>
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, letterSpacing: '0.15em', color: 'var(--gold-dark)', marginBottom: 6 }}>SELAH</div>
          <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 32 }}>Salon Booking</div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text-dark)', marginBottom: 12, lineHeight: 1.3 }}>
            Welcome to your new salon!
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-light)', lineHeight: 1.7, maxWidth: 300, marginBottom: 40 }}>
            Let's set up Selah for your business. It takes about 2 minutes and you can always change everything later.
          </div>

          <div style={{ width: '100%', maxWidth: 340 }}>
            <button className="btn btn-primary btn-full" style={{ fontSize: 17, padding: 18 }} onClick={next}>
              Let's get started →
            </button>
            <button onClick={() => navigate('/')} style={{ width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: 14, cursor: 'pointer', padding: 10 }}>
              Skip and go to app
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          STEP 1 — SALON TYPE
      ════════════════════════════════ */}
      {step === 1 && (
        <div style={{ flex: 1, padding: '28px 20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--text-dark)', marginBottom: 6 }}>What type of salon are you?</div>
          <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 28, lineHeight: 1.6 }}>This unlocks the right record cards and features for your business.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {SALON_TYPES.map(opt => {
              const sel = salonType === opt.value
              return (
                <button key={opt.value} onClick={() => setSalonType(opt.value)} style={{ background: 'var(--white)', border: `2.5px solid ${sel ? opt.color : 'var(--blush-dark)'}`, borderRadius: 'var(--r-lg)', padding: '18px 20px', cursor: 'pointer', textAlign: 'left', boxShadow: sel ? `0 4px 20px ${opt.color}25` : 'var(--shadow-xs)', transition: 'all 0.2s', position: 'relative' }}>
                  {opt.recommended && <div style={{ position: 'absolute', top: -10, right: 16, background: opt.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Most Popular</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 32 }}>{opt.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 17, color: sel ? opt.color : 'var(--text-dark)' }}>{opt.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 3, lineHeight: 1.5 }}>{opt.desc}</div>
                    </div>
                    {sel && <div style={{ width: 26, height: 26, borderRadius: '50%', background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={14} color="white" strokeWidth={3} /></div>}
                  </div>
                </button>
              )
            })}
          </div>

          <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: 16 }} onClick={next}>
            Continue <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════
          STEP 2 — BRANDING
      ════════════════════════════════ */}
      {step === 2 && (
        <div style={{ flex: 1, padding: '28px 20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--text-dark)', marginBottom: 6 }}>Make it yours</div>
          <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 28, lineHeight: 1.6 }}>Upload your logo and choose a colour theme. You can change this anytime.</div>

          {/* Logo upload */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 14 }}>Your Logo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: logo ? 'transparent' : 'var(--blush-mid)', border: `2px dashed ${logo ? 'var(--gold)' : 'var(--blush-deeper)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {logo
                  ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24 }}>📷</div><div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>Logo</div></div>
                }
              </div>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', background: 'var(--blush-mid)', border: '1.5px solid var(--blush-dark)', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 600, color: 'var(--text-mid)', cursor: 'pointer' }}>
                  📁 Upload Logo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
                </label>
                {logo && <button onClick={() => setLogo(null)} style={{ display: 'block', marginTop: 8, background: 'none', border: 'none', color: 'var(--danger)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Remove</button>}
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6 }}>PNG or JPG recommended</div>
              </div>
            </div>
          </div>

          {/* Colour theme */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 14 }}>Colour Theme</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {THEMES.map(t => {
                const sel = theme === t.id
                return (
                  <button key={t.id} onClick={() => handleTheme(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: 'var(--white)', border: `2px solid ${sel ? 'var(--gold)' : 'var(--blush-dark)'}`, borderRadius: 'var(--r-md)', cursor: 'pointer', boxShadow: sel ? 'var(--shadow-md)' : 'var(--shadow-xs)', transition: 'all 0.2s' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.preview, flexShrink: 0, border: '2px solid rgba(255,255,255,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                    <span style={{ fontWeight: 700, fontSize: 15, flex: 1, textAlign: 'left', color: sel ? 'var(--gold-dark)' : 'var(--text-dark)' }}>{t.name}</span>
                    {sel && <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} color="white" strokeWidth={3} /></div>}
                  </button>
                )
              })}
            </div>
          </div>

          <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: 16 }} onClick={next}>
            Looking great! Continue <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════
          STEP 3 — BUSINESS INFO
      ════════════════════════════════ */}
      {step === 3 && (
        <div style={{ flex: 1, padding: '28px 20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--text-dark)', marginBottom: 6 }}>Tell us about your business</div>
          <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 28, lineHeight: 1.6 }}>This information appears on your receipts and profile. All fields are optional.</div>

          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input className="form-input" placeholder="e.g. Glow Hair Studio" value={bizName} onChange={e => setBizName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" placeholder="e.g. 082 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Studio / Salon Address</label>
            <textarea className="form-input" rows={2} placeholder="Optional" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">📸 Instagram Handle</label>
            <input className="form-input" placeholder="@yoursalon" value={instagram} onChange={e => setInstagram(e.target.value)} />
          </div>

          <div style={{ marginBottom: 28 }} />

          <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: 16 }} onClick={next}>
            Continue <ChevronRight size={18} />
          </button>
          <button onClick={next} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: 14, cursor: 'pointer', padding: 10 }}>
            Skip for now
          </button>
        </div>
      )}

      {/* ════════════════════════════════
          STEP 4 — SERVICES
      ════════════════════════════════ */}
      {step === 4 && (
        <div style={{ flex: 1, padding: '28px 20px 100px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--text-dark)', marginBottom: 6 }}>Set up your services</div>
          <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.6 }}>Tap to select the services you offer. You can add, edit or remove them anytime.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {(QUICK_SERVICES[salonType] || QUICK_SERVICES.both).map(svc => {
              const sel = !!selectedServices.find(s => s.name === svc.name)
              return (
                <button key={svc.name} onClick={() => toggleService(svc)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: sel ? 'rgba(var(--gold-dark-rgb, 160,120,74),0.06)' : 'var(--white)', border: `2px solid ${sel ? 'var(--gold)' : 'var(--blush-dark)'}`, borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: sel ? 'var(--gold)' : 'var(--blush-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {sel ? <Check size={16} color="white" strokeWidth={3} /> : <span style={{ fontSize: 16 }}>💆</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: sel ? 'var(--gold-dark)' : 'var(--text-dark)' }}>{svc.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 1 }}>{svc.duration}min · {svc.category}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: sel ? 'var(--gold-dark)' : 'var(--text-mid)' }}>R{svc.price}</div>
                </button>
              )
            })}
          </div>

          {/* Custom service */}
          {!showCustom ? (
            <button onClick={() => setShowCustom(true)} style={{ width: '100%', padding: '13px', border: '2px dashed var(--blush-darker, var(--blush-dark))', borderRadius: 'var(--r-md)', background: 'transparent', color: 'var(--gold-dark)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Plus size={16} /> Add a custom service
            </button>
          ) : (
            <div className="card card-pad" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Custom Service</div>
              <div className="form-group"><label className="form-label">Service Name</label><input className="form-input" placeholder="e.g. Microblading" value={customService.name} onChange={e => setCustomService(p => ({ ...p, name: e.target.value }))} autoFocus /></div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Price (R)</label><input className="form-input" type="number" placeholder="0" value={customService.price} onChange={e => setCustomService(p => ({ ...p, price: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-input" type="number" placeholder="60" value={customService.duration} onChange={e => setCustomService(p => ({ ...p, duration: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={addCustomService}>Add Service</button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCustom(false)}>Cancel</button>
              </div>
            </div>
          )}

          {selectedServices.length > 0 && (
            <div style={{ marginTop: 16, background: 'var(--success-bg)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
              ✓ {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
            </div>
          )}

          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '16px 20px', background: 'var(--white)', borderTop: '1px solid var(--blush-dark)', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
            <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: 16 }} onClick={next}>
              {selectedServices.length > 0 ? `Save ${selectedServices.length} services & continue` : 'Skip for now'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          STEP 5 — SUBSCRIPTION
      ════════════════════════════════ */}
      {step === 5 && (
        <div style={{ flex: 1, padding: '28px 20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--text-dark)', marginBottom: 6 }}>Choose your plan</div>
          <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.6 }}>Start free, upgrade anytime. Have an access code? Enter it below to unlock Premium for free.</div>

          {/* Current plan if already set */}
          {subscription.plan !== 'free' && (
            <div style={{ background: 'linear-gradient(135deg, var(--gold-deeper), var(--gold))', borderRadius: 'var(--r-md)', padding: '14px 18px', color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Star size={20} color="white" fill="white" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{subscription.plan === 'premium' ? 'Premium' : 'Pro'} Plan Active!</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Code: {subscription.code} · {subscription.type}</div>
              </div>
            </div>
          )}

          {/* Access code */}
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🎁 Have an Access Code?</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>Enter your code to unlock Premium for free.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="Enter your access code" value={accessCode} onChange={e => setAccessCode(e.target.value.toUpperCase())} style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }} onKeyDown={e => e.key === 'Enter' && handleCodeRedeem()} />
              <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={handleCodeRedeem}>Apply</button>
            </div>
            {codeResult && (
              <div className={`alert-banner ${codeResult.success ? 'alert-success' : 'alert-danger'}`} style={{ margin: '10px 0 0' }}>
                {codeResult.message}
              </div>
            )}
          </div>

          {/* Plan summary */}
          {[
            { name: 'Free', price: 'R0/month', color: '#718096', features: ['50 clients', 'Calendar', 'Checkout'] },
            { name: 'Pro', price: 'R119/month', color: '#A0784A', features: ['Unlimited clients', 'Inventory', 'Reports', 'Staff'], popular: true },
            { name: 'Premium', price: 'R199/month', color: '#6B3F6B', features: ['Everything in Pro', 'Branding', 'Export', 'Priority support'] },
          ].map(p => (
            <div key={p.name} style={{ marginBottom: 10, background: 'var(--white)', border: `1.5px solid ${subscription.plan === p.name.toLowerCase() ? p.color : 'var(--blush-dark)'}`, borderRadius: 'var(--r-md)', padding: '14px 16px', position: 'relative' }}>
              {p.popular && <div style={{ position: 'absolute', top: -9, right: 14, background: p.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 'var(--r-full)', letterSpacing: '0.06em' }}>POPULAR</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: p.color }}>{p.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-dark)' }}>{p.price}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.features.map(f => (
                  <span key={f} style={{ fontSize: 11, background: `${p.color}12`, color: p.color, padding: '3px 10px', borderRadius: 'var(--r-full)', fontWeight: 600 }}>{f}</span>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', marginBottom: 24 }}>
            Payment processing coming soon. Use an access code for now.
          </div>

          <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: 16 }} onClick={next}>
            Continue <ChevronRight size={18} />
          </button>
          <button onClick={next} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: 14, cursor: 'pointer', padding: 10 }}>
            Start with Free Plan
          </button>
        </div>
      )}

      {/* ════════════════════════════════
          STEP 6 — DONE
      ════════════════════════════════ */}
      {step === 6 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center' }}>
          {/* Celebration */}
          <div style={{ fontSize: 64, marginBottom: 20, animation: 'none' }}>🎉</div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text-dark)', marginBottom: 8 }}>You're all set!</div>
          <div style={{ fontSize: 15, color: 'var(--text-light)', lineHeight: 1.7, maxWidth: 300, marginBottom: 40 }}>
            {bizName || 'Your salon'} is ready to go. Let's start managing your business like a pro.
          </div>

          {/* Summary of what was set up */}
          <div style={{ width: '100%', maxWidth: 340, background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--blush-dark)', padding: '20px', marginBottom: 32, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 14 }}>Your Setup Summary</div>
            {[
              ['🏠 Salon Type', SALON_TYPES.find(s => s.value === salonType)?.title || 'Hair & Beauty'],
              ['🎨 Theme', THEMES.find(t => t.id === theme)?.name || 'Champagne Gold'],
              ['⭐ Plan', `${subscription.plan === 'premium' ? 'Premium' : subscription.plan === 'pro' ? 'Pro' : 'Free'}${subscription.type === 'lifetime' ? ' (Lifetime)' : ''}`],
              ['✂️ Services', selectedServices.length > 0 ? `${selectedServices.length} services added` : 'Add later in settings'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--blush)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-light)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ width: '100%', maxWidth: 340 }}>
            <button className="btn btn-primary btn-full" style={{ fontSize: 17, padding: 18 }} onClick={handleFinish}>
              Go to my dashboard →
            </button>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[['👥', 'Add Clients', '/clients'], ['📅', 'Calendar', '/calendar'], ['⚙️', 'Settings', '/settings']].map(([icon, label, path]) => (
                <button key={path} onClick={() => navigate(path)} style={{ padding: '12px 8px', background: 'var(--white)', border: '1px solid var(--blush-dark)', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
