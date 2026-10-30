export const TIPOS = ['Familiar', 'Social', 'Laboral', 'Viaje', 'Otro']

// Tipos que existían antes de esta lista: los eventos ya guardados con ellos se muestran y se filtran con el tipo nuevo.
const ANTIGUOS = { Boda: 'Familiar', Cumpleaños: 'Familiar', Corporativo: 'Laboral' }
export const normalizarTipo = (tipo) => ANTIGUOS[tipo] ?? tipo
