import { useEffect } from 'react'

const APP = 'Organizador de Eventos'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP}` : APP
  }, [title])
}
