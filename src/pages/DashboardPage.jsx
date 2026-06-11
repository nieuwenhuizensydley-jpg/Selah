import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AlertCircle, TrendingUp, Calendar, Users, ShoppingBag, Package, StickyNote, CreditCard, DollarSign, Clock, X, AlertTriangle, Star, Zap, Info } from 'lucide-react'

function AlertModal({ apt, client, onClose, onGoToProfile }) {
  const alertStyle = (type) => {
    if (type === 'danger')  return { bg: '#FEE2E2', color: '#C0392B', border: '#C0392B', icon: <AlertTriangle size={18} /> }
    if (type === 'vip')     return { bg: '#FEF9EC', color: '#A0784A', border: '#C9A96E', icon: <Star size={18} /> }
    if (type === 'warning') return { bg: '#FEF3C7', color: '#D68910', border: '#D68910', icon: <Zap size={18} /> }
    return { bg: '#EFF6FF', color: '#2471A3', border: '#2471A3', icon: <Info size={18} /> }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,12,8,0.65)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'white', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #A0784A, #C9A96E)', padding: '20px 20px 16px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Upcoming Appointment</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'white' }}>{apt.clientName}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{apt.service} · {apt.time} · {apt.duration}min</div>
        </div>

        {/* Alerts */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9C826E', marginBottom: 10 }}>
            ⚠️ Client Alerts
          </div>
          {client?.alerts?.map((alert, i) => {
            const s = alertStyle(alert.type)
            return (
              <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: s.color, flexShrink: 0 }}>{s.icon}</span>
                <span style={{ color: s.color, fontWeight: 700, fontSize: 14 }}>{alert.text}</span>
              </div>
            )
          })}
          {client?.balance > 0 && (
            <div style={{ background: '#FEE2E2', border: '1.5px solid #C0392B', borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} color="#C0392B" />
              <span style={{ color: '#C0392B', fontWeight: 700, fontSize: 14 }}>Outstanding Balance: R{client.balance}</span>
            </div>
          )}
          {(!client?.alerts?.length && !client?.balance) && (
            <div style={{ color: '#9C826E', fontSize: 14, textAlign: 'center', padding: '8px 0' }}>No alerts for this client</div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E3D5C5', background: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#5C4433' }}>
            Close
          </button>
          <button onClick={onGoToProfile} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7A5A35, #C9A96E)', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'white' }}>
            View Full Profile →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { business, user, appointments, clients, todayRevenue, monthRevenue, outstandingEFT, notes, lowStock, netProfit, TODAY } = useApp()
  const navigate = useNavigate()
  const [alertApt, setAlertApt] = useState(null)

  const todayApts = appointments.filter(a => a.date === TODAY && a.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time))
  const pinnedNotes = notes.filter(n => n.pinned && !n.done)
  const upcomingApts = appointments.filter(a => a.date > TODAY && a.status !== 'cancelled').length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  function handleAptTap(apt) {
    const client = clients.find(c => c.id === apt.clientId)
    // Always show the alert modal first — even if no alerts, shows appointment info
    setAlertApt({ apt, client })
  }

  const alertClient = alertApt?.client
  const hasAlerts = alertClient?.alerts?.length > 0 || alertClient?.balance > 0

  return (
    <div>
      {/* Alert modal */}
      {alertApt && (
        <AlertModal
          apt={alertApt.apt}
          client={alertApt.client}
          onClose={() => setAlertApt(null)}
          onGoToProfile={() => {
            setAlertApt(null)
            if (alertApt.client) navigate(`/clients/${alertApt.client.id}`)
          }}
        />
      )}

      {/* Hero */}
      <div className="page-hero" style={{ paddingBottom: 28 }}>
        <div className="hero-eyebrow">{greeting}</div>
        <div className="hero-title">{business?.name || 'My Salon'}</div>
        <div className="hero-sub">{new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--r-md)', padding: '12px 14px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Today</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'white', marginTop: 4 }}>R{todayRevenue.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--r-md)', padding: '12px 14px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>This Month</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'white', marginTop: 4 }}>R{monthRevenue.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, background: outstandingEFT > 0 ? 'rgba(214,137,16,0.3)' : 'rgba(255,255,255,0.15)', borderRadius: 'var(--r-md)', padding: '12px 14px', backdropFilter: 'blur(8px)', border: outstandingEFT > 0 ? '1px solid rgba(214,137,16,0.5)' : 'none' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>EFT Due</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: outstandingEFT > 0 ? '#FFD580' : 'white', marginTop: 4 }}>R{outstandingEFT.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* System alerts */}
      <div style={{ paddingTop: 12 }}>
        {outstandingEFT > 0 && (
          <div className="alert-banner alert-warning" onClick={() => navigate('/eft')} style={{ cursor: 'pointer' }}>
            <AlertCircle size={16} />
            <span>R{outstandingEFT.toLocaleString()} outstanding EFT — tap to follow up</span>
          </div>
        )}
        {lowStock.length > 0 && (
          <div className="alert-banner alert-danger" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
            <AlertCircle size={16} />
            <span>{lowStock.length} item{lowStock.length > 1 ? 's' : ''} low in stock — tap to view</span>
          </div>
        )}
      </div>

      {/* Today's appointments — tap opens alert modal then profile */}
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 }}>
        <span>Today's Appointments</span>
        <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>{todayApts.length} booked</span>
      </div>

      {todayApts.length === 0 ? (
        <div style={{ padding: '16px 20px', color: 'var(--text-light)', fontSize: 14, textAlign: 'center' }}>
          No appointments today — <span style={{ color: 'var(--gold-dark)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/calendar')}>book one?</span>
        </div>
      ) : (
        todayApts.map(apt => {
          const client = clients.find(c => c.id === apt.clientId)
          const hasClientAlerts = client?.alerts?.length > 0 || client?.balance > 0
          return (
            <div key={apt.id} className="apt-slot" onClick={() => handleAptTap(apt)} style={{ position: 'relative' }}>
              {hasClientAlerts && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: '50%', background: '#C0392B', boxShadow: '0 0 0 2px white' }} />
              )}
              <div className="apt-time">{apt.time}</div>
              <div style={{ flex: 1 }}>
                <div className="apt-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {apt.clientName}
                  {hasClientAlerts && <span style={{ fontSize: 10, background: '#FEE2E2', color: '#C0392B', fontWeight: 700, padding: '1px 6px', borderRadius: 20 }}>ALERT</span>}
                </div>
                <div className="apt-svc">{apt.service}{apt.addons?.length > 0 ? ` + ${apt.addons.join(', ')}` : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>R{apt.price}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{apt.duration}min</div>
              </div>
            </div>
          )
        })
      )}

      {/* Quick actions */}
      <div className="section-label">Quick Actions</div>
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { icon: Calendar,   label: 'Book',     path: '/calendar',  color: '#A0784A' },
          { icon: Users,      label: 'Clients',  path: '/clients',   color: '#7A5A35' },
          { icon: ShoppingBag,label: 'Checkout', path: '/pos',       color: '#5C4433' },
          { icon: CreditCard, label: 'EFT',      path: '/eft',       color: '#A0784A' },
          { icon: Package,    label: 'Inventory',path: '/inventory', color: '#7A5A35' },
          { icon: DollarSign, label: 'Expenses', path: '/expenses',  color: '#5C4433' },
          { icon: TrendingUp, label: 'Reports',  path: '/reports',   color: '#A0784A' },
          { icon: StickyNote, label: 'Notes',    path: '/notes',     color: '#7A5A35' },
          { icon: Clock,      label: 'Cash-Up',  path: '/cashup',    color: '#5C4433' },
        ].map(({ icon: Icon, label, path, color }) => (
          <button key={label} onClick={() => navigate(path)} style={{ background: 'var(--white)', border: '1px solid var(--blush-dark)', borderRadius: 'var(--r-md)', padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
              <Icon size={18} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', letterSpacing: '0.03em' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="section-label">Business Overview</div>
      <div className="stat-grid" style={{ paddingBottom: 0 }}>
        <div className="stat-card">
          <div className="stat-val" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>R{netProfit.toLocaleString()}</div>
          <div className="stat-lbl">Net Profit</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{clients.length}</div>
          <div className="stat-lbl">Total Clients</div>
        </div>
      </div>
      <div className="stat-grid" style={{ paddingTop: 10 }}>
        <div className="stat-card">
          <div className="stat-val">{appointments.filter(a => a.status !== 'cancelled').length}</div>
          <div className="stat-lbl">Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{upcomingApts}</div>
          <div className="stat-lbl">Upcoming</div>
        </div>
      </div>

      {/* Pinned notes */}
      {pinnedNotes.length > 0 && (
        <>
          <div className="section-label">📌 Pinned Reminders</div>
          {pinnedNotes.map(note => (
            <div key={note.id} onClick={() => navigate('/notes')} style={{ margin: '0 20px 8px', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 'var(--r-sm)', padding: '12px 14px', fontSize: 14, color: 'var(--text-mid)', cursor: 'pointer' }}>
              {note.text}
              {note.dueDate && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--warning)', fontWeight: 600 }}>Due {note.dueDate}</span>}
            </div>
          ))}
        </>
      )}

      <div className="spacer-24" />
    </div>
  )
}
