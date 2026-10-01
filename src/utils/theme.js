const KEY = 'theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set()

function guardado() {
  try {
    const t = localStorage.getItem(KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function aplicar(theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#2a303c' : '#cfd5de')
  listeners.forEach((fn) => fn())
}

// Mientras el usuario no elija, el tema sigue al del sistema.
media.addEventListener('change', (e) => {
  if (!guardado()) aplicar(e.matches ? 'dark' : 'light')
})

export function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Sin almacenamiento el cambio dura hasta recargar.
  }
  aplicar(theme)
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
