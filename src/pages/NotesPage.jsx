import { useState } from 'react'
import { Plus, Pin, Check, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function NotesPage() {
  const { notes, addNote, toggleNote, pinNote, deleteNote, showToast } = useApp()
  const [showInput, setShowInput] = useState(false)
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')

  function handleAdd() {
    if (!text.trim()) return
    addNote(text.trim(), dueDate)
    setText(''); setDueDate(''); setShowInput(false)
    showToast('Note added ✓')
  }

  const pinned = notes.filter(n => n.pinned && !n.done)
  const active = notes.filter(n => !n.pinned && !n.done)
  const done = notes.filter(n => n.done)

  return (
    <div>
      <div className="page-header-simple">
        <div>
          <div className="page-title">Notes & Tasks</div>
          <div className="page-subtitle">{notes.filter(n => !n.done).length} active</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowInput(true)}><Plus size={15} /> Add</button>
      </div>

      {showInput && (
        <div style={{ padding: '14px 20px 0' }}>
          <div className="card card-pad">
            <textarea className="form-input" rows={3} placeholder="e.g. Buy Wella Colour 1.0 x5 from Salon Depot..." value={text} onChange={e => setText(e.target.value)} autoFocus style={{ marginBottom: 10 }} />
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Due Date (optional)</label>
              <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Save</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowInput(false); setText(''); setDueDate('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {pinned.length > 0 && (
        <>
          <div className="section-label">📌 Pinned</div>
          {pinned.map(n => <NoteCard key={n.id} note={n} onToggle={toggleNote} onDelete={deleteNote} onPin={pinNote} />)}
        </>
      )}

      {active.length > 0 && (
        <>
          <div className="section-label">To Do</div>
          {active.map(n => <NoteCard key={n.id} note={n} onToggle={toggleNote} onDelete={deleteNote} onPin={pinNote} />)}
        </>
      )}

      {done.length > 0 && (
        <>
          <div className="section-label">Completed</div>
          {done.map(n => <NoteCard key={n.id} note={n} onToggle={toggleNote} onDelete={deleteNote} onPin={pinNote} />)}
        </>
      )}

      {notes.length === 0 && !showInput && (
        <div className="empty">
          <div className="empty-icon"><Pin size={26} /></div>
          <div className="empty-title">No notes yet</div>
          <div className="empty-text">Add shopping lists, to-dos, and reminders for your salon</div>
          <button className="btn btn-primary mt-16" onClick={() => setShowInput(true)}><Plus size={15} /> Add your first note</button>
        </div>
      )}

      <div className="spacer-24" />
    </div>
  )
}

function NoteCard({ note, onToggle, onDelete, onPin }) {
  const isOverdue = note.dueDate && note.dueDate < '2026-06-09' && !note.done
  return (
    <div style={{ margin: '0 20px 8px', background: note.done ? 'var(--blush-mid)' : 'var(--white)', border: `1px solid ${isOverdue ? 'rgba(192,57,43,0.3)' : 'var(--blush-dark)'}`, borderRadius: 'var(--r-md)', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: 'var(--shadow-xs)' }}>
      <button onClick={() => onToggle(note.id)} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid', borderColor: note.done ? 'var(--success)' : 'var(--blush-deeper)', background: note.done ? 'var(--success)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }}>
        {note.done && <Check size={13} color="white" strokeWidth={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, color: note.done ? 'var(--text-faint)' : 'var(--text-dark)', textDecoration: note.done ? 'line-through' : 'none', lineHeight: 1.5 }}>{note.text}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{note.date}</span>
          {note.dueDate && <span style={{ fontSize: 11, fontWeight: 700, color: isOverdue ? 'var(--danger)' : 'var(--warning)' }}>Due {note.dueDate}{isOverdue ? ' ⚠' : ''}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button onClick={() => onPin(note.id)} style={{ background: 'transparent', border: 'none', color: note.pinned ? 'var(--gold-dark)' : 'var(--text-faint)', cursor: 'pointer', padding: 4 }}><Pin size={14} /></button>
        <button onClick={() => onDelete(note.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 4 }}><Trash2 size={14} /></button>
      </div>
    </div>
  )
}
