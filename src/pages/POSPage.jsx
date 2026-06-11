import { useState } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function POSPage() {
  const { clients, services, inventory, addSale, showToast } = useApp()
  const [clientId, setClientId] = useState('')
  const [items, setItems] = useState([])
  const [discountType, setDiscountType] = useState('fixed')
  const [discount, setDiscount] = useState('')
  const [tipType, setTipType] = useState('fixed')
  const [tip, setTip] = useState('')
  const [extras, setExtras] = useState([])
  const [extraLabel, setExtraLabel] = useState('')
  const [extraAmt, setExtraAmt] = useState('')
  const [payment, setPayment] = useState('Cash')
  const [splitPayments, setSplitPayments] = useState([])
  const [showSplit, setShowSplit] = useState(false)
  const [done, setDone] = useState(false)
  const [finalTotal, setFinalTotal] = useState(0)
  const [lastSale, setLastSale] = useState(null)

  const retailItems = inventory.filter(i => i.price > 0)

  function addServiceItem(serviceId) {
    const s = services.find(sv => sv.id === Number(serviceId))
    if (!s) return
    setItems(p => [...p, { id: Date.now(), name: s.name, price: s.price, type: 'service' }])
  }

  function addProductItem(prodId) {
    const p = inventory.find(i => i.id === Number(prodId))
    if (!p) return
    setItems(prev => [...prev, { id: Date.now(), name: p.name, price: p.price, type: 'product' }])
  }

  function addExtra() {
    if (!extraLabel || !extraAmt) return
    setExtras(p => [...p, { id: Date.now(), label: extraLabel, amount: Number(extraAmt) }])
    setExtraLabel(''); setExtraAmt('')
  }

  const subtotal = items.reduce((s, i) => s + i.price, 0)
  const extrasTotal = extras.reduce((s, e) => s + e.amount, 0)
  const baseTotal = subtotal + extrasTotal
  const discountAmt = discount
    ? discountType === 'percent' ? Math.round(baseTotal * Number(discount) / 100) : Math.min(Number(discount), baseTotal)
    : 0
  const afterDiscount = baseTotal - discountAmt
  const tipAmt = tip ? (tipType === 'percent' ? Math.round(afterDiscount * Number(tip) / 100) : Number(tip)) : 0
  const total = afterDiscount + tipAmt

  function handleCheckout() {
    if (items.length === 0) { showToast('Add at least one service or product'); return }
    const client = clients.find(c => c.id === Number(clientId))
    const saleData = {
      clientName: client ? `${client.name} ${client.surname || ''}`.trim() : 'Walk-in',
      items,
      extras,
      subtotal,
      discount: discountAmt,
      tip: tipAmt,
      total: afterDiscount,
      payment,
      status: payment === 'EFT' ? 'awaiting_eft' : 'paid'
    }
    setFinalTotal(total)
    setLastSale(saleData)
    addSale(saleData)
    setDone(true)
    setTimeout(() => {
      setDone(false)
      setClientId(''); setItems([]); setDiscount(''); setTip('')
      setExtras([]); setPayment('Cash')
    }, 3000)
  }

  if (done) return (
    <div style={{ padding: 24 }}>
      {/* Receipt */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--blush-dark)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', maxWidth: 380, margin: '0 auto' }}>
        {/* Receipt header */}
        <div style={{ background: 'linear-gradient(135deg, var(--gold-deeper), var(--gold))', padding: '20px', textAlign: 'center', color: 'white' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.15em' }}>SELAH</div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', opacity: 0.8, marginTop: 2, textTransform: 'uppercase' }}>Receipt</div>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Client & date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px dashed var(--blush-dark)' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Client</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{lastSale?.clientName || 'Walk-in'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{new Date().toLocaleDateString('en-ZA')}</div>
            </div>
          </div>

          {/* Line items */}
          {lastSale?.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
              <span>{item.name}</span>
              <span style={{ fontWeight: 600 }}>R{item.price}</span>
            </div>
          ))}
          {lastSale?.extras?.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: 'var(--text-mid)' }}>
              <span>+ {e.label}</span>
              <span>R{e.amount}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed var(--blush-dark)', marginTop: 10, paddingTop: 10 }}>
            {lastSale?.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--success)', padding: '3px 0' }}>
                <span>Discount</span><span>− R{lastSale.discount}</span>
              </div>
            )}
            {lastSale?.tip > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gold-dark)', padding: '3px 0' }}>
                <span>Tip</span><span>+ R{lastSale.tip}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, padding: '10px 0 0', borderTop: '2px solid var(--blush-dark)', marginTop: 6 }}>
              <span>Total</span><span>R{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginTop: 14, background: 'var(--blush-mid)', borderRadius: 'var(--r-sm)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 500 }}>Payment</span>
            <span style={{ fontWeight: 700, color: lastSale?.payment === 'EFT' ? 'var(--warning)' : 'var(--success)' }}>
              {lastSale?.payment}{lastSale?.payment === 'EFT' ? ' — Awaiting' : ' ✓'}
            </span>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-faint)' }}>Thank you for your visit! 💛</div>
        </div>
      </div>

      <button className="btn btn-primary btn-full" style={{ marginTop: 20 }} onClick={() => {
        setDone(false)
        setClientId(''); setItems([]); setDiscount(''); setTip('')
        setExtras([]); setPayment('Cash'); setLastSale(null)
      }}>
        New Checkout
      </button>
    </div>
  )

  return (
    <div>
      <div className="page-header-simple">
        <div className="page-title">Checkout</div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        {/* Client */}
        <div className="form-group">
          <label className="form-label">Client</label>
          <select className="form-input" value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">Walk-in / no client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.surname}{c.balance > 0 ? ` ⚠ Owes R${c.balance}` : ''}</option>)}
          </select>
        </div>

        {/* Add service */}
        <div className="form-group">
          <label className="form-label">Add Service</label>
          <select className="form-input" value="" onChange={e => addServiceItem(e.target.value)}>
            <option value="">Tap to add service...</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} — R{s.price}</option>)}
          </select>
        </div>

        {/* Add retail product */}
        {retailItems.length > 0 && (
          <div className="form-group">
            <label className="form-label">Add Retail Product</label>
            <select className="form-input" value="" onChange={e => addProductItem(e.target.value)}>
              <option value="">Tap to add product...</option>
              {retailItems.map(p => <option key={p.id} value={p.id}>{p.name} — R{p.price}</option>)}
            </select>
          </div>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div className="card card-pad mb-16">
            {items.map(item => (
              <div key={item.id} className="pos-line">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'capitalize' }}>{item.type}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>R{item.price}</span>
                  <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Extra charges */}
        <div style={{ marginBottom: 16 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Extra Charges</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="e.g. Nail Art" style={{ flex: 2 }} value={extraLabel} onChange={e => setExtraLabel(e.target.value)} />
            <input className="form-input" placeholder="R" style={{ flex: 1 }} type="number" value={extraAmt} onChange={e => setExtraAmt(e.target.value)} />
            <button className="btn btn-secondary" style={{ padding: '12px 14px', flexShrink: 0 }} onClick={addExtra}><Plus size={16} /></button>
          </div>
          {extras.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: 14, borderBottom: '1px solid var(--blush)' }}>
              <span style={{ color: 'var(--text-mid)' }}>+ {e.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>R{e.amount}</span>
                <button onClick={() => setExtras(p => p.filter(x => x.id !== e.id))} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}><X size={13} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Discount */}
        <div style={{ marginBottom: 16 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Discount</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Amount" style={{ flex: 2 }} type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button className={`pay-btn ${discountType === 'fixed' ? 'sel' : ''}`} style={{ width: 52 }} onClick={() => setDiscountType('fixed')}>R</button>
              <button className={`pay-btn ${discountType === 'percent' ? 'sel' : ''}`} style={{ width: 52 }} onClick={() => setDiscountType('percent')}>%</button>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div style={{ marginBottom: 16 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Tip</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Amount" style={{ flex: 2 }} type="number" value={tip} onChange={e => setTip(e.target.value)} />
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button className={`pay-btn ${tipType === 'fixed' ? 'sel' : ''}`} style={{ width: 52 }} onClick={() => setTipType('fixed')}>R</button>
              <button className={`pay-btn ${tipType === 'percent' ? 'sel' : ''}`} style={{ width: 52 }} onClick={() => setTipType('percent')}>%</button>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="card card-pad mb-16">
          <div className="pos-total"><span>Subtotal</span><span>R{subtotal.toLocaleString()}</span></div>
          {extrasTotal > 0 && <div className="pos-total"><span>Extras</span><span style={{ color: 'var(--text-dark)' }}>+ R{extrasTotal}</span></div>}
          {discountAmt > 0 && <div className="pos-total"><span>Discount{discountType === 'percent' ? ` (${discount}%)` : ''}</span><span style={{ color: 'var(--success)' }}>− R{discountAmt}</span></div>}
          {tipAmt > 0 && <div className="pos-total"><span>Tip{tipType === 'percent' ? ` (${tip}%)` : ''}</span><span style={{ color: 'var(--gold-dark)' }}>+ R{tipAmt}</span></div>}
          <div className="pos-total grand"><span>Total</span><span>R{total.toLocaleString()}</span></div>
        </div>

        {/* Payment method */}
        <div className="form-label" style={{ marginBottom: 10 }}>Payment Method</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['Cash', 'Card', 'EFT', 'Other'].map(m => (
            <button key={m} className={`pay-btn ${payment === m ? 'sel' : ''}`} onClick={() => setPayment(m)}>{m}</button>
          ))}
        </div>

        {payment === 'EFT' && (
          <div className="alert-banner alert-warning" style={{ margin: '0 0 16px' }}>
            ⚠️ EFT payments are marked as outstanding — you'll be reminded to follow up manually. No automated messages are sent.
          </div>
        )}

        <button className="btn btn-primary btn-full mb-16" onClick={handleCheckout} style={{ fontSize: 16, padding: '15px' }}>
          Complete Checkout · R{total.toLocaleString()}
        </button>
      </div>
    </div>
  )
}
