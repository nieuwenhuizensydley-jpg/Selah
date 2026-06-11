import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CheckCircle } from 'lucide-react'

export default function CashUpPage() {
  const { cashUps, addCashUp, sales, showToast, TODAY } = useApp()
  const [cashCounted, setCashCounted] = useState('')
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)

  const todaySales = sales.filter(s => s.date === TODAY)
  const cashExpected = todaySales.filter(s => s.payment === 'Cash' && s.status === 'paid').reduce((s, x) => s + x.total, 0)
  const cardTotal = todaySales.filter(s => s.payment === 'Card' && s.status === 'paid').reduce((s, x) => s + x.total, 0)
  const eftTotal = todaySales.filter(s => s.payment === 'EFT' && s.status === 'paid').reduce((s, x) => s + x.total, 0)
  const eftPending = todaySales.filter(s => s.payment === 'EFT' && s.status === 'awaiting_eft').reduce((s, x) => s + x.total, 0)
  const tips = todaySales.reduce((s, x) => s + (x.tip || 0), 0)
  const totalRevenue = cashExpected + cardTotal + eftTotal + tips
  const counted = Number(cashCounted) || 0
  const variance = counted - cashExpected

  function handleCashUp() {
    addCashUp({ cashCounted: counted, cashExpected, cardTotal, eftTotal, tips, totalRevenue, notes, closedBy: 'Owner' })
    setDone(true)
    showToast('Cash-up complete ✓')
  }

  const prev = cashUps.slice().reverse()

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">End of Day</div>
          <div className="page-subtitle">Daily cash reconciliation</div>
        </div>
      </div>

      {/* Today summary */}
      <div style={{ padding: '14px 20px 0' }}>
        <div className="card card-gold" style={{ padding: 20, marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's Total Revenue</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'white', marginTop: 4 }}>R{totalRevenue.toLocaleString()}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            {[['Cash', cashExpected, '💵'], ['Card', cardTotal, '💳'], ['EFT Paid', eftTotal, '🏦'], ['Tips', tips, '💛']].map(([label, amt, icon]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{icon} {label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', marginTop: 2 }}>R{amt.toLocaleString()}</div>
              </div>
            ))}
          </div>
          {eftPending > 0 && (
            <div style={{ marginTop: 12, background: 'rgba(214,137,16,0.3)', borderRadius: 'var(--r-sm)', padding: '8px 12px', fontSize: 13, color: 'white', fontWeight: 500 }}>
              ⚠️ R{eftPending.toLocaleString()} EFT still awaiting payment
            </div>
          )}
        </div>
      </div>

      {/* Cash count */}
      {!done && (
        <div style={{ padding: '16px 20px 0' }}>
          <div className="card card-pad">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Count Your Cash</div>
            <div className="form-group">
              <label className="form-label">Cash Counted (R)</label>
              <input className="form-input" type="number" placeholder="Enter actual cash in drawer" value={cashCounted} onChange={e => setCashCounted(e.target.value)} style={{ fontSize: 20, fontFamily: 'var(--font-display)' }} />
            </div>

            {cashCounted && (
              <div style={{ background: Math.abs(variance) <= 5 ? 'var(--success-bg)' : variance > 0 ? 'var(--success-bg)' : 'var(--danger-bg)', border: `1px solid ${Math.abs(variance) <= 5 ? 'rgba(39,174,96,0.2)' : variance > 0 ? 'rgba(39,174,96,0.2)' : 'rgba(192,57,43,0.2)'}`, borderRadius: 'var(--r-sm)', padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: variance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {variance === 0 ? '✓ Perfect balance!' : variance > 0 ? `R${variance} over` : `R${Math.abs(variance)} short`}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>Expected: R{cashExpected} · Counted: R{counted}</div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} placeholder="Any discrepancies or notes..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <button className="btn btn-primary btn-full" onClick={handleCashUp}>
              <CheckCircle size={16} /> Complete Cash-Up
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="alert-banner alert-success" style={{ marginTop: 16 }}>
          <CheckCircle size={15} /> Cash-up complete for today!
        </div>
      )}

      {/* History */}
      {prev.length > 0 && (
        <>
          <div className="section-label">Previous Cash-Ups</div>
          <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden' }}>
            {prev.map(cu => {
              const v = cu.cashCounted - cu.cashExpected
              return (
                <div key={cu.id} style={{ padding: '13px 16px', borderBottom: '1px solid var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{cu.date}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 1 }}>Cash: R{cu.cashCounted} · Card: R{cu.cardTotal} · EFT: R{cu.eftTotal}</div>
                    {cu.notes && <div style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic', marginTop: 1 }}>{cu.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>R{cu.totalRevenue.toLocaleString()}</div>
                    <span className={`badge ${Math.abs(v) <= 5 ? 'badge-green' : v > 0 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                      {v === 0 ? 'Balanced' : v > 0 ? `+R${v}` : `-R${Math.abs(v)}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="spacer-24" />
    </div>
  )
}
