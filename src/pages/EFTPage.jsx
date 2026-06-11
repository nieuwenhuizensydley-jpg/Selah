import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function EFTPage() {
  const { sales, markSalePaid, markSalePartial, clients, markBalancePaid, showToast } = useApp()
  const [partialId, setPartialId] = useState(null)
  const [partialAmt, setPartialAmt] = useState('')

  const eftSales = sales.filter(s => s.payment === 'EFT' || s.status === 'awaiting_eft' || s.status === 'partial_eft').sort((a, b) => b.date.localeCompare(a.date))
  const outstanding = eftSales.filter(s => s.status === 'awaiting_eft' || s.status === 'partial_eft')
  const paid = eftSales.filter(s => s.status === 'paid')
  const totalDue = outstanding.reduce((s, x) => s + (x.remaining || x.total), 0)

  function handleMarkPaid(saleId, clientName) {
    markSalePaid(saleId)
    const client = clients.find(c => `${c.name} ${c.surname || ''}`.trim() === clientName)
    if (client && client.balance > 0) markBalancePaid(client.id)
    else showToast('EFT marked as paid ✓')
  }

  function handlePartial(sale) {
    const amt = Number(partialAmt)
    if (!amt || amt <= 0) { showToast('Enter a valid amount'); return }
    if (amt >= (sale.remaining || sale.total)) {
      handleMarkPaid(sale.id, sale.clientName)
    } else {
      markSalePartial(sale.id, amt)
      showToast(`R${amt} recorded — R${(sale.remaining || sale.total) - amt} still outstanding`)
    }
    setPartialId(null)
    setPartialAmt('')
  }

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">EFT Tracking</div>
          <div className="page-subtitle">Manual follow-up only — no auto messages</div>
        </div>
      </div>

      {totalDue > 0 ? (
        <div style={{ margin: '16px 20px 0', background: 'linear-gradient(135deg, #D68910, #E67E22)', borderRadius: 'var(--r-md)', padding: '16px 20px', color: 'white' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>Outstanding Balance</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginTop: 4 }}>R{totalDue.toLocaleString()}</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{outstanding.length} payment{outstanding.length !== 1 ? 's' : ''} awaiting</div>
          <div style={{ marginTop: 12, fontSize: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--r-sm)', padding: '8px 12px' }}>
            ℹ️ Follow up with clients manually. Selah never contacts clients automatically.
          </div>
        </div>
      ) : (
        <div className="alert-banner alert-success" style={{ marginTop: 16 }}>
          <CheckCircle size={16} /> All EFT payments are up to date!
        </div>
      )}

      {outstanding.length > 0 && (
        <>
          <div className="section-label">Outstanding</div>
          {outstanding.map(sale => (
            <div key={sale.id} style={{ margin: '0 20px 10px', background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1.5px solid rgba(214,137,16,0.35)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--blush)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{sale.clientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{sale.date}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4 }}>{sale.items?.map(i => i.name).join(', ')}</div>
                    {sale.status === 'partial_eft' && sale.paidAmount && (
                      <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4, fontWeight: 600 }}>
                        ✓ R{sale.paidAmount} paid — R{sale.remaining} still due
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--warning)' }}>R{(sale.remaining || sale.total).toLocaleString()}</div>
                    <span className={`badge ${sale.status === 'partial_eft' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: 10 }}>
                      {sale.status === 'partial_eft' ? 'Partial' : 'Awaiting EFT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Partial payment input */}
              {partialId === sale.id && (
                <div style={{ padding: '12px 16px', background: 'var(--blush)', borderBottom: '1px solid var(--blush-dark)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>How much did they pay?</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" type="number" placeholder="R amount received" value={partialAmt} onChange={e => setPartialAmt(e.target.value)} style={{ flex: 1 }} autoFocus />
                    <button className="btn btn-primary" onClick={() => handlePartial(sale)}>Record</button>
                    <button className="btn btn-secondary" onClick={() => setPartialId(null)}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ padding: '10px 16px', background: 'var(--blush)', display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text-light)' }}>
                  📱 Contact {sale.clientName.split(' ')[0]} manually to confirm
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => { setPartialId(sale.id); setPartialAmt('') }} style={{ flexShrink: 0, fontSize: 12 }}>
                  Partial
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleMarkPaid(sale.id, sale.clientName)} style={{ flexShrink: 0, fontSize: 12 }}>
                  <CheckCircle size={13} /> Paid
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {paid.length > 0 && (
        <>
          <div className="section-label">Paid EFTs</div>
          <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden' }}>
            {paid.map(sale => (
              <div key={sale.id} style={{ padding: '13px 16px', borderBottom: '1px solid var(--blush)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{sale.clientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{sale.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>R{sale.total.toLocaleString()}</div>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>Paid</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="spacer-24" />
    </div>
  )
}
