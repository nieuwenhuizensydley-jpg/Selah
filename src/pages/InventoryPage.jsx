import { useState } from 'react'
import { Plus, X, AlertTriangle, Package } from 'lucide-react'
import { useApp } from '../context/AppContext'

const CATS = ['Retail', 'Colour', 'Nails', 'Waxing', 'Skincare', 'Supplies', 'Other']

export default function InventoryPage() {
  const { inventory, addInventoryItem, adjustStock, showToast } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [form, setForm] = useState({ name: '', supplier: '', cost: '', price: '', stock: '', minStock: '', category: 'Supplies' })

  function sf(f, v) { setForm(p => ({ ...p, [f]: v })) }

  const lowStock = inventory.filter(i => i.stock <= i.minStock)
  const filtered = inventory.filter(i => !filterCat || i.category === filterCat)

  function handleAdd() {
    if (!form.name) { showToast('Product name required'); return }
    addInventoryItem({ ...form, cost: Number(form.cost) || 0, price: Number(form.price) || 0, stock: Number(form.stock) || 0, minStock: Number(form.minStock) || 0 })
    setForm({ name: '', supplier: '', cost: '', price: '', stock: '', minStock: '', category: 'Supplies' })
    setShowAdd(false)
    showToast('Product added ✓')
  }

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">Inventory</div>
          <div className="page-subtitle">{inventory.length} products</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={15} /> Add</button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{ margin: '12px 20px 0' }}>
          <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>
              <AlertTriangle size={15} /> Low Stock Alert — {lowStock.length} item{lowStock.length > 1 ? 's' : ''}
            </div>
            {lowStock.map(i => (
              <div key={i.id} style={{ fontSize: 13, color: 'var(--danger)', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>• {i.name}</span>
                <span style={{ fontWeight: 600 }}>{i.stock} left (min {i.minStock})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {['', ...CATS].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} className={`chip ${filterCat === c ? 'chip-sel' : 'chip-idle'}`} style={{ whiteSpace: 'nowrap', fontSize: 11 }}>
            {c || 'All'}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div style={{ background: 'var(--white)', margin: '0 20px', borderRadius: 'var(--r-md)', border: '1px solid var(--blush-dark)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        {filtered.map(item => {
          const isLow = item.stock <= item.minStock
          return (
            <div key={item.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--blush)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: isLow ? 'var(--danger-bg)' : 'var(--blush-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package size={17} color={isLow ? 'var(--danger)' : 'var(--text-light)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{item.supplier} · {item.category}</div>
                {item.cost > 0 && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>Cost R{item.cost}{item.price > 0 ? ` · Sell R${item.price}` : ''}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button className="btn-icon-sm" onClick={() => adjustStock(item.id, -1)} style={{ fontSize: 18, fontWeight: 700, border: '1.5px solid var(--blush-dark)' }}>−</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, minWidth: 28, textAlign: 'center', color: isLow ? 'var(--danger)' : 'var(--text-dark)', fontWeight: isLow ? 700 : 400 }}>{item.stock}</span>
                <button className="btn-icon-sm" onClick={() => adjustStock(item.id, 1)} style={{ fontSize: 18, fontWeight: 700, border: '1.5px solid var(--blush-dark)' }}>+</button>
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
              <div className="sheet-title">Add Product</div>
              <button className="btn-icon btn" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <div className="form-group"><label className="form-label">Product Name *</label><input className="form-input" value={form.name} onChange={e => sf('name', e.target.value)} placeholder="e.g. OPI Base Coat" autoFocus /></div>
            <div className="form-group"><label className="form-label">Supplier</label><input className="form-input" value={form.supplier} onChange={e => sf('supplier', e.target.value)} placeholder="Optional" /></div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => sf('category', e.target.value)}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Cost Price (R)</label><input className="form-input" type="number" value={form.cost} onChange={e => sf('cost', e.target.value)} placeholder="0" /></div>
              <div className="form-group"><label className="form-label">Sell Price (R)</label><input className="form-input" type="number" value={form.price} onChange={e => sf('price', e.target.value)} placeholder="0 (internal use)" /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Stock Qty</label><input className="form-input" type="number" value={form.stock} onChange={e => sf('stock', e.target.value)} placeholder="0" /></div>
              <div className="form-group"><label className="form-label">Min Stock</label><input className="form-input" type="number" value={form.minStock} onChange={e => sf('minStock', e.target.value)} placeholder="0" /></div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleAdd}>Save Product</button>
          </div>
        </div>
      )}

      <div className="spacer-24" />
    </div>
  )
}
