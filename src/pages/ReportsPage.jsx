import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { AlertCircle, Download, FileText } from 'lucide-react'

function exportCSV(sales, expenses) {
  const rows = [
    ['SELAH REPORT'],
    [],
    ['SALES'],
    ['Date','Client','Items','Subtotal','Discount','Tip','Total','Payment','Status'],
    ...sales.map(s=>[s.date,s.clientName,s.items?.map(i=>i.name).join(' + '),s.subtotal,s.discount||0,s.tip||0,s.total,s.payment,s.status]),
    [],
    ['EXPENSES'],
    ['Date','Category','Description','Amount'],
    ...expenses.map(e=>[e.date,e.category,e.description,e.amount]),
  ]
  const csv = rows.map(r=>r.join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download='selah-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

function exportPDF(sales, expenses, business, totalRevenue, netProfit, totalExpenses, totalTips) {
  const html = `
    <!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <title>Selah Report</title>
    <style>
      body{font-family:Georgia,serif;padding:40px;color:#1E1410;max-width:700px;margin:0 auto}
      h1{font-size:36px;letter-spacing:8px;color:#A0784A;margin-bottom:4px}
      h2{font-size:18px;color:#A0784A;margin:32px 0 12px;border-bottom:1px solid #E3D5C5;padding-bottom:6px}
      .sub{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9C826E;margin-bottom:32px}
      .stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:32px}
      .stat{background:#FAF6F1;border-radius:8px;padding:14px;border:1px solid #E3D5C5}
      .stat-val{font-size:28px;color:#1E1410;font-weight:300}
      .stat-lbl{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#9C826E;margin-top:4px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#FAF6F1;padding:10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9C826E;border-bottom:2px solid #E3D5C5}
      td{padding:10px;border-bottom:1px solid #F2EBE0}
      .total-row{font-weight:700;background:#FAF6F1}
      .paid{color:#27AE60} .awaiting{color:#D68910} .danger{color:#C0392B}
      .footer{margin-top:48px;text-align:center;font-size:11px;color:#C4A98E;letter-spacing:2px}
    </style>
    </head><body>
    <h1>SELAH</h1>
    <div class="sub">Salon Booking · Business Report</div>
    <p style="font-size:13px;color:#9C826E;margin-bottom:24px">Business: <strong>${business?.name||'My Salon'}</strong> · Generated: ${new Date().toLocaleDateString('en-ZA')}</p>

    <div class="stats">
      <div class="stat"><div class="stat-val">R${totalRevenue.toLocaleString()}</div><div class="stat-lbl">Total Revenue</div></div>
      <div class="stat"><div class="stat-val" style="color:${netProfit>=0?'#27AE60':'#C0392B'}">R${netProfit.toLocaleString()}</div><div class="stat-lbl">Net Profit</div></div>
      <div class="stat"><div class="stat-val">R${totalTips.toLocaleString()}</div><div class="stat-lbl">Tips Earned</div></div>
    </div>

    <h2>Sales</h2>
    <table>
      <tr><th>Date</th><th>Client</th><th>Services</th><th>Total</th><th>Payment</th><th>Status</th></tr>
      ${sales.map(s=>`<tr><td>${s.date}</td><td>${s.clientName}</td><td>${s.items?.map(i=>i.name).join(', ')||'-'}</td><td>R${(s.total+(s.tip||0)).toLocaleString()}</td><td>${s.payment}</td><td class="${s.status==='paid'?'paid':'awaiting'}">${s.status==='paid'?'Paid':'EFT Due'}</td></tr>`).join('')}
      <tr class="total-row"><td colspan="3"><strong>Total</strong></td><td colspan="3"><strong>R${totalRevenue.toLocaleString()}</strong></td></tr>
    </table>

    <h2>Expenses</h2>
    <table>
      <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>
      ${expenses.map(e=>`<tr><td>${e.date}</td><td>${e.category}</td><td>${e.description}</td><td class="danger">R${e.amount.toLocaleString()}</td></tr>`).join('')}
      <tr class="total-row"><td colspan="3"><strong>Total Expenses</strong></td><td class="danger"><strong>R${totalExpenses.toLocaleString()}</strong></td></tr>
    </table>

    <div class="footer">SELAH SALON BOOKING · CONFIDENTIAL BUSINESS REPORT</div>
    </body></html>
  `
  const blob = new Blob([html],{type:'text/html'})
  const url = URL.createObjectURL(blob)
  const w = window.open(url,'_blank')
  setTimeout(()=>{ w?.print() },500)
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const { sales, expenses, clients, appointments, totalRevenue, outstandingEFT, totalTips, netProfit, totalExpenses, business } = useApp()
  const [period, setPeriod] = useState('month')

  const cashRev  = sales.filter(s=>s.payment==='Cash'&&s.status==='paid').reduce((s,x)=>s+x.total+(x.tip||0),0)
  const cardRev  = sales.filter(s=>s.payment==='Card'&&s.status==='paid').reduce((s,x)=>s+x.total+(x.tip||0),0)
  const eftRev   = sales.filter(s=>s.payment==='EFT'&&s.status==='paid').reduce((s,x)=>s+x.total+(x.tip||0),0)
  const totalDisc= sales.reduce((s,x)=>s+(x.discount||0),0)
  const avgSale  = sales.length>0?Math.round(totalRevenue/sales.length):0
  const newClients=clients.filter(c=>c.joinDate>='2026-06-01').length
  const payMethods=[
    { label:'Cash',     amount:cashRev,        color:'#27AE60' },
    { label:'Card',     amount:cardRev,        color:'#2980B9' },
    { label:'EFT Paid', amount:eftRev,         color:'#8E44AD' },
    { label:'EFT Due',  amount:outstandingEFT, color:'#D68910' },
  ].filter(p=>p.amount>0)
  const maxPay = Math.max(...payMethods.map(p=>p.amount),1)
  const expByCategory = expenses.reduce((acc,e)=>{ acc[e.category]=(acc[e.category]||0)+e.amount; return acc },{})

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-subtitle">Revenue & analytics</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary btn-sm" onClick={()=>exportCSV(sales,expenses)} title="Export CSV">
            <Download size={14}/> CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={()=>exportPDF(sales,expenses,business,totalRevenue,netProfit,totalExpenses,totalTips)} title="Export PDF">
            <FileText size={14}/> PDF
          </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, padding:'14px 20px 0' }}>
        {[['today','Today'],['week','This Week'],['month','This Month']].map(([v,l])=>(
          <button key={v} onClick={()=>setPeriod(v)} style={{ flex:1, padding:'9px 6px', borderRadius:'var(--r-sm)', border:'1.5px solid', borderColor:period===v?'var(--gold)':'var(--blush-dark)', background:period===v?'rgba(201,169,110,0.1)':'var(--white)', color:period===v?'var(--gold-dark)':'var(--text-light)', fontWeight:700, fontSize:12, cursor:'pointer', letterSpacing:'0.04em' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding:'14px 20px 0' }}>
        <div className="card card-gold" style={{ padding:'20px' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>Total Revenue</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:40, color:'white', lineHeight:1.1, marginTop:6 }}>R{totalRevenue.toLocaleString()}</div>
          <div style={{ display:'flex', gap:16, marginTop:14 }}>
            {[['Net Profit',`R${netProfit.toLocaleString()}`,netProfit>=0?'#90EE90':'#FFB3B3'],['Tips',`R${totalTips.toLocaleString()}`,'white'],['Avg Sale',`R${avgSale}`,'white']].map(([l,v,c])=>(
              <div key={l}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>{l}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:20, color:c, marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {outstandingEFT>0&&<div className="alert-banner alert-warning mt-12"><AlertCircle size={15}/> R{outstandingEFT.toLocaleString()} outstanding EFT — follow up manually</div>}

      <div className="section-label">Key Metrics</div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-val">{appointments.filter(a=>a.status!=='cancelled').length}</div><div className="stat-lbl">Appointments</div></div>
        <div className="stat-card"><div className="stat-val">{clients.length}</div><div className="stat-lbl">Total Clients</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color:'var(--success)' }}>{newClients}</div><div className="stat-lbl">New Clients</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color:'var(--success)' }}>R{totalDisc}</div><div className="stat-lbl">Discounts Given</div></div>
      </div>

      <div className="section-label">Revenue by Payment</div>
      <div style={{ padding:'0 20px' }}>
        <div className="card card-pad">
          {payMethods.map(p=>(
            <div key={p.label} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-mid)' }}>{p.label}</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:18 }}>R{p.amount.toLocaleString()}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:`${(p.amount/maxPay)*100}%`, background:p.color }}/></div>
            </div>
          ))}
          {payMethods.length===0&&<div style={{ color:'var(--text-light)', fontSize:14, textAlign:'center', padding:'16px 0' }}>No sales yet</div>}
        </div>
      </div>

      <div className="section-label">Expenses</div>
      <div style={{ padding:'0 20px' }}>
        <div className="card card-pad">
          {Object.entries(expByCategory).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
            <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--blush)' }}>
              <span style={{ fontSize:13, color:'var(--text-mid)', fontWeight:500 }}>{cat}</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:17, color:'var(--danger)' }}>R{amt.toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(expByCategory).length===0&&<div style={{ color:'var(--text-light)', fontSize:14, textAlign:'center', padding:'16px 0' }}>No expenses recorded</div>}
          {Object.keys(expByCategory).length>0&&(
            <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, fontWeight:700 }}>
              <span>Total Expenses</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--danger)' }}>R{totalExpenses.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="section-label">Recent Sales</div>
      <div style={{ background:'var(--white)', margin:'0 20px', borderRadius:'var(--r-md)', border:'1px solid var(--blush-dark)', overflow:'hidden' }}>
        {sales.length===0&&<div style={{ padding:'24px', textAlign:'center', color:'var(--text-light)', fontSize:14 }}>No sales yet</div>}
        {sales.slice().reverse().map(sale=>(
          <div key={sale.id} style={{ padding:'13px 16px', borderBottom:'1px solid var(--blush)', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600 }}>{sale.clientName}</div>
              <div style={{ fontSize:12, color:'var(--text-light)', marginTop:1 }}>{sale.date} · {sale.payment}</div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18 }}>R{(sale.total+(sale.tip||0)).toLocaleString()}</div>
              <span className={`badge ${sale.status==='paid'?'badge-green':'badge-orange'}`} style={{ fontSize:10 }}>{sale.status==='paid'?'Paid':'EFT Due'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="spacer-24"/>
    </div>
  )
}
