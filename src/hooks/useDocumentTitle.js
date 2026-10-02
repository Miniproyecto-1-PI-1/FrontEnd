import { useEffect } from 'react'

const APP = 'Agendo'

/** Título de la pestaña: "Eventos · Agendo"; sin título, el nombre completo de la app. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP}` : `${APP} — Organizador de eventos`
  }, [title])
}
