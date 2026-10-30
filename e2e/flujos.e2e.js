// Flujos T1–T4 de punta a punta contra el despliegue (o E2E_BASE_URL / E2E_API_URL).
// Cada archivo usa un usuario temporal con límite diario de 6 h y lo borra al final: la cuenta demo no se toca.
import {
  borrarEvento, borrarUsuario, crearEvento, crearUsuario, diaBogota, expect, fmtFecha, horasPorDia,
  iniciarSesion, test, verEvento,
} from './helpers.js'

let usuario
const eventos = []

test.beforeAll(async () => {
  test.setTimeout(150_000)
  usuario = await crearUsuario('flujos')
})

test.afterEach(async () => {
  while (eventos.length) await borrarEvento(usuario, eventos.pop()).catch(() => {})
})

test.afterAll(async () => {
  await borrarUsuario(usuario)
})

const sufijo = () => String(Date.now()).slice(-6)

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, usuario)
})

test('T1 · crear un evento con 2 tareas y verlas en su detalle', async ({ page }) => {
  const nombre = `T1 Feria ${sufijo()}`
  const tareas = [
    { nombre: 'Reservar tarima', plazo: diaBogota(5), horas: '2' },
    { nombre: 'Contratar sonido', plazo: diaBogota(6), horas: '1.5' },
  ]

  await page.goto('/crear')
  await expect(page.getByRole('heading', { level: 2, name: 'Crear evento' })).toBeVisible()
  await page.getByLabel('Nombre del evento').fill(nombre)
  await page.getByLabel(/^Fecha\*?$/).fill(diaBogota(10))
  await page.getByLabel('Lugar').fill('Plazoleta Univalle')

  await page.getByRole('button', { name: 'Añadir tarea' }).click()
  for (const [i, t] of tareas.entries()) {
    await page.getByLabel(/^Tarea\*?$/).nth(i).fill(t.nombre)
    await page.getByLabel('Fecha límite').nth(i).fill(t.plazo)
    await page.getByRole('radio', { name: 'Horas estimadas' }).nth(i).click()
    await page.getByRole('spinbutton', { name: 'Horas estimadas' }).nth(i).fill(t.horas)
  }
  await page.getByRole('button', { name: 'Guardar evento' }).click()

  await expect(page).toHaveURL(/\/eventos$/)
  await expect(page.getByRole('status')).toHaveText('Evento creado exitosamente.')
  const tarjeta = page.getByRole('button', { name: new RegExp(nombre) })
  await expect(tarjeta).toContainText('2 tareas')
  await tarjeta.click()

  await expect(page).toHaveURL(/\/eventos\/\d+$/)
  eventos.push(page.url().match(/(\d+)$/)[1])
  await expect(page.getByRole('heading', { level: 2, name: nombre })).toBeVisible()
  for (const t of tareas) {
    const fila = page.getByRole('listitem').filter({ has: page.getByRole('checkbox', { name: t.nombre, exact: true }) })
    await expect(fila).toContainText(fmtFecha(t.plazo))
    await expect(fila).toContainText(`${t.horas} h`)
  }
  await expect(page.getByText('0 de 2 tareas ejecutadas')).toBeVisible()
})

test('T2 · Hoy agrupa las tareas, suma las horas de hoy y ordena por menor esfuerzo', async ({ page }) => {
  const nombre = `T2 Cena ${sufijo()}`
  const ev = await crearEvento(usuario, {
    name: nombre,
    date: diaBogota(5),
    tareas: [
      { name: 'Comprar flores', dueDate: diaBogota(0), estimatedHours: 2 },
      { name: 'Llamar al chef', dueDate: diaBogota(0), estimatedHours: 1 },
      { name: 'Imprimir menús', dueDate: diaBogota(2), estimatedHours: 1.5 },
    ],
  })
  eventos.push(ev.id)

  await page.goto('/hoy')
  await expect(page.getByRole('heading', { level: 2, name: 'Hoy' })).toBeVisible()
  await expect(page.getByText('3 h de 6 h')).toBeVisible()
  await expect(page.getByText('pendientes hoy')).toBeVisible()
  await expect(page.getByText('Orden: menor esfuerzo estimado primero.')).toBeVisible()

  const paraHoy = page.getByRole('region', { name: 'Para hoy' })
  await expect(paraHoy.getByRole('checkbox')).toHaveCount(2)
  // Menor esfuerzo primero: la de 1 h antes que la de 2 h.
  await expect(paraHoy.locator('label')).toHaveText(['Llamar al chef', 'Comprar flores'])
  await expect(paraHoy).toContainText('2 tareas')

  const proximas = page.getByRole('region', { name: 'Próximas' })
  await expect(proximas.getByRole('checkbox', { name: 'Imprimir menús', exact: true })).toBeVisible()
  await expect(proximas).toContainText('1.5 h')
  await expect(page.getByRole('region', { name: 'Vencidas' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Cambiar límite diario' })).toBeVisible()
})

test.describe('T3 · reprogramar con conflicto de sobrecarga', () => {
  // El 409 del conflicto es esperado: Chrome lo registra como "Failed to load resource".
  test.use({ erroresPermitidos: [/status of 409/] })

  const A = 'Montar decoración'
  const B = 'Probar luces'

  /** A (hoy+3, 4 h) y B (hoy+2, 3 h); al posponer B a hoy+3 ese día quedaría en 7 h de 6 h. */
  async function abrirConflicto(page) {
    const nombre = `T3 Concierto ${sufijo()}`
    const ev = await crearEvento(usuario, {
      name: nombre,
      date: diaBogota(14),
      tareas: [
        { name: A, dueDate: diaBogota(3), estimatedHours: 4 },
        { name: B, dueDate: diaBogota(2), estimatedHours: 3 },
      ],
    })
    eventos.push(ev.id)

    await page.goto(`/evento/${ev.id}`)
    await expect(page).toHaveURL(new RegExp(`/eventos/${ev.id}$`))
    await page.getByRole('button', { name: `Posponer ${B}`, exact: true }).click()
    const posponer = page.getByRole('dialog', { name: 'Posponer tarea' })
    await posponer.getByLabel('Nueva fecha').fill(diaBogota(3))
    await posponer.getByRole('button', { name: 'Posponer', exact: true }).click()

    const conflicto = page.getByRole('dialog', { name: 'Conflicto de sobrecarga' })
    await expect(conflicto).toBeVisible()
    await expect(conflicto.getByRole('alert')).toHaveText('Quedarías con 7h planificadas ese día (tu límite es 6h).')
    await expect(conflicto).toContainText('7 h de 6 h')
    return { ev, conflicto }
  }

  const filaDe = (page, tarea) =>
    page.getByRole('listitem').filter({ has: page.getByRole('checkbox', { name: tarea, exact: true }) })
  const tareaB = async (ev) => (await verEvento(usuario, ev.id)).tasks.find((t) => t.name === B)

  test('resolver con «Mover a otro día»', async ({ page }) => {
    const { ev, conflicto } = await abrirConflicto(page)
    await conflicto.getByRole('button', { name: /Mover a otro día/ }).click()

    const mover = page.getByRole('dialog', { name: 'Mover a otro día' })
    await expect(mover).toBeVisible()
    const dias = mover.getByRole('radio')
    await expect(dias.first()).toHaveAttribute('aria-checked', 'true')
    await mover.getByRole('button', { name: 'Mover tarea' }).click()

    await expect(page.getByRole('status')).toHaveText('Tarea reprogramada.')
    await expect(mover).toBeHidden()

    const b = await tareaB(ev)
    expect(b.dueDate).not.toBe(diaBogota(3))
    await expect(filaDe(page, B)).toContainText(fmtFecha(b.dueDate))
    await expect(filaDe(page, B)).not.toContainText(fmtFecha(diaBogota(3)))

    const dias6 = await horasPorDia(usuario)
    for (const [dia, horas] of Object.entries(dias6)) expect(horas, `horas del ${dia}`).toBeLessThanOrEqual(6)
  })

  test('resolver con «Reducir horas estimadas»', async ({ page }) => {
    const { ev, conflicto } = await abrirConflicto(page)
    await conflicto.getByRole('button', { name: /Reducir horas estimadas/ }).click()

    const reducir = page.getByRole('dialog', { name: 'Reducir horas estimadas' })
    const campo = reducir.getByLabel('Nuevas horas estimadas')
    await expect(campo).toHaveAttribute('max', '2')
    await expect(reducir).toContainText('Caben hasta 2 h.')
    await campo.fill('2')
    await reducir.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByRole('status')).toHaveText('Horas reducidas.')
    await expect(filaDe(page, B)).toContainText(fmtFecha(diaBogota(3)))
    await expect(filaDe(page, B)).toContainText('2 h')

    const b = await tareaB(ev)
    expect(b.dueDate).toBe(diaBogota(3))
    expect(Number(b.estimatedHours)).toBeLessThanOrEqual(2)
    expect((await horasPorDia(usuario))[diaBogota(3)]).toBeLessThanOrEqual(6)
  })
})

test('T4 · marcar una tarea como hecha sube la barra en el detalle, en Progreso y en Hoy', async ({ page }) => {
  const nombre = `T4 Taller ${sufijo()}`
  const ev = await crearEvento(usuario, {
    name: nombre,
    date: diaBogota(5),
    tareas: [
      { name: 'Enviar invitaciones', dueDate: diaBogota(0), estimatedHours: 1 },
      { name: 'Preparar material', dueDate: diaBogota(0), estimatedHours: 1 },
    ],
  })
  eventos.push(ev.id)

  await page.goto(`/eventos/${ev.id}`)
  const barra = page.getByRole('progressbar', { name: 'Progreso', exact: true })
  await expect(barra).toHaveAttribute('aria-valuenow', '0')
  await expect(page.getByText('0 de 2 tareas ejecutadas')).toBeVisible()

  // La casilla es controlada: se marca cuando responde el servidor, por eso click() y no check().
  const casilla = page.getByRole('checkbox', { name: 'Enviar invitaciones', exact: true })
  await casilla.click()
  await expect(page.getByRole('status')).toHaveText('Tarea marcada como hecha.')
  await expect(casilla).toBeChecked()
  await expect(barra).toHaveAttribute('aria-valuenow', '50')
  await expect(page.getByText('1 de 2 tareas ejecutadas')).toBeVisible()
  await expect(page.getByText('50%', { exact: true })).toBeVisible()

  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Progreso' }).click()
  await expect(page).toHaveURL(/\/progreso$/)
  const tarjeta = page.getByRole('link').filter({ hasText: nombre })
  await expect(tarjeta.getByRole('progressbar', { name: `Progreso de ${nombre}` })).toHaveAttribute('aria-valuenow', '50')
  await expect(tarjeta).toContainText('50%')
  await expect(tarjeta).toContainText('1 de 2 tareas')

  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Hoy' }).click()
  await expect(page).toHaveURL(/\/hoy$/)
  await expect(page.getByText('1 h de 6 h')).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Enviar invitaciones', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Preparar material', exact: true })).not.toBeChecked()
})
