// Revisión automática de accesibilidad (axe, WCAG 2.1 A y AA) en las vistas principales, en tema claro y oscuro.
import AxeBuilder from '@axe-core/playwright'
import {
  api, borrarUsuario, crearEvento, crearUsuario, diaBogota, expect, iniciarSesion, test,
} from './helpers.js'

let usuario
let evento

test.beforeAll(async () => {
  test.setTimeout(150_000)
  usuario = await crearUsuario('a11y')
  // Datos variados para que cada vista pinte sus estados: de hoy, próxima y hecha.
  evento = await crearEvento(usuario, {
    name: 'Evento a11y',
    date: diaBogota(10),
    tareas: [
      { name: 'Tarea de hoy', dueDate: diaBogota(0), estimatedHours: 2 },
      { name: 'Tarea próxima', dueDate: diaBogota(3), estimatedHours: 1.5 },
      { name: 'Tarea hecha', dueDate: diaBogota(4), estimatedHours: 1 },
    ],
  })
  const hecha = evento.tasks.find((t) => t.name === 'Tarea hecha')
  await api(`/api/events/${evento.id}/tasks/${hecha.id}/status`, {
    method: 'PATCH',
    token: usuario.token,
    body: { status: 'DONE' },
  })
})

test.afterAll(async () => {
  await borrarUsuario(usuario)
})

const VISTAS = [
  { ruta: '/hoy', listo: (p) => p.getByRole('region', { name: 'Para hoy' }) },
  { ruta: '/crear', listo: (p) => p.getByRole('button', { name: 'Guardar evento' }) },
  { ruta: () => `/eventos/${evento.id}`, nombre: '/evento/:id', listo: (p) => p.getByRole('progressbar', { name: 'Progreso', exact: true }) },
  { ruta: '/progreso', listo: (p) => p.getByRole('region', { name: 'Avance general' }) },
  { ruta: '/configuracion', listo: (p) => p.locator('#cfgLimiteDiario:not([disabled])') },
]

for (const tema of ['light', 'dark']) {
  test.describe(`tema ${tema === 'light' ? 'claro' : 'oscuro'}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('theme', t), tema)
      await iniciarSesion(page, usuario)
    })

    for (const vista of VISTAS) {
      test(`${vista.nombre ?? vista.ruta} sin violaciones WCAG 2.1 AA`, async ({ page }) => {
        await page.goto(typeof vista.ruta === 'function' ? vista.ruta() : vista.ruta)
        await expect(vista.listo(page)).toBeVisible()
        await expect(page.locator('html')).toHaveAttribute('data-theme', tema)
        // Deja terminar las transiciones de color antes de medir el contraste.
        await page.waitForTimeout(500)

        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        const resumen = violations.map((v) => ({
          id: v.id,
          impacto: v.impact,
          ayuda: v.help,
          nodos: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
        }))
        expect(resumen).toEqual([])
      })
    }
  })
}
