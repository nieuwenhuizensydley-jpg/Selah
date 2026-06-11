// Theme is applied via CSS variables on :root
// This runs once on app load to restore saved theme

const THEMES = {
  gold:   { '--gold':'#C9A96E', '--gold-light':'#E2C99A', '--gold-dark':'#A0784A', '--gold-deeper':'#7A5A35' },
  rose:   { '--gold':'#D4849A', '--gold-light':'#F0B8C8', '--gold-dark':'#A85070', '--gold-deeper':'#6B2E42' },
  silver: { '--gold':'#A0AEC0', '--gold-light':'#CBD5E0', '--gold-dark':'#718096', '--gold-deeper':'#4A5568' },
  teal:   { '--gold':'#4FB3B8', '--gold-light':'#81E6D9', '--gold-dark':'#2C7A7B', '--gold-deeper':'#1D4044' },
  forest: { '--gold':'#4A8C6A', '--gold-light':'#7DC4A0', '--gold-dark':'#2E6B4A', '--gold-deeper':'#1A3A2A' },
}

export function applyTheme(id) {
  const t = THEMES[id] || THEMES.gold
  const root = document.documentElement
  Object.entries(t).forEach(([k, v]) => root.style.setProperty(k, v))
  localStorage.setItem('selah_theme', id)
}

export function initTheme() {
  const saved = localStorage.getItem('selah_theme') || 'gold'
  applyTheme(saved)
  return saved
}

export { THEMES }
