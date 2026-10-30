export const TIPOS = ['Boda', 'Social', 'Laboral', 'Cumpleaños', 'Otro']

/** Los eventos creados antes del cambio guardaron «Corporativo»; hoy se muestra y se guarda como «Laboral». */
export const normalizarTipo = (tipo) => (tipo === 'Corporativo' ? 'Laboral' : tipo)
