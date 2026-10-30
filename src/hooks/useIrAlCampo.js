import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Si la URL trae `#ancla`, lleva el campo a la vista y lo enfoca cuando la sección ya está lista.
 * Así un botón de otra pantalla puede aterrizar justo en el campo que la persona quiere cambiar.
 */
export function useIrAlCampo(ancla, idCampo, listo) {
  const { hash } = useLocation()
  useEffect(() => {
    if (!listo || hash !== `#${ancla}`) return
    const campo = document.getElementById(idCampo)
    if (!campo) return
    campo.scrollIntoView({ block: 'center', behavior: 'smooth' })
    campo.focus({ preventScroll: true })
    campo.select?.()
  }, [listo, hash, ancla, idCampo])
}
