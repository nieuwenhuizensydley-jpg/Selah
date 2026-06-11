import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, X, AlertTriangle, Star, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'

const ALL_FLAGS = ['VIP', 'Owes Money', 'Allergy Alert', 'Frequent Visitor', 'Referral Client', 'Preferred Client']
const ALERT_TYPES = [
  { value: 'vip', label: '⭐ VIP' },
  { value: 'danger', label: '🚨 Danger / Balance' },
  { value: 'warning', label: '⚠️ Allergy / Safety' },
  { value: 'info', label: 'ℹ️ Preference' },
]
const BEAUTY_CATS = ['Nails', 'Lashes', 'Brows', 'Waxing', 'Facials', 'Makeup', 'Aesthetics', 'Other']

function alertStyle(type) {
  if (type === 'danger') return { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'rgba(192,57,43,0.2)' }
  if (type === 'vip')    return { bg: 'rgba(201,169,110,0.12)', color: 'var(--gold-dark)', border: 'rgba(201,169,110,0.3)' }
  if (type === 'warning') return { bg: 'var(--warning-bg)', color: 'var(--warning)', border: 'rgba(214,137,16,0.25)' }
  return { bg: 'var(--info-bg)', color: 'var(--info)', border: 'rgba(36,113,163,0.2)' }
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    clients, appointments, business,
    addClientNote, editClientNote, deleteClientNote,
    addHairRecord, addBeautyRecord,
    addClientAlert, removeClientAlert,
    addClientFlag, removeClientFlag,
    markBalancePaid, updateClient, showToast, TODAY,
  } = useApp()

  const client = clients.find(c => c.id === Number(id))
  const salonType = business?.salonType || 'both'

  // Build tabs based on salon type
  const baseTabs = ['profile', 'notes', 'alerts', 'photos', 'history']
  const hairTab  = salonType === 'hair' || salonType === 'both' ? ['hair records'] : []
  const beautyTab = salonType === 'beauty' || salonType === 'both' ? ['beauty records'] : []
  const TABS = [...baseTabs, ...hairTab, ...beautyTab]

  const [tab, setTab] = useState('profile')
  const [newNote, setNewNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [showAlertSheet, setShowAlertSheet] = useState(false)
  const [showHairSheet, setShowHairSheet] = useState(false)
  const [showBeautySheet, setShowBeautySheet] = useState(false)
  const [photoCaption, setPhotoCaption] = useState('')
  const [alertForm, setAlertForm] = useState({ type: 'info', text: '' })
  const [hairForm, setHairForm] = useState({ date: TODAY, service: '', formula: '', developer: '', products: '', quantity: '', notes: '', charge: '' })
  const [beautyForm, setBeautyForm] = useState({ date: TODAY, category: 'Nails', service: '', productsUsed: '', skinReaction: '', treatmentNotes: '', nextTreatment: '', charge: '' })

  if (!client) return (
    <div style={{ padding: 24 }}>
      <p style={{ marginBottom: 16 }}>Client not found.</p>
      <button className="btn btn-secondary" onClick={() => navigate('/clients')}>← Back to Clients</button>
    </div>
  )

  // ── Automatic appointment history — sorted newest first ──
  const clientApts = appointments
    .filter(a => a.clientId === client.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))

  const totalSpent = clientApts.filter(a => a.status !== 'cancelled').reduce((s, a) => s + a.price, 0)
  const initials = `${client.name[0]}${client.surname?.[0] || ''}`.toUpperCase()

  function handleAddNote() {
    if (!newNote.trim()) return
    addClientNote(client.id, newNote.trim())
    setNewNote(''); setShowNoteInput(false)
    showToast('Note saved ✓')
  }

  function handleAddAlert() {
    if (!alertForm.text.trim()) { showToast('Enter alert text'); return }
    addClientAlert(client.id, alertForm)
    setAlertForm({ type: 'info', text: '' }); setShowAlertSheet(false)
    showToast('Alert added ✓')
  }

  function handleAddHairRecord() {
    if (!hairForm.service) { showToast('Service name required'); return }
    addHairRecord(client.id, { ...hairForm, charge: Number(hairForm.charge) || 0 })
    setHairForm({ date: TODAY, service: '', formula: '', developer: '', products: '', quantity: '', notes: '', charge: '' })
    setShowHairSheet(false)
    showToast('Hair record saved ✓')
  }

  function handleAddBeautyRecord() {
    if (!beautyForm.service) { showToast('Service name required'); return }
    addBeautyRecord(client.id, { ...beautyForm, charge: Number(beautyForm.charge) || 0 })
    setBeautyForm({ date: TODAY, category: 'Nails', service: '', productsUsed: '', skinReaction: '', treatmentNotes: '', nextTreatment: '', charge: '' })
    setShowBeautySheet(false)
    showToast('Beauty record saved ✓')
  }

  function handlePhotoUpload(e, type) {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const photo = { id: Date.now() + Math.random(), url: ev.target.result, type, date: TODAY, caption: photoCaption }
        updateClient(client.id, { photos: [...(client.photos || []), photo] })
      }
      reader.readAsDataURL(file)
    })
    setPhotoCaption('')
  }
  function setB(f, v) { setBeautyForm(p => ({ ...p, [f]: v })) }

  return (
    <div>
      {/* ── Hero ── */}
      <div className="page-hero" style={{ paddingBottom: 20 }}>
        <button onClick={() => navigate('/clients')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 'var(--r-full)', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Clients
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar avatar-lg">{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'white', lineHeight: 1.1 }}>
              {client.name} {client.surname}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>
              {client.mobile || client.email || 'No contact info'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
              Client since {client.joinDate}
            </div>
          </div>
        </div>

        {/* Alert chips */}
        {client.alerts?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 14 }}>
            {client.alerts.map(alert => (
              <div key={alert.id} style={{ background: 'rgba(255,255,255,0.18)', color: 'white', padding: '4px 12px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600 }}>
                {alert.text}
              </div>
            ))}
          </div>
        )}

        {/* Outstanding balance */}
        {client.balance > 0 && (
          <div style={{ marginTop: 12, background: 'rgba(192,57,43,0.3)', borderRadius: 'var(--r-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>⚠ Outstanding: R{client.balance}</span>
            <button onClick={() => markBalancePaid(client.id)} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', borderRadius: 'var(--r-full)', padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Mark Paid
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div className="tabs" style={{ minWidth: 'max-content' }}>
          {TABS.map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}
              style={{ fontSize: 12, textTransform: 'capitalize', whiteSpace: 'nowrap', padding: '14px 14px' }}>
              {t === 'hair records' ? '✂️ Hair' : t === 'beauty records' ? '💅 Beauty' : t === 'history' ? '📋 History' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          PROFILE TAB
      ══════════════════════════════════════ */}
      {tab === 'profile' && (
        <div style={{ padding: 20 }}>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            {[['Mobile', client.mobile], ['Email', client.email], ['Date of Birth', client.dob], ['Address', client.address]].map(([label, val]) => val ? (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--blush)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{val}</span>
              </div>
            ) : null)}
            {client.referredBy && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 500 }}>Referred By</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold-dark)' }}>{client.referredBy}</span>
              </div>
            )}
          </div>

          {/* Flags */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Client Flags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_FLAGS.map(flag => {
                const active = client.flags?.includes(flag)
                return (
                  <button key={flag} onClick={() => active ? removeClientFlag(client.id, flag) : addClientFlag(client.id, flag)} className={`chip ${active ? 'chip-sel' : 'chip-idle'}`}>
                    {flag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="card card-pad">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>Client Stats</div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div style={{ background: 'var(--blush)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>{clientApts.filter(a => a.status !== 'cancelled').length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Visits</div>
              </div>
              <div style={{ background: 'var(--blush)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>R{totalSpent.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Spent</div>
              </div>
              <div style={{ background: 'var(--blush)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>{(client.hairRecords?.length || 0) + (client.beautyRecords?.length || 0)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Records</div>
              </div>
              <div style={{ background: 'var(--blush)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>{client.notes?.length || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          NOTES TAB
      ══════════════════════════════════════ */}
      {tab === 'notes' && (
        <div style={{ padding: 20 }}>
          <button className="btn btn-secondary btn-full mb-12" onClick={() => setShowNoteInput(v => !v)}>
            <Plus size={15} /> Add Note / Observation
          </button>

          {showNoteInput && (
            <div className="card card-pad mb-12">
              <textarea className="form-input" rows={3} placeholder="e.g. Prefers short nails, sensitive skin, drinks oat milk..." value={newNote} onChange={e => setNewNote(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddNote}>Save</button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowNoteInput(false); setNewNote('') }}>Cancel</button>
              </div>
            </div>
          )}

          {(!client.notes || client.notes.length === 0) && !showNoteInput && (
            <div className="empty" style={{ paddingTop: 32 }}>
              <div className="empty-title">No notes yet</div>
              <div className="empty-text">Add preferences, observations and anything useful for future visits</div>
            </div>
          )}

          {client.notes?.slice().reverse().map(note => (
            <div key={note.id} className="card card-pad mb-12" style={{ position: 'relative' }}>
              {editingNote === note.id ? (
                <>
                  <textarea className="form-input" rows={3} value={editNoteText} onChange={e => setEditNoteText(e.target.value)} autoFocus />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { editClientNote(client.id, note.id, editNoteText); setEditingNote(null); showToast('Note updated ✓') }}>Save</button>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setEditingNote(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.6, paddingRight: 52 }}>{note.text}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 8, display: 'flex', gap: 10 }}>
                    <span>{note.date}</span><span>·</span><span>{note.staff}</span>
                    {note.edited && <span style={{ color: 'var(--text-faint)' }}>· edited</span>}
                  </div>
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                    <button onClick={() => { setEditingNote(note.id); setEditNoteText(note.text) }} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => deleteClientNote(client.id, note.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════
          ALERTS TAB
      ══════════════════════════════════════ */}
      {tab === 'alerts' && (
        <div style={{ padding: 20 }}>
          <button className="btn btn-secondary btn-full mb-12" onClick={() => setShowAlertSheet(true)}>
            <Plus size={15} /> Add Alert
          </button>

          {(!client.alerts || client.alerts.length === 0) && (
            <div className="empty" style={{ paddingTop: 32 }}>
              <div className="empty-title">No alerts</div>
              <div className="empty-text">Alerts appear prominently when viewing this client or booking</div>
            </div>
          )}

          {client.alerts?.map(alert => {
            const s = alertStyle(alert.type)
            return (
              <div key={alert.id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 'var(--r-sm)', padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: s.color, fontWeight: 600, fontSize: 14 }}>{alert.text}</span>
                <button onClick={() => removeClientAlert(client.id, alert.id)} style={{ background: 'transparent', border: 'none', color: s.color, cursor: 'pointer', opacity: 0.7 }}><X size={16} /></button>
              </div>
            )
          })}

          {showAlertSheet && (
            <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAlertSheet(false)}>
              <div className="sheet">
                <div className="sheet-handle" />
                <div className="sheet-header">
                  <div className="sheet-title">New Alert</div>
                  <button className="btn-icon btn" onClick={() => setShowAlertSheet(false)}><X size={18} /></button>
                </div>
                <div className="form-group">
                  <label className="form-label">Alert Type</label>
                  <select className="form-input" value={alertForm.type} onChange={e => setAlertForm(p => ({ ...p, type: e.target.value }))}>
                    {ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Alert Message</label>
                  <input className="form-input" placeholder="e.g. Allergy: Acetone" value={alertForm.text} onChange={e => setAlertForm(p => ({ ...p, text: e.target.value }))} autoFocus />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleAddAlert}>Add Alert</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          APPOINTMENT HISTORY TAB (automatic)
      ══════════════════════════════════════ */}
      {tab === 'history' && (
        <div>
          {clientApts.length === 0 ? (
            <div className="empty">
              <div className="empty-title">No appointment history</div>
              <div className="empty-text">All past and upcoming appointments will appear here automatically</div>
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <div style={{ margin: '16px 20px 12px', background: 'linear-gradient(135deg, var(--gold-deeper), var(--gold-dark))', borderRadius: 'var(--r-md)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Visits</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'white' }}>{clientApts.filter(a => a.status !== 'cancelled').length}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Spent</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'white' }}>R{totalSpent.toLocaleString()}</div>
                </div>
              </div>

              {/* Appointment list */}
              <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
                {clientApts.map((apt, i) => {
                  const isPast = apt.date < TODAY
                  const isToday = apt.date === TODAY
                  const isFuture = apt.date > TODAY
                  const isCancelled = apt.status === 'cancelled'
                  return (
                    <div key={apt.id} style={{ padding: '14px 16px', borderBottom: i < clientApts.length - 1 ? '1px solid var(--blush)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 12, opacity: isCancelled ? 0.5 : 1 }}>
                      {/* Timeline dot */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: isCancelled ? 'var(--text-faint)' : isToday ? 'var(--gold)' : isFuture ? 'var(--info)' : 'var(--success)', border: '2px solid var(--white)', boxShadow: '0 0 0 1px currentColor' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, textDecoration: isCancelled ? 'line-through' : 'none' }}>{apt.service}</div>
                            {apt.addons?.length > 0 && (
                              <div style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 500, marginTop: 2 }}>+ {apt.addons.join(', ')}</div>
                            )}
                            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 3 }}>
                              {apt.date} at {apt.time} · {apt.duration}min · {apt.staff}
                            </div>
                            {apt.notes && <div style={{ fontSize: 12, color: 'var(--text-light)', fontStyle: 'italic', marginTop: 2 }}>{apt.notes}</div>}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>R{apt.price}</div>
                            <span className={`badge ${isCancelled ? 'badge-red' : isToday ? 'badge-gold' : isFuture ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
                              {isCancelled ? 'Cancelled' : isToday ? 'Today' : isFuture ? 'Upcoming' : 'Completed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
          <div className="spacer-16" />
        </div>
      )}

      {/* ══════════════════════════════════════
          PHOTOS TAB
      ══════════════════════════════════════ */}
      {tab === 'photos' && (
        <div style={{ padding: 20 }}>
          {/* Upload buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[['Before', '📷'], ['After', '✨'], ['Service', '💅'], ['Progress', '📈']].map(([type, icon]) => (
              <label key={type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', background: 'var(--white)', border: '1.5px dashed var(--blush-deeper)', borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{type} Photo</span>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handlePhotoUpload(e, type.toLowerCase())} />
              </label>
            ))}
          </div>

          {/* Photo grid */}
          {(!client.photos || client.photos.length === 0) ? (
            <div className="empty" style={{ paddingTop: 20 }}>
              <div className="empty-title">No photos yet</div>
              <div className="empty-text">Upload before & after, service and progress photos — they stay permanently linked to this client</div>
            </div>
          ) : (
            <>
              {['before', 'after', 'service', 'progress'].map(type => {
                const typePhotos = client.photos.filter(p => p.type === type)
                if (!typePhotos.length) return null
                return (
                  <div key={type} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>
                      {type === 'before' ? '📷 Before' : type === 'after' ? '✨ After' : type === 'service' ? '💅 Service' : '📈 Progress'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {typePhotos.map(photo => (
                        <div key={photo.id} style={{ position: 'relative' }}>
                          <img src={photo.url} alt={type} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--r-sm)', border: '1px solid var(--blush-dark)' }} />
                          <button
                            onClick={() => updateClient(client.id, { photos: client.photos.filter(p => p.id !== photo.id) })}
                            style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                            ×
                          </button>
                          <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 3, textAlign: 'center' }}>{photo.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          HAIR RECORDS TAB
      ══════════════════════════════════════ */}
      {tab === 'hair records' && (
        <div>
          <div style={{ padding: '16px 20px 8px' }}>
            <button className="btn btn-secondary btn-full" onClick={() => setShowHairSheet(true)}>
              <Plus size={15} /> New Hair Record Card
            </button>
          </div>

          {(!client.hairRecords || client.hairRecords.length === 0) && (
            <div className="empty">
              <div className="empty-title">No hair records</div>
              <div className="empty-text">Save colour formulas, developer, products and more — permanently linked to this client</div>
            </div>
          )}

          {client.hairRecords?.slice().reverse().map(rec => (
            <div key={rec.id} className="record-card">
              <div className="record-header">
                <div>
                  <div className="record-date">{rec.date}</div>
                  <div className="record-service">{rec.service}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white' }}>R{rec.charge}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{rec.staff}</div>
                </div>
              </div>
              <div className="record-body">
                {rec.formula    && <div><div className="record-field-label">Formula</div><div className="record-field-val">{rec.formula}</div></div>}
                {rec.developer  && <div><div className="record-field-label">Developer</div><div className="record-field-val">{rec.developer}</div></div>}
                {rec.products   && <div><div className="record-field-label">Products</div><div className="record-field-val">{rec.products}</div></div>}
                {rec.quantity   && <div><div className="record-field-label">Quantity</div><div className="record-field-val">{rec.quantity}</div></div>}
              </div>
              {rec.notes && <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic' }}>"{rec.notes}"</div>}
            </div>
          ))}

          {showHairSheet && (
            <div className="overlay" onClick={e => e.target === e.currentTarget && setShowHairSheet(false)}>
              <div className="sheet">
                <div className="sheet-handle" />
                <div className="sheet-header">
                  <div className="sheet-title">Hair Record Card</div>
                  <button className="btn-icon btn" onClick={() => setShowHairSheet(false)}><X size={18} /></button>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={hairForm.date} onChange={e => setH('date', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Service *</label><input className="form-input" placeholder="e.g. Root Retouch" value={hairForm.service} onChange={e => setH('service', e.target.value)} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Colour Formula</label><input className="form-input" placeholder="e.g. 6/0 + 4/0" value={hairForm.formula} onChange={e => setH('formula', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Developer</label><input className="form-input" placeholder="e.g. 20 Vol" value={hairForm.developer} onChange={e => setH('developer', e.target.value)} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Products Used</label><input className="form-input" placeholder="e.g. Wella Koleston" value={hairForm.products} onChange={e => setH('products', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Quantity</label><input className="form-input" placeholder="e.g. 60ml" value={hairForm.quantity} onChange={e => setH('quantity', e.target.value)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Notes / Observations</label><textarea className="form-input" rows={2} placeholder="Results, client reaction..." value={hairForm.notes} onChange={e => setH('notes', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Amount Charged (R)</label><input className="form-input" type="number" placeholder="0.00" value={hairForm.charge} onChange={e => setH('charge', e.target.value)} /></div>
                <button className="btn btn-primary btn-full" onClick={handleAddHairRecord}>Save Hair Record</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          BEAUTY RECORDS TAB
      ══════════════════════════════════════ */}
      {tab === 'beauty records' && (
        <div>
          <div style={{ padding: '16px 20px 8px' }}>
            <button className="btn btn-secondary btn-full" onClick={() => setShowBeautySheet(true)}>
              <Plus size={15} /> New Beauty Record Card
            </button>
          </div>

          {(!client.beautyRecords || client.beautyRecords.length === 0) && (
            <div className="empty">
              <div className="empty-title">No beauty records</div>
              <div className="empty-text">Track nails, lashes, brows, waxing, facials — products used, skin reactions, and follow-up notes</div>
            </div>
          )}

          {client.beautyRecords?.slice().reverse().map(rec => (
            <div key={rec.id} style={{ margin: '0 20px 12px', background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
              {/* Card header — purple/rose tone for beauty */}
              <div style={{ background: 'linear-gradient(135deg, #6B3F6B, #9B5E9B)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{rec.date} · {rec.category}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'white' }}>{rec.service}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white' }}>R{rec.charge}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{rec.staff}</div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {rec.productsUsed && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="record-field-label">Products Used</div>
                    <div className="record-field-val">{rec.productsUsed}</div>
                  </div>
                )}
                {rec.skinReaction && (
                  <div>
                    <div className="record-field-label">Skin Reaction</div>
                    <div className="record-field-val" style={{ color: rec.skinReaction.toLowerCase() === 'none' ? 'var(--success)' : 'var(--warning)' }}>{rec.skinReaction}</div>
                  </div>
                )}
                {rec.nextTreatment && (
                  <div>
                    <div className="record-field-label">Next Treatment</div>
                    <div className="record-field-val" style={{ color: 'var(--gold-dark)' }}>{rec.nextTreatment}</div>
                  </div>
                )}
              </div>
              {rec.treatmentNotes && (
                <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic', borderTop: '1px solid var(--blush)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, marginTop: 10 }}>Treatment Notes</div>
                  "{rec.treatmentNotes}"
                </div>
              )}
            </div>
          ))}

          {showBeautySheet && (
            <div className="overlay" onClick={e => e.target === e.currentTarget && setShowBeautySheet(false)}>
              <div className="sheet">
                <div className="sheet-handle" />
                <div className="sheet-header">
                  <div className="sheet-title">Beauty Record Card</div>
                  <button className="btn-icon btn" onClick={() => setShowBeautySheet(false)}><X size={18} /></button>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={beautyForm.date} onChange={e => setB('date', e.target.value)} /></div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={beautyForm.category} onChange={e => setB('category', e.target.value)}>
                      {BEAUTY_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Service Performed *</label><input className="form-input" placeholder="e.g. Full Set Gel Nails" value={beautyForm.service} onChange={e => setB('service', e.target.value)} autoFocus /></div>
                <div className="form-group"><label className="form-label">Products Used</label><input className="form-input" placeholder="e.g. OPI Base Coat, Gel Top Coat" value={beautyForm.productsUsed} onChange={e => setB('productsUsed', e.target.value)} /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Skin Reaction</label><input className="form-input" placeholder="e.g. None / Slight redness" value={beautyForm.skinReaction} onChange={e => setB('skinReaction', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Next Treatment</label><input className="form-input" placeholder="e.g. 3 weeks / 6–8 weeks" value={beautyForm.nextTreatment} onChange={e => setB('nextTreatment', e.target.value)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Treatment Notes</label><textarea className="form-input" rows={3} placeholder="Observations, client preferences, what worked well..." value={beautyForm.treatmentNotes} onChange={e => setB('treatmentNotes', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Amount Charged (R)</label><input className="form-input" type="number" placeholder="0.00" value={beautyForm.charge} onChange={e => setB('charge', e.target.value)} /></div>
                <button className="btn btn-primary btn-full" onClick={handleAddBeautyRecord}>Save Beauty Record</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="spacer-24" />
    </div>
  )
}
