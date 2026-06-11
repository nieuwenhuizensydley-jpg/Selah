import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

export default function WorkingHoursPage() {
  const { workingHours, setWorkingHours, lunchBreak, setLunchBreak, blockedSlots, addBlockedSlot, removeBlockedSlot, showToast, TODAY } = useApp()
  const navigate = useNavigate()
  const [showBlock, setShowBlock] = useState(false)
  const [blockForm, setBlockForm] = useState({ date: TODAY, start: '12:00', end: '13:00', reason: '' })

  function toggleDay(key) {
    setWorkingHours(h => ({ ...h, [key]: { ...h[key], open: !h[key].open } }))
  }
  function updateHour(key, field, val) {
    setWorkingHours(h => ({ ...h, [key]: { ...h[key], [field]: val } }))
  }
  function handleAddBlock() {
    if (!blockForm.date) { showToast('Select a date'); return }
    addBlockedSlot(blockForm)
    setBlockForm({ date: TODAY, start: '12:00', end: '13:00', reason: '' })
    setShowBlock(false)
    showToast('Time blocked ✓')
  }

  return (
    <div>
      <div className="page-header-simple">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/settings')} className="btn-icon btn"><ArrowLeft size={18} /></button>
          <div>
            <div className="page-title">Working Hours</div>
            <div className="page-subtitle">Set your schedule</div>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="section-label">Opening Hours</div>
      <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden' }}>
        {DAYS.map((day, i) => {
          const h = workingHours[day.key]
          return (
            <div key={day.key} style={{ padding: '14px 16px', borderBottom: i < DAYS.length - 1 ? '1px solid var(--blush)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: h.open ? 10 : 0 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: h.open ? 'var(--text-dark)' : 'var(--text-faint)' }}>{day.label}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, color: h.open ? 'var(--success)' : 'var(--text-faint)', fontWeight: 600 }}>{h.open ? 'Open' : 'Closed'}</span>
                  <div onClick={() => toggleDay(day.key)} style={{ width: 42, height: 24, borderRadius: 12, background: h.open ? 'var(--success)' : 'var(--blush-dark)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: h.open ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </label>
              </div>
              {h.open && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="time" value={h.start} onChange={e => updateHour(day.key, 'start', e.target.value)} className="form-input" style={{ flex: 1, padding: '8px 10px' }} />
                  <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>to</span>
                  <input type="time" value={h.end} onChange={e => updateHour(day.key, 'end', e.target.value)} className="form-input" style={{ flex: 1, padding: '8px 10px' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lunch break */}
      <div className="section-label">Lunch Break</div>
      <div style={{ margin: '0 20px', background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: lunchBreak.enabled ? 12 : 0 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Lunch Break</span>
          <div onClick={() => setLunchBreak(l => ({ ...l, enabled: !l.enabled }))} style={{ width: 42, height: 24, borderRadius: 12, background: lunchBreak.enabled ? 'var(--success)' : 'var(--blush-dark)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: lunchBreak.enabled ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
        {lunchBreak.enabled && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="time" value={lunchBreak.start} onChange={e => setLunchBreak(l => ({ ...l, start: e.target.value }))} className="form-input" style={{ flex: 1, padding: '8px 10px' }} />
            <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>to</span>
            <input type="time" value={lunchBreak.end} onChange={e => setLunchBreak(l => ({ ...l, end: e.target.value }))} className="form-input" style={{ flex: 1, padding: '8px 10px' }} />
          </div>
        )}
      </div>

      {/* Blocked slots */}
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 }}>
        <span>Blocked Time Slots</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowBlock(true)}><Plus size={14} /> Block</button>
      </div>

      {blockedSlots.length === 0 && (
        <div style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-light)', fontSize: 14 }}>No blocked slots — tap Block to add one</div>
      )}

      <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden' }}>
        {blockedSlots.map((slot, i) => (
          <div key={slot.id} style={{ padding: '13px 16px', borderBottom: i < blockedSlots.length - 1 ? '1px solid var(--blush)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{slot.date}</div>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{slot.start} – {slot.end}{slot.reason ? ` · ${slot.reason}` : ''}</div>
            </div>
            <button onClick={() => removeBlockedSlot(slot.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      {showBlock && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowBlock(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">Block Time Slot</div>
              <button className="btn-icon btn" onClick={() => setShowBlock(false)}><X size={18} /></button>
            </div>
            <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={blockForm.date} onChange={e => setBlockForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">From</label><input className="form-input" type="time" value={blockForm.start} onChange={e => setBlockForm(f => ({ ...f, start: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">To</label><input className="form-input" type="time" value={blockForm.end} onChange={e => setBlockForm(f => ({ ...f, end: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Reason (optional)</label><input className="form-input" placeholder="e.g. Lunch, Personal, Doctor" value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} /></div>
            <button className="btn btn-primary btn-full" onClick={handleAddBlock}>Block This Time</button>
          </div>
        </div>
      )}

      <div className="spacer-24" />
    </div>
  )
}
