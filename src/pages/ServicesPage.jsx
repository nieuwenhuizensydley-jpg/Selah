import { useState } from 'react'
import { Plus, X, Trash2, ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

const CATS = ['Nails','Hair Colour','Hair Cut','Brows','Lashes','Waxing','Skincare','Makeup','Barber','Aesthetic','Other']

export default function ServicesPage() {
  const { services, setServices, addService, deleteService, showToast } = useApp()
  const [showAdd, setShowAdd]       = useState(false)
  const [expanded, setExpanded]     = useState(null)
  const [editSvc, setEditSvc]       = useState(null)
  const [form, setForm]             = useState({ name:'', category:'Nails', duration:'', price:'', buffer:'10' })
  const [addons, setAddons]         = useState([])
  const [addonForm, setAddonForm]   = useState({ name:'', price:'', duration:'' })

  function sf(f,v)  { setForm(p=>({...p,[f]:v})) }
  function saf(f,v) { setAddonForm(p=>({...p,[f]:v})) }

  function addAddon() {
    if (!addonForm.name) return
    setAddons(p=>[...p,{ id:Date.now(), name:addonForm.name, price:Number(addonForm.price)||0, duration:Number(addonForm.duration)||0 }])
    setAddonForm({ name:'', price:'', duration:'' })
  }

  function handleAdd() {
    if (!form.name||!form.duration||!form.price) { showToast('Fill in name, duration and price'); return }
    addService({ ...form, duration:Number(form.duration), price:Number(form.price), buffer:Number(form.buffer)||0, addons })
    setForm({ name:'', category:'Nails', duration:'', price:'', buffer:'10' })
    setAddons([])
    setShowAdd(false)
    showToast('Service added ✓')
  }

  function handleSaveEdit() {
    if (!editSvc) return
    setServices(p=>p.map(s=>s.id===editSvc.id?{...s, name:editSvc.name, price:Number(editSvc.price), duration:Number(editSvc.duration), buffer:Number(editSvc.buffer), category:editSvc.category }:s))
    setEditSvc(null)
    showToast('Service updated ✓')
  }

  const byCategory = services.reduce((acc,s)=>{ if(!acc[s.category])acc[s.category]=[]; acc[s.category].push(s); return acc },{})

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">Services</div>
          <div className="page-subtitle">{services.length} services</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={15}/> Add</button>
      </div>

      {Object.entries(byCategory).map(([cat,items])=>(
        <div key={cat}>
          <div className="section-label">{cat}</div>
          <div style={{ background:'var(--white)', margin:'0 20px', borderRadius:'var(--r-md)', border:'1px solid var(--blush-dark)', overflow:'hidden', boxShadow:'var(--shadow-xs)' }}>
            {items.map(svc=>(
              <div key={svc.id}>
                <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--blush)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1, cursor:'pointer' }} onClick={()=>setExpanded(expanded===svc.id?null:svc.id)}>
                    <div style={{ fontWeight:600, fontSize:15 }}>{svc.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-light)', marginTop:2 }}>{svc.duration}min + {svc.buffer}min buffer{svc.addons?.length>0?` · ${svc.addons.length} add-ons`:''}</div>
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:20, marginRight:4 }}>R{svc.price}</div>
                  <button onClick={()=>setEditSvc({...svc})} style={{ background:'transparent', border:'none', color:'var(--text-light)', cursor:'pointer', padding:4 }}><Edit2 size={15}/></button>
                  {expanded===svc.id?<ChevronUp size={16} color="var(--text-light)" onClick={()=>setExpanded(null)}/>:<ChevronDown size={16} color="var(--text-light)" onClick={()=>setExpanded(svc.id)}/>}
                </div>
                {expanded===svc.id&&(
                  <div style={{ background:'var(--blush)', padding:'12px 16px', borderBottom:'1px solid var(--blush-dark)' }}>
                    {svc.addons?.length>0?(
                      <>
                        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-light)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Add-ons</div>
                        {svc.addons.map(a=>(
                          <div key={a.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:13, borderBottom:'1px solid var(--blush-dark)' }}>
                            <span style={{ fontWeight:500 }}>{a.name}</span>
                            <span style={{ color:'var(--text-mid)' }}>+R{a.price} · +{a.duration}min</span>
                          </div>
                        ))}
                      </>
                    ):(
                      <div style={{ fontSize:13, color:'var(--text-light)' }}>No add-ons</div>
                    )}
                    <button onClick={()=>{ deleteService(svc.id); showToast('Service deleted') }} className="btn btn-danger btn-sm" style={{ marginTop:12 }}>
                      <Trash2 size={13}/> Delete Service
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edit service sheet */}
      {editSvc&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setEditSvc(null)}>
          <div className="sheet">
            <div className="sheet-handle"/>
            <div className="sheet-header">
              <div className="sheet-title">Edit Service</div>
              <button className="btn-icon btn" onClick={()=>setEditSvc(null)}><X size={18}/></button>
            </div>
            <div className="form-group"><label className="form-label">Service Name</label><input className="form-input" value={editSvc.name} onChange={e=>setEditSvc(p=>({...p,name:e.target.value}))}/></div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={editSvc.category} onChange={e=>setEditSvc(p=>({...p,category:e.target.value}))}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-input" type="number" value={editSvc.duration} onChange={e=>setEditSvc(p=>({...p,duration:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Buffer (min)</label><input className="form-input" type="number" value={editSvc.buffer} onChange={e=>setEditSvc(p=>({...p,buffer:e.target.value}))}/></div>
            </div>
            <div className="form-group"><label className="form-label">Price (R)</label><input className="form-input" type="number" value={editSvc.price} onChange={e=>setEditSvc(p=>({...p,price:e.target.value}))}/></div>
            <button className="btn btn-primary btn-full" onClick={handleSaveEdit}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Add service sheet */}
      {showAdd&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="sheet">
            <div className="sheet-handle"/>
            <div className="sheet-header">
              <div className="sheet-title">New Service</div>
              <button className="btn-icon btn" onClick={()=>setShowAdd(false)}><X size={18}/></button>
            </div>
            <div className="form-group"><label className="form-label">Service Name *</label><input className="form-input" value={form.name} onChange={e=>sf('name',e.target.value)} placeholder="e.g. Full Set Gel Nails" autoFocus/></div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e=>sf('category',e.target.value)}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Duration (min) *</label><input className="form-input" type="number" value={form.duration} onChange={e=>sf('duration',e.target.value)} placeholder="60"/></div>
              <div className="form-group"><label className="form-label">Buffer (min)</label><input className="form-input" type="number" value={form.buffer} onChange={e=>sf('buffer',e.target.value)} placeholder="10"/></div>
            </div>
            <div className="form-group"><label className="form-label">Price (R) *</label><input className="form-input" type="number" value={form.price} onChange={e=>sf('price',e.target.value)} placeholder="350"/></div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-mid)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Add-ons (optional)</div>
              <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                <input className="form-input" placeholder="Name" style={{ flex:2 }} value={addonForm.name} onChange={e=>saf('name',e.target.value)}/>
                <input className="form-input" placeholder="+R" style={{ flex:1 }} type="number" value={addonForm.price} onChange={e=>saf('price',e.target.value)}/>
                <input className="form-input" placeholder="+min" style={{ flex:1 }} type="number" value={addonForm.duration} onChange={e=>saf('duration',e.target.value)}/>
                <button className="btn btn-secondary" style={{ padding:'12px 12px', flexShrink:0 }} onClick={addAddon}><Plus size={14}/></button>
              </div>
              {addons.map(a=>(
                <div key={a.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:13, borderBottom:'1px solid var(--blush)' }}>
                  <span style={{ fontWeight:500 }}>{a.name}</span>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <span style={{ color:'var(--text-light)' }}>+R{a.price} · +{a.duration}min</span>
                    <button onClick={()=>setAddons(p=>p.filter(x=>x.id!==a.id))} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer' }}><X size={13}/></button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full" onClick={handleAdd}>Save Service</button>
          </div>
        </div>
      )}
      <div className="spacer-24"/>
    </div>
  )
}
