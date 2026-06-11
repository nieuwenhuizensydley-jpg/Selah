import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, X, Filter } from 'lucide-react'
import { useApp } from '../context/AppContext'

const FLAG_COLORS = { 'VIP': 'badge-gold', 'Owes Money': 'badge-red', 'Allergy Alert': 'badge-orange', 'Frequent Visitor': 'badge-blue', 'Referral Client': 'badge-green', 'Preferred Client': 'badge-gold' }

export default function ClientsPage() {
  const { clients, addClient, showToast } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterFlag, setFilterFlag] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', surname: '', mobile: '', email: '', dob: '', address: '', notes: '' })

  const filtered = clients.filter(c => {
    const matchSearch = `${c.name} ${c.surname}`.toLowerCase().includes(search.toLowerCase()) || c.mobile?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
    const matchFlag = !filterFlag || c.flags?.includes(filterFlag)
    return matchSearch && matchFlag
  })

  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }

  function handleAdd() {
    if (!form.name.trim()) { showToast('Client first name is required'); return }
    addClient(form)
    setForm({ name: '', surname: '', mobile: '', email: '', dob: '', address: '', notes: '' })
    setShowAdd(false)
    showToast('Client added ✓')
  }

  function initials(c) { return `${c.name[0]}${c.surname?.[0] || ''}`.toUpperCase() }

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-subtitle">{clients.length} clients total</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> New Client
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 20px 0', position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 34, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
        <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search name, number, email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {['', 'VIP', 'Owes Money', 'Allergy Alert', 'Frequent Visitor'].map(f => (
          <button key={f} onClick={() => setFilterFlag(f)} className={`chip ${filterFlag === f ? 'chip-sel' : 'chip-idle'}`} style={{ whiteSpace: 'nowrap' }}>
            {f || 'All Clients'}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', margin: '0 20px', overflow: 'hidden', border: '1px solid var(--blush-dark)', boxShadow: 'var(--shadow-xs)' }}>
        {filtered.length === 0 && (
          <div className="empty">
            <div className="empty-icon"><Search size={26} /></div>
            <div className="empty-title">No clients found</div>
            <div className="empty-text">Try a different search or add a new client</div>
          </div>
        )}
        {filtered.map(client => (
          <div key={client.id} className="list-item" onClick={() => navigate(`/clients/${client.id}`)}>
            <div className="avatar">{initials(client)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="list-name">{client.name} {client.surname}</div>
              <div className="list-sub">{client.mobile || client.email || 'No contact info'}</div>
              {client.balance > 0 && <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700, marginTop: 2 }}>⚠ Owes R{client.balance}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              {client.flags?.slice(0, 2).map(flag => (
                <span key={flag} className={`badge ${FLAG_COLORS[flag] || 'badge-gold'}`} style={{ fontSize: 10 }}>{flag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="spacer-16" />

      {/* Add client sheet */}
      {showAdd && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">New Client</div>
              <button className="btn-icon btn" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-input" placeholder="Required" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Surname</label>
                <input className="form-input" placeholder="Optional" value={form.surname} onChange={e => set('surname', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input className="form-input" type="tel" placeholder="082 000 0000" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="Optional" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="Optional" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Notes</label>
              <textarea className="form-input" rows={3} placeholder="Allergies, preferences, anything useful..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            <button className="btn btn-primary btn-full" onClick={handleAdd}>Save Client</button>
          </div>
        </div>
      )}
    </div>
  )
}
