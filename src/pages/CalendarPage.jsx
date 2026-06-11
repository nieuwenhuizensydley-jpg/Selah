import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Check, Edit2, Trash2, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'

const DAYS_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAYS_LETTER = ['S','M','T','W','T','F','S']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 7).padStart(2,'0')}:00`) // 07:00–19:00

export default function CalendarPage() {
  const { appointments, addAppointment, cancelAppointment, updateAppointment, clients, services, showToast, TODAY, workingHours, lunchBreak, blockedSlots } = useApp()

  const [year, setYear]       = useState(2026)
  const [month, setMonth]     = useState(5)
  const [selected, setSelected] = useState(TODAY)
  const [view, setView]       = useState('month') // month | week | day
  const [showBook, setShowBook] = useState(false)
  const [editApt, setEditApt] = useState(null)
  const [search, setSearch]   = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [form, setForm]       = useState({ clientId: '', serviceId: '', selectedAddons: [], time: '09:00', notes: '' })

  function sf(f, v) { setForm(p => ({ ...p, [f]: v })) }

  // ── Month helpers ──
  const firstDay     = new Date(year, month, 1).getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const prevDays     = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false })
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, cur: true })
  while (cells.length < 42) cells.push({ day: cells.length - daysInMonth - firstDay + 1, cur: false })

  function ds(d) { return `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` }
  function prevMonth() { if (month===0){setYear(y=>y-1);setMonth(11)}else setMonth(m=>m-1) }
  function nextMonth() { if (month===11){setYear(y=>y+1);setMonth(0)}else setMonth(m=>m+1) }

  // ── Week helpers ──
  function getWeekDates(dateStr) {
    const d = new Date(dateStr)
    const day = d.getDay()
    const monday = new Date(d); monday.setDate(d.getDate() - day)
    return Array.from({length:7},(_,i)=>{ const x=new Date(monday); x.setDate(monday.getDate()+i); return x.toISOString().split('T')[0] })
  }
  const weekDates = getWeekDates(selected)

  // ── Filtered appointments ──
  const selApts = appointments
    .filter(a => a.date === selected && a.status !== 'cancelled')
    .sort((a,b)=>a.time.localeCompare(b.time))

  const searchResults = search.length > 1
    ? appointments.filter(a =>
        a.status !== 'cancelled' &&
        (a.clientName?.toLowerCase().includes(search.toLowerCase()) ||
         a.service?.toLowerCase().includes(search.toLowerCase()))
      ).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20)
    : []

  // ── Service calc ──
  const selectedSvc = services.find(s => s.id === Number(form.serviceId))
  const addonDur   = form.selectedAddons.reduce((s,id)=>{ const a=selectedSvc?.addons?.find(x=>x.id===Number(id)); return s+(a?.duration||0) },0)
  const addonPrice = form.selectedAddons.reduce((s,id)=>{ const a=selectedSvc?.addons?.find(x=>x.id===Number(id)); return s+(a?.price||0) },0)
  const totalDur   = selectedSvc ? selectedSvc.duration + selectedSvc.buffer + addonDur : 0
  const totalPrice = selectedSvc ? selectedSvc.price + addonPrice : 0

  function handleBook() {
    if (!form.serviceId) { showToast('Select a service'); return }
    const client = clients.find(c=>c.id===Number(form.clientId))
    const addonNames = form.selectedAddons.map(id=>selectedSvc?.addons?.find(a=>a.id===Number(id))?.name).filter(Boolean)
    addAppointment({ clientId:client?.id||null, clientName:client?`${client.name} ${client.surname||''}`.trim():'Walk-in', service:selectedSvc.name, addons:addonNames, date:selected, time:form.time, duration:totalDur, price:totalPrice, staff:'Owner', notes:form.notes })
    setShowBook(false)
    setForm({ clientId:'', serviceId:'', selectedAddons:[], time:'09:00', notes:'' })
    showToast('Appointment booked ✓')
  }

  function handleUpdate() {
    if (!editApt) return
    updateAppointment(editApt.id, { time: editApt.time, notes: editApt.notes, price: Number(editApt.price) })
    setEditApt(null)
    showToast('Appointment updated ✓')
  }

  function handleCancel(id) {
    cancelAppointment(id)
    showToast('Appointment cancelled')
  }

  const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][new Date(selected).getDay()]
  const todayHours = workingHours?.[dayKey]

  return (
    <div>
      {/* Header */}
      <div style={{ padding:'20px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div className="page-title">Calendar</div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-icon btn" onClick={()=>setShowSearch(v=>!v)}><Search size={17}/></button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowBook(true)}><Plus size={15}/> Book</button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div style={{ padding:'12px 20px 0' }}>
          <input className="form-input" placeholder="Search client or service..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus />
          {searchResults.length > 0 && (
            <div style={{ background:'var(--white)', borderRadius:'var(--r-md)', border:'1px solid var(--blush-dark)', marginTop:8, overflow:'hidden', boxShadow:'var(--shadow-md)' }}>
              {searchResults.map(apt=>(
                <div key={apt.id} onClick={()=>{ setSelected(apt.date); setShowSearch(false); setSearch('') }} style={{ padding:'12px 16px', borderBottom:'1px solid var(--blush)', cursor:'pointer', display:'flex', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{apt.clientName}</div>
                    <div style={{ fontSize:12, color:'var(--text-light)' }}>{apt.service} · {apt.date} {apt.time}</div>
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:16 }}>R{apt.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View switcher */}
      <div style={{ display:'flex', gap:0, margin:'14px 20px 0', background:'var(--blush-mid)', borderRadius:'var(--r-full)', padding:4 }}>
        {[['month','Month'],['week','Week'],['day','Day']].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{ flex:1, padding:'8px', borderRadius:'var(--r-full)', border:'none', fontWeight:700, fontSize:13, cursor:'pointer', background:view===v?'var(--white)':'transparent', color:view===v?'var(--gold-dark)':'var(--text-light)', boxShadow:view===v?'var(--shadow-sm)':'none', transition:'all 0.2s' }}>{l}</button>
        ))}
      </div>

      {/* ── MONTH VIEW ── */}
      {view === 'month' && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 10px' }}>
            <button className="btn-icon btn" onClick={prevMonth}><ChevronLeft size={18}/></button>
            <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400 }}>{MONTHS[month]} {year}</span>
            <button className="btn-icon btn" onClick={nextMonth}><ChevronRight size={18}/></button>
          </div>
          <div className="cal-grid">
            {DAYS_LETTER.map((d,i)=><div key={i} className="cal-day-label">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((cell,i)=>{
              const dateStr = cell.cur ? ds(cell.day) : null
              const isToday = dateStr===TODAY
              const isSel   = dateStr===selected
              const aptCount= dateStr ? appointments.filter(a=>a.date===dateStr&&a.status!=='cancelled').length : 0
              return (
                <div key={i} className={`cal-day${isToday?' today':''}${isSel&&!isToday?' selected':''}${!cell.cur?' other-month':''}`} onClick={()=>{ if(cell.cur){setSelected(dateStr);setView('day')} }}>
                  {cell.day}
                  {aptCount>0 && <div className={`cal-dot${isToday?' cal-dot-white':''}`}/>}
                </div>
              )
            })}
          </div>
          {/* Month apt count summary */}
          <div style={{ padding:'12px 20px 0', display:'flex', gap:8, flexWrap:'wrap' }}>
            {Array.from({length:daysInMonth},(_,i)=>i+1).filter(d=>{
              const dateStr=ds(d)
              return appointments.filter(a=>a.date===dateStr&&a.status!=='cancelled').length>0
            }).slice(0,5).map(d=>{
              const dateStr=ds(d)
              const apts=appointments.filter(a=>a.date===dateStr&&a.status!=='cancelled')
              return (
                <div key={d} onClick={()=>{setSelected(dateStr);setView('day')}} style={{ background:'var(--white)', border:'1px solid var(--blush-dark)', borderRadius:'var(--r-sm)', padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                  {d} {MONTHS[month].slice(0,3)} · {apts.length} apt{apts.length!==1?'s':''}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── WEEK VIEW ── */}
      {view === 'week' && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 10px' }}>
            <button className="btn-icon btn" onClick={()=>{ const d=new Date(selected); d.setDate(d.getDate()-7); setSelected(d.toISOString().split('T')[0]) }}><ChevronLeft size={18}/></button>
            <span style={{ fontFamily:'var(--font-display)', fontSize:18 }}>{MONTHS[month]} {year}</span>
            <button className="btn-icon btn" onClick={()=>{ const d=new Date(selected); d.setDate(d.getDate()+7); setSelected(d.toISOString().split('T')[0]) }}><ChevronRight size={18}/></button>
          </div>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, padding:'0 16px', marginBottom:8 }}>
            {weekDates.map(dateStr=>{
              const d=new Date(dateStr)
              const isToday=dateStr===TODAY
              const isSel=dateStr===selected
              const aptCount=appointments.filter(a=>a.date===dateStr&&a.status!=='cancelled').length
              return (
                <div key={dateStr} onClick={()=>{setSelected(dateStr);setView('day')}} style={{ textAlign:'center', padding:'8px 4px', borderRadius:'var(--r-sm)', background:isToday?'linear-gradient(135deg,var(--gold-deeper),var(--gold))':isSel?'rgba(201,169,110,0.15)':'transparent', cursor:'pointer', border:isSel&&!isToday?'1.5px solid var(--gold)':'1px solid transparent' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:isToday?'rgba(255,255,255,0.8)':'var(--text-faint)', letterSpacing:'0.06em' }}>{DAYS_SHORT[d.getDay()].toUpperCase()}</div>
                  <div style={{ fontSize:17, fontWeight:700, color:isToday?'white':isSel?'var(--gold-dark)':'var(--text-dark)', marginTop:2 }}>{d.getDate()}</div>
                  {aptCount>0&&<div style={{ width:5,height:5,borderRadius:'50%',background:isToday?'rgba(255,255,255,0.7)':'var(--gold)',margin:'3px auto 0' }}/>}
                </div>
              )
            })}
          </div>
          {/* Week appointments */}
          <div style={{ padding:'0 20px' }}>
            {weekDates.map(dateStr=>{
              const apts=appointments.filter(a=>a.date===dateStr&&a.status!=='cancelled').sort((a,b)=>a.time.localeCompare(b.time))
              if(!apts.length) return null
              return (
                <div key={dateStr} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:6 }}>
                    {DAYS_SHORT[new Date(dateStr).getDay()]} {new Date(dateStr).getDate()}
                  </div>
                  {apts.map(apt=>(
                    <div key={apt.id} className="apt-slot" style={{ marginLeft:0,marginRight:0,marginBottom:6 }} onClick={()=>setEditApt({...apt})}>
                      <div className="apt-time">{apt.time}</div>
                      <div style={{ flex:1 }}>
                        <div className="apt-name">{apt.clientName}</div>
                        <div className="apt-svc">{apt.service}</div>
                      </div>
                      <div style={{ fontFamily:'var(--font-display)',fontSize:17 }}>R{apt.price}</div>
                    </div>
                  ))}
                </div>
              )
            })}
            {weekDates.every(d=>!appointments.filter(a=>a.date===d&&a.status!=='cancelled').length)&&(
              <div style={{ textAlign:'center',padding:'32px 0',color:'var(--text-light)',fontSize:14 }}>No appointments this week</div>
            )}
          </div>
        </>
      )}

      {/* ── DAY VIEW ── */}
      {view === 'day' && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 10px' }}>
            <button className="btn-icon btn" onClick={()=>{ const d=new Date(selected); d.setDate(d.getDate()-1); setSelected(d.toISOString().split('T')[0]) }}><ChevronLeft size={18}/></button>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:20 }}>{new Date(selected).toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'})}</div>
              {todayHours && <div style={{ fontSize:12,color:'var(--text-light)',marginTop:2 }}>{todayHours.open?`Open ${todayHours.start}–${todayHours.end}`:'Closed today'}</div>}
            </div>
            <button className="btn-icon btn" onClick={()=>{ const d=new Date(selected); d.setDate(d.getDate()+1); setSelected(d.toISOString().split('T')[0]) }}><ChevronRight size={18}/></button>
          </div>

          {/* Lunch / blocked banners */}
          {lunchBreak?.enabled && (
            <div style={{ margin:'0 20px 8px',background:'rgba(214,137,16,0.08)',border:'1px solid rgba(214,137,16,0.2)',borderRadius:'var(--r-sm)',padding:'8px 12px',fontSize:12,color:'var(--warning)',fontWeight:600 }}>
              🍽 Lunch break: {lunchBreak.start}–{lunchBreak.end}
            </div>
          )}
          {blockedSlots?.filter(s=>s.date===selected).map(slot=>(
            <div key={slot.id} style={{ margin:'0 20px 8px',background:'rgba(192,57,43,0.06)',border:'1px solid rgba(192,57,43,0.15)',borderRadius:'var(--r-sm)',padding:'8px 12px',fontSize:12,color:'var(--danger)',fontWeight:600 }}>
              🚫 Blocked {slot.start}–{slot.end}{slot.reason?` · ${slot.reason}`:''}
            </div>
          ))}

          {/* Time slots */}
          <div style={{ padding:'0 20px' }}>
            {HOURS.map(hour=>{
              const apts=selApts.filter(a=>a.time.startsWith(hour.split(':')[0]))
              const isBlocked=blockedSlots?.some(s=>s.date===selected&&s.start<=hour&&s.end>hour)
              const isLunch=lunchBreak?.enabled&&lunchBreak.start<=hour&&lunchBreak.end>hour
              return (
                <div key={hour} style={{ display:'flex', gap:12, marginBottom:4, minHeight:52 }}>
                  <div style={{ width:44,paddingTop:8,fontSize:12,fontWeight:600,color:'var(--text-faint)',textAlign:'right',flexShrink:0 }}>{hour}</div>
                  <div style={{ flex:1, borderLeft:'2px solid var(--blush-dark)', paddingLeft:12, paddingTop:4 }}>
                    {isLunch&&!apts.length&&(
                      <div style={{ background:'rgba(214,137,16,0.08)',borderRadius:'var(--r-sm)',padding:'8px 10px',fontSize:12,color:'var(--warning)',fontWeight:600 }}>🍽 Lunch break</div>
                    )}
                    {isBlocked&&!apts.length&&(
                      <div style={{ background:'rgba(192,57,43,0.06)',borderRadius:'var(--r-sm)',padding:'8px 10px',fontSize:12,color:'var(--danger)',fontWeight:600 }}>🚫 Blocked</div>
                    )}
                    {apts.map(apt=>(
                      <div key={apt.id} onClick={()=>setEditApt({...apt})} style={{ background:'var(--white)',borderRadius:'var(--r-sm)',borderLeft:'3px solid var(--gold)',padding:'8px 12px',marginBottom:4,boxShadow:'var(--shadow-xs)',cursor:'pointer' }}>
                        <div style={{ fontWeight:700,fontSize:14 }}>{apt.clientName}</div>
                        <div style={{ fontSize:12,color:'var(--text-light)',marginTop:1 }}>{apt.service}{apt.addons?.length?` + ${apt.addons.join(', ')}`:''} · {apt.duration}min</div>
                        <div style={{ fontFamily:'var(--font-display)',fontSize:16,color:'var(--gold-dark)',marginTop:2 }}>R{apt.price}</div>
                      </div>
                    ))}
                    {!apts.length&&!isLunch&&!isBlocked&&(
                      <div onClick={()=>setShowBook(true)} style={{ height:36,borderRadius:'var(--r-sm)',cursor:'pointer',display:'flex',alignItems:'center',paddingLeft:8,color:'var(--text-faint)',fontSize:12 }}/>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="spacer-24"/>

      {/* ── BOOK SHEET ── */}
      {showBook && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowBook(false)}>
          <div className="sheet">
            <div className="sheet-handle"/>
            <div className="sheet-header">
              <div className="sheet-title">Book Appointment</div>
              <button className="btn-icon btn" onClick={()=>setShowBook(false)}><X size={18}/></button>
            </div>
            <div style={{ background:'var(--blush-mid)',borderRadius:'var(--r-sm)',padding:'10px 14px',marginBottom:16,fontSize:13,fontWeight:600,color:'var(--text-mid)' }}>📅 {selected}</div>
            <div className="form-group">
              <label className="form-label">Client</label>
              <select className="form-input" value={form.clientId} onChange={e=>sf('clientId',e.target.value)}>
                <option value="">Walk-in / no client</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name} {c.surname}{c.alerts?.length?` ⚠️`:''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Service *</label>
              <select className="form-input" value={form.serviceId} onChange={e=>{sf('serviceId',e.target.value);sf('selectedAddons',[])}}>
                <option value="">Select service...</option>
                {services.map(s=><option key={s.id} value={s.id}>{s.name} — R{s.price} ({s.duration}min)</option>)}
              </select>
            </div>
            {selectedSvc?.addons?.length>0&&(
              <div className="form-group">
                <label className="form-label">Add-ons</label>
                <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                  {selectedSvc.addons.map(addon=>{
                    const sel=form.selectedAddons.includes(String(addon.id))
                    return <button key={addon.id} onClick={()=>sf('selectedAddons',sel?form.selectedAddons.filter(x=>x!==String(addon.id)):[...form.selectedAddons,String(addon.id)])} className={`chip ${sel?'chip-sel':'chip-idle'}`}>{sel&&<Check size={11}/>} {addon.name} +R{addon.price}</button>
                  })}
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="form-input" type="time" value={form.time} onChange={e=>sf('time',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Staff Member</label>
              <select className="form-input" value={form.staff||'Owner'} onChange={e=>sf('staff',e.target.value)}>
                {['Owner','Assistant','Stylist'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" placeholder="Optional..." value={form.notes} onChange={e=>sf('notes',e.target.value)}/>
            </div>
            {selectedSvc&&(
              <div style={{ background:'var(--blush-mid)',borderRadius:'var(--r-sm)',padding:'12px 14px',marginBottom:16 }}>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:13 }}>
                  <span style={{ color:'var(--text-light)' }}>Duration</span>
                  <span style={{ fontWeight:600 }}>{totalDur} min (incl. {selectedSvc.buffer}min buffer)</span>
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:15,marginTop:6 }}>
                  <span style={{ fontWeight:600 }}>Total</span>
                  <span style={{ fontFamily:'var(--font-display)',fontSize:20,color:'var(--gold-dark)' }}>R{totalPrice}</span>
                </div>
              </div>
            )}
            <button className="btn btn-primary btn-full" onClick={handleBook}>Confirm Booking</button>
          </div>
        </div>
      )}

      {/* ── EDIT APPOINTMENT SHEET ── */}
      {editApt && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setEditApt(null)}>
          <div className="sheet">
            <div className="sheet-handle"/>
            <div className="sheet-header">
              <div className="sheet-title">Appointment</div>
              <button className="btn-icon btn" onClick={()=>setEditApt(null)}><X size={18}/></button>
            </div>
            <div style={{ background:'linear-gradient(135deg,var(--gold-deeper),var(--gold))',borderRadius:'var(--r-md)',padding:'14px 16px',marginBottom:16,color:'white' }}>
              <div style={{ fontFamily:'var(--font-display)',fontSize:20 }}>{editApt.clientName}</div>
              <div style={{ fontSize:13,opacity:0.85,marginTop:2 }}>{editApt.service}{editApt.addons?.length?` + ${editApt.addons.join(', ')}`:''}</div>
              <div style={{ fontSize:13,opacity:0.75,marginTop:2 }}>{editApt.date} · {editApt.duration}min</div>
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="form-input" type="time" value={editApt.time} onChange={e=>setEditApt(p=>({...p,time:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Price (R)</label>
              <input className="form-input" type="number" value={editApt.price} onChange={e=>setEditApt(p=>({...p,price:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={editApt.notes||''} onChange={e=>setEditApt(p=>({...p,notes:e.target.value}))}/>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={handleUpdate}>Save Changes</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={()=>{ handleCancel(editApt.id); setEditApt(null) }}>Cancel Apt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
