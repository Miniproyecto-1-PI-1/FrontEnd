import { addDays, hoyISO } from '../utils/date'

const sub = (id, nombre, plazo, horas, horaInicio, horaFin, estado, extra = {}) => ({
  id, nombre, plazo, horas, horaInicio, horaFin, estado, ...extra,
})

export function getMockData(perfil) {
  const hoy = hoyISO()

  if (perfil === 'bar') {
    return {
      clientes: [
        { id: 1, nombre: 'Licorera La Cava', telefono: '310 555 1212', correo: 'pedidos@lacava.co' },
        { id: 2, nombre: 'Sonido Bass Pro', telefono: '601 555 3434', correo: 'contacto@basspro.co' },
        { id: 3, nombre: 'Seguridad Vigilar S.A.S', telefono: '320 555 5656', correo: 'servicio@vigilar.co' },
      ],
      eventos: [
        {
          id: 1, nombre: 'Fiesta de Halloween', tipo: 'Social', clienteId: 2, fecha: addDays(12), hora: '21:00',
          lugar: 'La Terraza Bar - Salón principal',
          subtareas: [
            sub(11, 'Contratar DJ temático', addDays(-1), 3, '09:00', '12:00', 'PENDIENTE'),
            sub(12, 'Pedido de licor especial', hoy, 2, '10:00', '12:00', 'PENDIENTE'),
            sub(13, 'Decorar el local', addDays(2), 3, '14:00', '17:00', 'PENDIENTE'),
            sub(14, 'Reforzar personal de barra', addDays(4), 1, '18:00', '19:00', 'EJECUTADA'),
            sub(15, 'Confirmar seguridad extra', addDays(-4), 1.5, '15:00', '16:30', 'EJECUTADA'),
          ],
        },
        {
          id: 2, nombre: 'Booking evento corporativo Bancolar', tipo: 'Corporativo', clienteId: 3, fecha: addDays(20), hora: '19:00',
          lugar: 'La Terraza Bar - Salón privado',
          subtareas: [
            sub(21, 'Confirmar aforo y horario extendido', hoy, 2, '13:00', '15:00', 'PENDIENTE'),
            sub(22, 'Cotizar catering corporativo', addDays(3), 2.5, '09:00', '11:30', 'PENDIENTE'),
            sub(23, 'Diseñar menú de coctelería', addDays(3), 1, '16:00', '17:00', 'POSPUESTA'),
          ],
        },
        {
          id: 3, nombre: 'Noche de Trivia + Karaoke', tipo: 'Social', clienteId: 1, fecha: addDays(6), hora: '20:00',
          lugar: 'La Terraza Bar - Salón principal',
          subtareas: [
            sub(31, 'Confirmar equipo de karaoke', addDays(1), 1, '10:00', '11:00', 'EJECUTADA'),
            sub(32, 'Reabastecer barra para la noche', addDays(1), 2, '11:00', '13:00', 'EJECUTADA'),
          ],
        },
      ],
    }
  }

  return {
    clientes: [
      { id: 1, nombre: 'Camila Ríos', telefono: '310 555 0101', correo: 'camila.rios@mail.com' },
      { id: 2, nombre: 'Nexa S.A.S', telefono: '601 555 0202', correo: 'contacto@nexa.co' },
      { id: 3, nombre: 'Familia Gómez', telefono: '320 555 0303', correo: 'gomez.familia@mail.com' },
    ],
    eventos: [
      {
        id: 1, nombre: 'Boda Camila & Andrés', tipo: 'Boda', clienteId: 1, fecha: addDays(30), hora: '16:00',
        lugar: 'Hacienda El Roble, km 4 vía Cali-Jamundí',
        subtareas: [
          sub(11, 'Reservar salón', addDays(-2), 4, '09:00', '13:00', 'PENDIENTE'),
          sub(12, 'Confirmar catering', hoy, 3, '09:00', '12:00', 'PENDIENTE'),
          sub(13, 'Enviar invitaciones', addDays(1), 2, '14:00', '16:00', 'PENDIENTE'),
          sub(14, 'Coordinar flores', addDays(5), 2, '10:00', '12:00', 'EJECUTADA'),
          sub(15, 'Contratar DJ', addDays(-5), 1.5, '15:00', '16:30', 'EJECUTADA'),
        ],
      },
      {
        id: 2, nombre: 'Lanzamiento Corporativo Nexa', tipo: 'Corporativo', clienteId: 2, fecha: addDays(18), hora: '09:00',
        lugar: 'Centro de Convenciones Valle del Pacífico',
        subtareas: [
          sub(21, 'Buscar proveedor de audio', hoy, 2.5, '13:00', '15:30', 'PENDIENTE'),
          sub(22, 'Reservar salón principal', addDays(3), 3, '09:00', '12:00', 'PENDIENTE'),
          sub(23, 'Diseñar backdrop', addDays(3), 1, '16:00', '17:00', 'POSPUESTA'),
        ],
      },
      {
        id: 3, nombre: 'Cumpleaños 15 años Sofía', tipo: 'Cumpleaños', clienteId: 3, fecha: addDays(45), hora: '19:00',
        lugar: 'Club Campestre Cali',
        subtareas: [
          sub(31, 'Confirmar torta', addDays(7), 1, '10:00', '11:00', 'EJECUTADA'),
          sub(32, 'Reservar decoración', addDays(7), 2, '11:00', '13:00', 'EJECUTADA'),
        ],
      },
    ],
  }
}
