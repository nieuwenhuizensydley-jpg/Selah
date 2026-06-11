import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { applyTheme, THEMES as THEME_MAP } from '../context/ThemeContext'
import { Scissors, Package, BarChart2, StickyNote, LogOut, ChevronRight, Users, DollarSign, CreditCard, Clock, Star, Check, Upload, Shield } from 'lucide-react'

const THEMES = [
  { id: 'gold',   name: 'Champagne Gold',  preview: 'linear-gradient(135deg, #7A5A35, #C9A96E)' },
  { id: 'rose',   name: 'Rose Gold',       preview: 'linear-gradient(135deg, #8B3A52, #D4849A)' },
  { id: 'silver', name: 'Silver Platinum', preview: 'linear-gradient(135deg, #4A5568, #A0AEC0)' },
  { id: 'teal',   name: 'Teal',            preview: 'linear-gradient(135deg, #234E52, #4FB3B8)' },
  { id: 'forest', name: 'Forest Green',    preview: 'linear-gradient(135deg, #1A3A2A, #4A8C6A)' },
]

export default function SettingsPage() {
  const { user, business, setBusiness, logout, subscription } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('menu')
  const [selectedTheme, setSelectedTheme] = useState(localStorage.getItem('selah_theme') || 'gold')
  const [bizForm, setBizForm] = useState({
    name: business?.name || '',
    phone: business?.phone || '',
    address: business?.address || '',
    vatNo: business?.vatNo || '',
    salonType: business?.salonType || 'both',
  })

  function handleThemeSelect(themeId) {
    setSelectedTheme(themeId)
    applyTheme(themeId)
    setBusiness(b => ({ ...b, theme: themeId }))
  }

  function handleSaveBiz() {
    setBusiness(b => ({ ...b, ...bizForm }))
    setActiveTab('menu')
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setBusiness(b => ({ ...b, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const menuSections = [
    {
      title: 'Business',
      items: [
        { icon: Scissors,   label: 'Services & Add-ons',   sub: 'Manage your service menu',    path: '/services',   color: '#A0784A' },
        { icon: Package,    label: 'Inventory',             sub: 'Stock levels & products',     path: '/inventory',  color: '#7A5A35' },
        { icon: Users,      label: 'Staff Management',      sub: 'Team & commissions',          path: '/staff',      color: '#5C4433' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { icon: CreditCard, label: 'EFT Tracking',          sub: 'Outstanding payments',        path: '/eft',        color: '#D68910' },
        { icon: DollarSign, label: 'Expenses',              sub: 'Track business costs',        path: '/expenses',   color: '#A0784A' },
        { icon: BarChart2,  label: 'Reports & Analytics',   sub: 'Revenue & profit',            path: '/reports',    color: '#7A5A35' },
        { icon: Clock,      label: 'End of Day Cash-Up',    sub: 'Daily reconciliation',        path: '/cashup',     color: '#5C4433' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { icon: StickyNote, label: 'Notes & Reminders',     sub: 'To-dos & shopping lists',    path: '/notes',          color: '#A0784A' },
        { icon: Clock,      label: 'Working Hours',         sub: 'Schedule & blocked slots',   path: '/working-hours',  color: '#7A5A35' },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: Star,       label: 'Subscription & Plans',  sub: 'Manage plan & access codes', path: '/subscription',   color: '#6B3F6B' },
        { icon: Shield,     label: 'Admin Dashboard',       sub: 'Platform owner controls',    path: '/admin',          color: '#2471A3' },
      ]
    }
  ]

  return (
    <div>
      {/* Profile hero */}
      <div className="page-hero" style={{ paddingBottom: 24 }}>
        {business?.logo
          ? <img src={business.logo} alt="logo" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 14, border: '3px solid rgba(255,255,255,0.4)' }} />
          : <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 26, fontFamily: 'var(--font-display)', color: 'white' }}>
              {business?.name?.[0] || 'S'}
            </div>
        }
        <div className="hero-title">{business?.name || 'My Salon'}</div>
        <div className="hero-sub">{user?.email}</div>
      </div>

      {/* Sub tabs */}
      <div className="tabs">
        {[['menu', 'Menu'], ['branding', 'Branding'], ['business', 'Business Info']].map(([v, l]) => (
          <button key={v} className={`tab-btn ${activeTab === v ? 'active' : ''}`} onClick={() => setActiveTab(v)}>{l}</button>
        ))}
      </div>

      {/* ── MENU TAB ── */}
      {activeTab === 'menu' && (
        <>
          <div style={{ padding: '14px 20px 0' }}>
            <div onClick={() => navigate('/subscription')} style={{ background: subscription.plan === 'premium' ? 'linear-gradient(135deg, #6B3F6B, #9B5E9B)' : subscription.plan === 'pro' ? 'linear-gradient(135deg, #7A5A35, #C9A96E)' : 'var(--white)', border: subscription.plan === 'free' ? '1.5px solid var(--blush-dark)' : 'none', borderRadius: 'var(--r-md)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: 'var(--shadow-xs)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <Star size={14} color={subscription.plan !== 'free' ? 'rgba(255,255,255,0.9)' : 'var(--gold-dark)'} fill={subscription.plan !== 'free' ? 'rgba(255,255,255,0.9)' : 'none'} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: subscription.plan !== 'free' ? 'white' : 'var(--text-dark)' }}>
                    {subscription.plan === 'premium' ? 'Premium' : subscription.plan === 'pro' ? 'Pro' : 'Free'} Plan{subscription.type === 'lifetime' ? ' · Lifetime' : ''}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: subscription.plan !== 'free' ? 'rgba(255,255,255,0.75)' : 'var(--text-light)' }}>
                  {subscription.plan === 'free' ? 'Tap to upgrade or enter access code' : 'All features unlocked · tap to manage'}
                </div>
              </div>
              <ChevronRight size={18} color={subscription.plan !== 'free' ? 'rgba(255,255,255,0.7)' : 'var(--text-faint)'} />
            </div>
          </div>

          {menuSections.map(section => (
            <div key={section.title}>
              <div className="section-label">{section.title}</div>
              <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
                {section.items.map((item, i) => (
                  <button key={item.label} onClick={() => navigate(item.path)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', border: 'none', background: 'transparent', borderBottom: i < section.items.length - 1 ? '1px solid var(--blush)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={18} color={item.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 1 }}>{item.sub}</div>
                    </div>
                    <ChevronRight size={16} color="var(--text-faint)" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="section-label">Account</div>
          <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden' }}>
            <button onClick={() => navigate('/setup')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--blush)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'rgba(201,169,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={18} color="var(--gold-dark)" />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Redo Setup Wizard</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 1 }}>Re-run the setup at any time</div>
            </div>
          </button>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={18} color="var(--danger)" />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--danger)' }}>Sign Out</div>
              </div>
            </button>
          </div>

          <div style={{ padding: '28px 20px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.2em', color: 'var(--gold-dark)' }}>SELAH</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', marginTop: 4 }}>VERSION 3.0.0 · SALON BOOKING</div>
          </div>
        </>
      )}

      {/* ── BRANDING TAB ── */}
      {activeTab === 'branding' && (
        <div style={{ padding: '20px' }}>
          {/* Logo upload */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>Business Logo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {business?.logo
                ? <img src={business.logo} alt="logo" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--blush-dark)' }} />
                : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--blush-mid)', border: '2px dashed var(--blush-deeper)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Upload size={22} color="var(--text-faint)" />
                  </div>
              }
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--blush-mid)', border: '1.5px solid var(--blush-dark)', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, color: 'var(--text-mid)', cursor: 'pointer' }}>
                  <Upload size={15} /> Upload Logo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                </label>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>PNG, JPG or SVG recommended</div>
                {business?.logo && (
                  <button onClick={() => setBusiness(b => ({ ...b, logo: null }))} style={{ fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, padding: 0 }}>Remove logo</button>
                )}
              </div>
            </div>
          </div>

          {/* Colour themes */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>Colour Theme</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {THEMES.map(theme => {
                const isSelected = selectedTheme === theme.id
                return (
                  <button key={theme.id} onClick={() => handleThemeSelect(theme.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: isSelected ? 'var(--white)' : 'var(--white)', border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--blush-dark)'}`, borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left', boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-xs)', transition: 'all 0.2s' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: theme.preview, flexShrink: 0, border: '2px solid rgba(255,255,255,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-dark)' }}>{theme.name}</div>
                    </div>
                    {isSelected && (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={14} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>Theme applies instantly across the whole app</div>
          </div>

          {/* Salon type */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>Salon Type</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['hair', '✂️ Hair'], ['beauty', '💅 Beauty'], ['both', '✨ Both']].map(([v, l]) => (
                <button key={v} onClick={() => { setBizForm(f => ({ ...f, salonType: v })); setBusiness(b => ({ ...b, salonType: v })) }} className={`pay-btn ${bizForm.salonType === v ? 'sel' : ''}`} style={{ flex: 1, padding: '12px 6px', fontSize: 13 }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BUSINESS INFO TAB ── */}
      {activeTab === 'business' && (
        <div style={{ padding: 20 }}>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input className="form-input" value={bizForm.name} onChange={e => setBizForm(f => ({ ...f, name: e.target.value }))} placeholder="Your salon name" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" value={bizForm.phone} onChange={e => setBizForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 082 000 0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Business Address</label>
            <textarea className="form-input" rows={2} value={bizForm.address} onChange={e => setBizForm(f => ({ ...f, address: e.target.value }))} placeholder="Studio or salon address" />
          </div>
          <div className="form-group">
            <label className="form-label">VAT Number</label>
            <input className="form-input" value={bizForm.vatNo} onChange={e => setBizForm(f => ({ ...f, vatNo: e.target.value }))} placeholder="Optional" />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', margin: '20px 0 12px' }}>Social Media</div>
          {[['instagram', '📸 Instagram', '@yoursalon'], ['facebook', '👍 Facebook', 'facebook.com/yoursalon'], ['tiktok', '🎵 TikTok', '@yoursalon']].map(([key, label, ph]) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" placeholder={ph} value={bizForm[key] || ''} onChange={e => setBizForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}

          <button className="btn btn-primary btn-full mt-16" onClick={handleSaveBiz}>Save Business Info</button>
        </div>
      )}

      <div className="spacer-24" />
    </div>
  )
}
