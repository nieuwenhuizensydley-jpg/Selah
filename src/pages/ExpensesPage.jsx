import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const CATS = ['Rent', 'Salary', 'Stock', 'Utilities', 'Marketing', 'Equipment', 'Insurance', 'Transport', 'Other']

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense, totalRevenue, showToast } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ category: 'Rent', description: '', amount: '' })

  function sf(f, v) { setForm(p => ({ ...p, [f]: v })) }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  function handleAdd() {
    if (!form.description || !form.amount) { showToast('Fill in all fields'); return }
    addExpense({ ...form, amount: Number(form.amount) })
    setForm({ category: 'Rent', description: '', amount: '' })
    setShowAdd(false)
    showToast('Expense added ✓')
  }

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">Expenses</div>
          <div className="page-subtitle">Track your business costs</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={15} /> Add</button>
      </div>

      {/* Summary */}
      <div style={{ padding: '14px 20px 0' }}>
        <div className="card card-gold" style={{ padding: '18px 20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Expenses</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'white', marginTop: 4 }}>R{totalExpenses.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Net Profit</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: netProfit >= 0 ? '#90EE90' : '#FFB3B3', marginTop: 4 }}>R{netProfit.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* By category */}
      {Object.keys(byCategory).length > 0 && (
        <>
          <div className="section-label">By Category</div>
          <div style={{ padding: '0 20px' }}>
            <div className="card card-pad">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-mid)' }}>{cat}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>R{amt.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* All expenses */}
      <div className="section-label">All Expenses</div>
      <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        {expenses.length === 0 && (
          <div className="empty" style={{ paddingTop: 32 }}>
            <div className="empty-title">No expenses yet</div>
            <div className="empty-text">Track rent, stock, salaries and more</div>
          </div>
        )}
        {expenses.slice().reverse().map(exp => (
          <div key={exp.id} style={{ padding: '13px 16px', borderBottom: '1px solid var(--blush)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--blush-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
              {exp.category === 'Rent' ? '🏠' : exp.category === 'Salary' ? '👤' : exp.category === 'Stock' ? '📦' : exp.category === 'Utilities' ? '💡' : exp.category === 'Marketing' ? '📣' : '💼'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{exp.description}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 1 }}>{exp.category} · {exp.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--danger)' }}>R{exp.amount.toLocaleString()}</span>
              <button onClick={() => { deleteExpense(exp.id); showToast('Expense deleted') }} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">Add Expense</div>
              <button className="btn-icon btn" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => sf('category', e.target.value)}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Description *</label><input className="form-input" placeholder="e.g. Studio rent June" value={form.description} onChange={e => sf('description', e.target.value)} autoFocus /></div>
            <div className="form-group"><label className="form-label">Amount (R) *</label><input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => sf('amount', e.target.value)} /></div>
            <button className="btn btn-primary btn-full" onClick={handleAdd}>Save Expense</button>
          </div>
        </div>
      )}

      <div className="spacer-24" />
    </div>
  )
}
