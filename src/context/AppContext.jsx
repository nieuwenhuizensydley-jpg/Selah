import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)
const TODAY = new Date().toISOString().split('T')[0]

const VALID_CODES = {
  'SELAH-LIFETIME': { plan: 'premium', type: 'lifetime', label: 'Lifetime Premium' },
  'SELAH-BETA':     { plan: 'premium', type: 'beta',     label: 'Beta Tester Access' },
  'SELAH-PRO2026':  { plan: 'pro',     type: 'promo',    label: 'Promotional Pro' },
}

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [business, setBusiness]       = useState(null)
  const [businessId, setBusinessId]   = useState(null)
  const [toastMsg, setToastMsg]       = useState(null)
  const [loading, setLoading]         = useState(true)
  const [subscription, setSubscription] = useState({ plan: 'premium', code: 'SELAH-LIFETIME', type: 'lifetime', label: 'Lifetime Premium' })

  // ── Working hours (local only for now) ──
  const [workingHours, setWorkingHours] = useState({
    mon: { open: true,  start: '08:00', end: '18:00' },
    tue: { open: true,  start: '08:00', end: '18:00' },
    wed: { open: true,  start: '08:00', end: '18:00' },
    thu: { open: true,  start: '08:00', end: '18:00' },
    fri: { open: true,  start: '08:00', end: '17:00' },
    sat: { open: true,  start: '09:00', end: '14:00' },
    sun: { open: false, start: '09:00', end: '13:00' },
  })
  const [lunchBreak, setLunchBreak]     = useState({ enabled: true, start: '13:00', end: '14:00' })
  const [blockedSlots, setBlockedSlots] = useState([])

  // ── Data state ──
  const [clients,      setClients]      = useState([])
  const [appointments, setAppointments] = useState([])
  const [services,     setServices]     = useState([])
  const [inventory,    setInventory]    = useState([])
  const [expenses,     setExpenses]     = useState([])
  const [sales,        setSales]        = useState([])
  const [staff,        setStaff]        = useState([])
  const [notes,        setNotes]        = useState([])
  const [cashUps,      setCashUps]      = useState([])

  function showToast(msg) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2800) }

  // ── Auth listener ──
  useEffect(() => {
    // First check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadBusiness(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        loadBusiness(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setBusiness(null)
        setBusinessId(null)
        setLoading(false)
        clearAllData()
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      }
    })

    return () => authSub.unsubscribe()
  }, [])

  function clearAllData() {
    setClients([]); setAppointments([]); setServices([])
    setInventory([]); setExpenses([]); setSales([])
    setStaff([]); setNotes([]); setCashUps([])
  }

  async function loadBusiness(userId) {
    try {
      // Try up to 3 times with delay (handles race condition after register)
      let data = null
      for (let i = 0; i < 3; i++) {
        const result = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', userId)
          .single()

        if (result.data) { data = result.data; break }
        if (i < 2) await new Promise(r => setTimeout(r, 1000))
      }

      if (data) {
        setBusiness({
          name: data.name,
          phone: data.phone || '',
          address: data.address || '',
          vatNo: data.vat_no || '',
          logo: data.logo_url || null,
          salonType: data.salon_type || 'both',
          theme: data.theme || 'gold',
          setupComplete: data.setup_complete || false,
          socialLinks: data.social_links || { instagram: '', facebook: '', tiktok: '' },
          currency: data.currency || 'R',
        })
        setBusinessId(data.id)
        await loadAllData(data.id)
      } else {
        // No business found - new user needs setup
        setLoading(false)
      }
    } catch (err) {
      console.error('Load business error:', err)
      setLoading(false)
    }
  }

  async function loadAllData(bizId) {
    try {
      const [
        { data: clientsData },
        { data: aptsData },
        { data: servicesData },
        { data: inventoryData },
        { data: salesData },
        { data: expensesData },
        { data: staffData },
        { data: notesData },
        { data: cashUpsData },
      ] = await Promise.all([
        supabase.from('clients').select('*').eq('business_id', bizId).order('created_at'),
        supabase.from('appointments').select('*').eq('business_id', bizId).order('date'),
        supabase.from('services').select('*').eq('business_id', bizId).order('created_at'),
        supabase.from('inventory').select('*').eq('business_id', bizId).order('created_at'),
        supabase.from('sales').select('*').eq('business_id', bizId).order('created_at'),
        supabase.from('expenses').select('*').eq('business_id', bizId).order('created_at'),
        supabase.from('staff').select('*').eq('business_id', bizId).order('created_at'),
        supabase.from('notes').select('*').eq('business_id', bizId).order('created_at'),
        supabase.from('cash_ups').select('*').eq('business_id', bizId).order('created_at'),
      ])

      if (clientsData) setClients(clientsData.map(dbToClient))
      if (aptsData) setAppointments(aptsData.map(dbToApt))
      if (servicesData) setServices(servicesData.map(dbToService))
      if (inventoryData) setInventory(inventoryData)
      if (salesData) setSales(salesData.map(dbToSale))
      if (expensesData) setExpenses(expensesData)
      if (staffData) setStaff(staffData.map(dbToStaff))
      if (notesData) setNotes(notesData.map(dbToNote))
      if (cashUpsData) setCashUps(cashUpsData.map(dbToCashUp))
    } catch (err) {
      console.error('Load data error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── DB mappers ──
  function dbToClient(r) {
    return { id: r.id, name: r.name, surname: r.surname, mobile: r.mobile, email: r.email, dob: r.dob, address: r.address, flags: r.flags || [], alerts: r.alerts || [], notes: r.notes || [], hairRecords: r.hair_records || [], beautyRecords: r.beauty_records || [], photos: r.photos || [], balance: r.balance || 0, referredBy: r.referred_by || '', joinDate: r.join_date || TODAY }
  }
  function dbToApt(r) {
    return { id: r.id, clientId: r.client_id, clientName: r.client_name, service: r.service, addons: r.addons || [], date: r.date, time: r.time, duration: r.duration, price: r.price, status: r.status, staff: r.staff, notes: r.notes }
  }
  function dbToService(r) {
    return { id: r.id, name: r.name, category: r.category, duration: r.duration, price: r.price, buffer: r.buffer, addons: r.addons || [] }
  }
  function dbToSale(r) {
    return { id: r.id, clientName: r.client_name, items: r.items || [], extras: r.extras || [], subtotal: r.subtotal, discount: r.discount, tip: r.tip, total: r.total, payment: r.payment, status: r.status, paidAmount: r.paid_amount, remaining: r.remaining, date: r.date }
  }
  function dbToStaff(r) {
    return { id: r.id, name: r.name, role: r.role, commissionRate: r.commission_rate, email: r.email, mobile: r.mobile, active: r.active }
  }
  function dbToNote(r) {
    return { id: r.id, text: r.text, done: r.done, pinned: r.pinned, dueDate: r.due_date || '', date: r.date }
  }
  function dbToCashUp(r) {
    return { id: r.id, cashCounted: r.cash_counted, cashExpected: r.cash_expected, cardTotal: r.card_total, eftTotal: r.eft_total, tips: r.tips, totalRevenue: r.total_revenue, notes: r.notes, closedBy: r.closed_by, date: r.date }
  }

  // ── Auth ──
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, message: error.message }
    return { success: true }
  }

  async function register(email, password, bizName, ownerName, salonType) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { success: false, message: error.message }

      const userId = data.user?.id
      if (!userId) return { success: false, message: 'Signup failed — please try again.' }

      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Get fresh session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return { success: false, message: 'Session not established — please log in.' }

      // Create business record
      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .insert({
          owner_id: userId,
          name: bizName || 'My Salon',
          salon_type: salonType || 'both',
          setup_complete: false,
        })
        .select()
        .single()

      if (bizErr) {
        console.error('Business creation error:', bizErr)
        return { success: false, message: `Could not create business: ${bizErr.message}` }
      }

      // Seed default services
      const defaultServices = [
        { business_id: biz.id, name: 'Full Set Gel Nails',  category: 'Nails',       duration: 90,  price: 450,  buffer: 15, addons: [{id:1,name:'Tips',price:30,duration:10},{id:2,name:'Glitter',price:30,duration:5},{id:3,name:'Nail Art',price:50,duration:15},{id:4,name:'Chrome',price:40,duration:10}] },
        { business_id: biz.id, name: 'Gel Infill',          category: 'Nails',       duration: 60,  price: 320,  buffer: 10, addons: [] },
        { business_id: biz.id, name: 'Root Retouch',        category: 'Hair Colour', duration: 120, price: 650,  buffer: 15, addons: [] },
        { business_id: biz.id, name: 'Eyebrow Wax & Tint', category: 'Brows',       duration: 45,  price: 180,  buffer: 5,  addons: [] },
        { business_id: biz.id, name: 'Lash Lift & Tint',   category: 'Lashes',      duration: 60,  price: 350,  buffer: 10, addons: [] },
        { business_id: biz.id, name: 'Pedicure',           category: 'Nails',       duration: 60,  price: 280,  buffer: 10, addons: [] },
      ]
      await supabase.from('services').insert(defaultServices)
      await supabase.from('staff').insert([{
        business_id: biz.id, name: ownerName || 'Owner',
        role: 'Owner', commission_rate: 0, active: true
      }])

      return { success: true }
    } catch (err) {
      console.error('Register error:', err)
      return { success: false, message: 'Registration failed. Please try again.' }
    }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  // ── Update business ──
  async function updateBusiness(updates) {
    if (!businessId) return
    const dbUpdates = {
      name: updates.name,
      phone: updates.phone,
      address: updates.address,
      vat_no: updates.vatNo,
      logo_url: updates.logo,
      salon_type: updates.salonType,
      theme: updates.theme,
      setup_complete: updates.setupComplete,
      social_links: updates.socialLinks,
    }
    const { error } = await supabase.from('businesses').update(dbUpdates).eq('id', businessId)
    if (!error) setBusiness(b => ({ ...b, ...updates }))
  }

  // Wrapper for setBusiness that also saves to DB
  function setBizLocal(updater) {
    setBusiness(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (businessId && next) {
        supabase.from('businesses').update({
          name: next.name,
          phone: next.phone,
          address: next.address,
          vat_no: next.vatNo,
          logo_url: next.logo,
          salon_type: next.salonType,
          theme: next.theme,
          setup_complete: next.setupComplete,
          social_links: next.socialLinks,
        }).eq('id', businessId).then(() => {})
      }
      return next
    })
  }

  // ── Subscription ──
  function redeemCode(code) {
    const match = VALID_CODES[code.trim().toUpperCase()]
    if (!match) return { success: false, message: 'Invalid code. Please check and try again.' }
    setSubscription({ plan: match.plan, code: code.trim().toUpperCase(), type: match.type, label: match.label })
    return { success: true, message: `✓ ${match.label} activated!` }
  }
  const features = {
    clients: true, calendar: true, pos: true,
    inventory: subscription.plan === 'pro' || subscription.plan === 'premium',
    expenses:  subscription.plan === 'pro' || subscription.plan === 'premium',
    reports:   subscription.plan === 'pro' || subscription.plan === 'premium',
    staff:     subscription.plan === 'pro' || subscription.plan === 'premium',
    branding:  subscription.plan === 'premium',
    export:    subscription.plan === 'premium',
    cashup:    subscription.plan === 'pro' || subscription.plan === 'premium',
  }

  // ── Blocked slots ──
  function addBlockedSlot(slot)  { setBlockedSlots(p => [...p, { ...slot, id: Date.now() }]) }
  function removeBlockedSlot(id) { setBlockedSlots(p => p.filter(s => s.id !== id)) }

  // ── Client actions ──
  async function addClient(data) {
    const { data: row, error } = await supabase.from('clients').insert({
      business_id: businessId,
      name: data.name, surname: data.surname, mobile: data.mobile,
      email: data.email, dob: data.dob, address: data.address,
      flags: [], alerts: [], notes: [], hair_records: [], beauty_records: [], photos: [],
      balance: 0, join_date: TODAY,
    }).select().single()
    if (row) { setClients(p => [...p, dbToClient(row)]); return dbToClient(row) }
  }

  async function updateClient(id, updates) {
    const dbUpdates = {}
    if (updates.flags !== undefined)        dbUpdates.flags = updates.flags
    if (updates.alerts !== undefined)       dbUpdates.alerts = updates.alerts
    if (updates.notes !== undefined)        dbUpdates.notes = updates.notes
    if (updates.hairRecords !== undefined)  dbUpdates.hair_records = updates.hairRecords
    if (updates.beautyRecords !== undefined) dbUpdates.beauty_records = updates.beautyRecords
    if (updates.photos !== undefined)       dbUpdates.photos = updates.photos
    if (updates.balance !== undefined)      dbUpdates.balance = updates.balance
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('clients').update(dbUpdates).eq('id', id)
    }
    setClients(p => p.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  async function addClientNote(clientId, text) {
    const client = clients.find(c => c.id === clientId)
    const newNote = { id: Date.now(), text, date: TODAY, staff: 'Owner', edited: false }
    const updatedNotes = [...(client?.notes || []), newNote]
    await supabase.from('clients').update({ notes: updatedNotes }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, notes: updatedNotes } : c))
  }

  async function editClientNote(clientId, noteId, newText) {
    const client = clients.find(c => c.id === clientId)
    const updatedNotes = client.notes.map(n => n.id === noteId ? { ...n, text: newText, edited: true } : n)
    await supabase.from('clients').update({ notes: updatedNotes }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, notes: updatedNotes } : c))
  }

  async function deleteClientNote(clientId, noteId) {
    const client = clients.find(c => c.id === clientId)
    const updatedNotes = client.notes.filter(n => n.id !== noteId)
    await supabase.from('clients').update({ notes: updatedNotes }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, notes: updatedNotes } : c))
  }

  async function addHairRecord(clientId, record) {
    const client = clients.find(c => c.id === clientId)
    const updated = [...(client?.hairRecords || []), { ...record, id: Date.now() }]
    await supabase.from('clients').update({ hair_records: updated }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, hairRecords: updated } : c))
  }

  async function addBeautyRecord(clientId, record) {
    const client = clients.find(c => c.id === clientId)
    const updated = [...(client?.beautyRecords || []), { ...record, id: Date.now() }]
    await supabase.from('clients').update({ beauty_records: updated }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, beautyRecords: updated } : c))
  }

  async function addClientAlert(clientId, alert) {
    const client = clients.find(c => c.id === clientId)
    const updated = [...(client?.alerts || []), { ...alert, id: Date.now() }]
    await supabase.from('clients').update({ alerts: updated }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, alerts: updated } : c))
  }

  async function removeClientAlert(clientId, alertId) {
    const client = clients.find(c => c.id === clientId)
    const updated = client.alerts.filter(a => a.id !== alertId)
    await supabase.from('clients').update({ alerts: updated }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, alerts: updated } : c))
  }

  async function addClientFlag(clientId, flag) {
    const client = clients.find(c => c.id === clientId)
    if (client?.flags?.includes(flag)) return
    const updated = [...(client?.flags || []), flag]
    await supabase.from('clients').update({ flags: updated }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, flags: updated } : c))
  }

  async function removeClientFlag(clientId, flag) {
    const client = clients.find(c => c.id === clientId)
    const updated = client.flags.filter(f => f !== flag)
    await supabase.from('clients').update({ flags: updated }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, flags: updated } : c))
  }

  async function markBalancePaid(clientId) {
    await supabase.from('clients').update({ balance: 0, flags: [], alerts: [] }).eq('id', clientId)
    setClients(p => p.map(c => c.id === clientId ? { ...c, balance: 0, flags: c.flags.filter(f => f !== 'Owes Money'), alerts: [] } : c))
    showToast('Balance marked as paid ✓')
  }

  // ── Appointment actions ──
  async function addAppointment(apt) {
    const { data: row } = await supabase.from('appointments').insert({
      business_id: businessId,
      client_id: apt.clientId, client_name: apt.clientName,
      service: apt.service, addons: apt.addons || [],
      date: apt.date, time: apt.time, duration: apt.duration,
      price: apt.price, status: 'confirmed', staff: apt.staff || 'Owner', notes: apt.notes || '',
    }).select().single()
    if (row) setAppointments(p => [...p, dbToApt(row)])
  }

  async function cancelAppointment(id) {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    setAppointments(p => p.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
  }

  async function updateAppointment(id, updates) {
    await supabase.from('appointments').update(updates).eq('id', id)
    setAppointments(p => p.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  // ── Service actions ──
  async function addService(svc) {
    const { data: row } = await supabase.from('services').insert({
      business_id: businessId,
      name: svc.name, category: svc.category,
      duration: svc.duration, price: svc.price,
      buffer: svc.buffer || 10, addons: svc.addons || [],
    }).select().single()
    if (row) setServices(p => [...p, dbToService(row)])
  }

  async function deleteService(id) {
    await supabase.from('services').delete().eq('id', id)
    setServices(p => p.filter(s => s.id !== id))
  }

  // ── Inventory ──
  async function addInventoryItem(item) {
    const { data: row } = await supabase.from('inventory').insert({ business_id: businessId, ...item }).select().single()
    if (row) setInventory(p => [...p, row])
  }

  async function adjustStock(id, delta) {
    const item = inventory.find(i => i.id === id)
    const newStock = Math.max(0, (item?.stock || 0) + delta)
    await supabase.from('inventory').update({ stock: newStock }).eq('id', id)
    setInventory(p => p.map(i => i.id === id ? { ...i, stock: newStock } : i))
  }

  async function updateInventoryItem(id, updates) {
    await supabase.from('inventory').update(updates).eq('id', id)
    setInventory(p => p.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  // ── Sales ──
  async function addSale(sale) {
    const { data: row } = await supabase.from('sales').insert({
      business_id: businessId,
      client_name: sale.clientName, items: sale.items, extras: sale.extras,
      subtotal: sale.subtotal, discount: sale.discount, tip: sale.tip,
      total: sale.total, payment: sale.payment, status: sale.status,
      date: TODAY,
    }).select().single()
    if (row) setSales(p => [...p, dbToSale(row)])
  }

  async function markSalePaid(id) {
    await supabase.from('sales').update({ status: 'paid' }).eq('id', id)
    setSales(p => p.map(s => s.id === id ? { ...s, status: 'paid' } : s))
  }

  async function markSalePartial(id, paidAmount) {
    const sale = sales.find(s => s.id === id)
    const remaining = (sale?.total || 0) - paidAmount
    await supabase.from('sales').update({ status: 'partial_eft', paid_amount: paidAmount, remaining }).eq('id', id)
    setSales(p => p.map(s => s.id === id ? { ...s, status: 'partial_eft', paidAmount, remaining } : s))
  }

  // ── Expenses ──
  async function addExpense(exp) {
    const { data: row } = await supabase.from('expenses').insert({ business_id: businessId, ...exp, date: TODAY }).select().single()
    if (row) setExpenses(p => [...p, row])
  }

  async function deleteExpense(id) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(p => p.filter(e => e.id !== id))
  }

  // ── Staff ──
  async function addStaffMember(m) {
    const { data: row } = await supabase.from('staff').insert({ business_id: businessId, name: m.name, role: m.role, commission_rate: m.commissionRate || 0, email: m.email, mobile: m.mobile, active: true }).select().single()
    if (row) setStaff(p => [...p, dbToStaff(row)])
  }

  async function updateStaff(id, updates) {
    const dbUp = {}
    if (updates.active !== undefined) dbUp.active = updates.active
    if (updates.commissionRate !== undefined) dbUp.commission_rate = updates.commissionRate
    await supabase.from('staff').update(dbUp).eq('id', id)
    setStaff(p => p.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  // ── Notes ──
  async function addNote(text, dueDate) {
    const { data: row } = await supabase.from('notes').insert({ business_id: businessId, text, done: false, pinned: false, due_date: dueDate || '', date: TODAY }).select().single()
    if (row) setNotes(p => [...p, dbToNote(row)])
  }

  async function toggleNote(id) {
    const note = notes.find(n => n.id === id)
    await supabase.from('notes').update({ done: !note?.done }).eq('id', id)
    setNotes(p => p.map(n => n.id === id ? { ...n, done: !n.done } : n))
  }

  async function pinNote(id) {
    const note = notes.find(n => n.id === id)
    await supabase.from('notes').update({ pinned: !note?.pinned }).eq('id', id)
    setNotes(p => p.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(p => p.filter(n => n.id !== id))
  }

  // ── Cash-up ──
  async function addCashUp(cu) {
    const { data: row } = await supabase.from('cash_ups').insert({
      business_id: businessId,
      cash_counted: cu.cashCounted, cash_expected: cu.cashExpected,
      card_total: cu.cardTotal, eft_total: cu.eftTotal,
      tips: cu.tips, total_revenue: cu.totalRevenue,
      notes: cu.notes, closed_by: cu.closedBy, date: TODAY,
    }).select().single()
    if (row) setCashUps(p => [...p, dbToCashUp(row)])
  }

  // ── Computed ──
  const paidSales      = sales.filter(s => s.status === 'paid')
  const totalRevenue   = paidSales.reduce((s,x) => s + (x.total||0) + (x.tip||0), 0)
  const monthRevenue   = totalRevenue
  const outstandingEFT = sales.filter(s => s.status === 'awaiting_eft' || s.status === 'partial_eft').reduce((s,x) => s + (x.remaining||x.total||0), 0)
  const totalTips      = sales.reduce((s,x) => s + (x.tip||0), 0)
  const totalExpenses  = expenses.reduce((s,e) => s + (e.amount||0), 0)
  const netProfit      = totalRevenue - totalExpenses
  const todaySales     = sales.filter(s => s.date === TODAY)
  const todayRevenue   = todaySales.reduce((s,x) => s + (x.total||0) + (x.tip||0), 0)
  const lowStock       = inventory.filter(i => i.stock <= i.min_stock)

  return (
    <Ctx.Provider value={{
      user, business, setBusiness: setBizLocal, loading,
      businessId, login, register, logout,
      subscription, setSubscription, redeemCode, features,
      workingHours, setWorkingHours, lunchBreak, setLunchBreak,
      blockedSlots, addBlockedSlot, removeBlockedSlot,
      clients, setClients, addClient, updateClient,
      addClientNote, editClientNote, deleteClientNote,
      addHairRecord, addBeautyRecord,
      addClientAlert, removeClientAlert, addClientFlag, removeClientFlag, markBalancePaid,
      appointments, setAppointments, addAppointment, cancelAppointment, updateAppointment,
      services, setServices, addService, deleteService,
      inventory, setInventory, addInventoryItem, adjustStock, updateInventoryItem,
      expenses, setExpenses, addExpense, deleteExpense,
      sales, setSales, addSale, markSalePaid, markSalePartial,
      staff, setStaff, addStaffMember, updateStaff,
      notes, setNotes, addNote, toggleNote, pinNote, deleteNote,
      cashUps, setCashUps, addCashUp,
      toast: toastMsg, showToast,
      totalRevenue, monthRevenue, outstandingEFT, totalTips,
      totalExpenses, netProfit, todayRevenue, todaySales, lowStock,
      TODAY,
    }}>
      {children}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
