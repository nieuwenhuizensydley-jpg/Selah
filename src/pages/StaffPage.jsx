import { useState } from 'react'
import { Plus, X, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function StaffPage() {
  const { staff, addStaffMember, updateStaff, appointments, sales, showToast } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', role: 'Stylist', commissionRate: '', email: '', mobile: '' })

  function sf(f, v) { setForm(p => ({ ...p, [f]: v })) }

  function handleAdd() {
    if (!form.name) { showToast('Staff name required'); return }
    addStaffMember({ ...form, commissionRate: Number(form.commissionRate) || 0 })
    setForm({ name: '', role: 'Stylist', commissionRate: '', email: '', mobile: '' })
    setShowAdd(false)
    showToast('Staff member added ✓')
  }

  function staffRevenue(name) {
    return sales.filter(s => s.status === 'paid').reduce((sum, sale) => {
      const aptForSale = appointments.find(a => a.clientName === sale.clientName && a.staff === name)
      return aptForSale ? sum + sale.total : sum
    }, 0)
  }

  function staffApts(name) {
    return appointments.filter(a => a.staff === name && a.status !== 'cancelled').length
  }

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">Staff</div>
          <div className="page-subtitle">{staff.length} team members</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={15} /> Add</button>
      </div>

      <div className="section-label">Team Members</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
        {staff.map(member => {
          const rev = staffRevenue(member.name)
          const apts = staffApts(member.name)
          const commission = member.commissionRate > 0 ? Math.round(rev * member.commissionRate / 100) : 0
          return (
            <div key={member.id} className="card card-pad">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-light), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={22} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{member.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 1 }}>{member.role}</div>
                  {member.mobile && <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{member.mobile}</div>}
                </div>
                <div>
                  <span className={`badge ${member.active ? 'badge-green' : 'badge-red'}`}>{member.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="divider" style={{ margin: '12px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{apts}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Apts</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>R{rev.toLocaleString()}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: member.commissionRate > 0 ? 'var(--gold-dark)' : 'var(--text-faint)' }}>
                    {member.commissionRate > 0 ? `R${commission}` : '—'}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {member.commissionRate > 0 ? `${member.commissionRate}% Comm` : 'No Comm'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => updateStaff(member.id, { active: !member.active })}>
                  {member.active ? 'Mark Inactive' : 'Mark Active'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">Add Staff Member</div>
              <button className="btn-icon btn" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => sf('name', e.target.value)} placeholder="e.g. Lerato Dlamini" autoFocus /></div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={e => sf('role', e.target.value)}>
                {['Owner', 'Stylist', 'Nail Tech', 'Lash Tech', 'Beautician', 'Assistant', 'Receptionist'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Commission Rate (%)</label><input className="form-input" type="number" value={form.commissionRate} onChange={e => sf('commissionRate', e.target.value)} placeholder="0 = no commission" /></div>
            <div className="form-group"><label className="form-label">Mobile</label><input className="form-input" type="tel" value={form.mobile} onChange={e => sf('mobile', e.target.value)} placeholder="Optional" /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => sf('email', e.target.value)} placeholder="Optional" /></div>
            <button className="btn btn-primary btn-full" onClick={handleAdd}>Add Staff Member</button>
          </div>
        </div>
      )}

      <div className="spacer-24" />
    </div>
  )
}
