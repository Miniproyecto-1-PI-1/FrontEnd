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

        const { violations, passes } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        test.info().annotations.push({
          type: 'axe',
          description: `${violations.length} violaciones, ${passes.length} reglas cumplidas`,
        })
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

/**
 * Recorre la página con Tab y, para cada elemento que recibe el foco, comprueba que se note: contorno,
 * sombra o un cambio de borde/fondo respecto a cómo se ve sin foco.
 */
async function recorrerConTab(page, maxPasos = 60) {
  const recorrido = []
  for (let i = 0; i < maxPasos; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const estilo = (e) => {
        const c = getComputedStyle(e)
        return {
          outline: c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0 ? `${c.outlineWidth} ${c.outlineStyle}` : '',
          sombra: c.boxShadow === 'none' ? '' : c.boxShadow,
          borde: c.borderColor,
          fondo: c.backgroundColor,
        }
      }
      const conFoco = estilo(el)
      el.blur()
      const sinFoco = estilo(el)
      el.focus()
      const nombre = (el.getAttribute('aria-label') || el.labels?.[0]?.innerText || el.innerText || el.id || '')
        .replace(/\s+/g, ' ').trim().slice(0, 40)
      const visible = Boolean(conFoco.outline) || conFoco.sombra !== sinFoco.sombra ||
        conFoco.borde !== sinFoco.borde || conFoco.fondo !== sinFoco.fondo
      return {
        clave: el.outerHTML.slice(0, 200),
        elemento: `${el.tagName.toLowerCase()}${el.type ? `[${el.type}]` : ''} «${nombre}»`,
        indicador: conFoco.outline ? `outline ${conFoco.outline}` : visible ? 'sombra/borde/fondo' : 'ninguno',
        visible,
      }
    })
    if (!info) continue
    if (recorrido.length && recorrido[0].clave === info.clave) break
    recorrido.push(info)
  }
  return recorrido
}

const RECORRIDOS = [
  { nombre: '/evento/:id', ruta: () => `/eventos/${evento.id}`, listo: (p) => p.getByRole('progressbar', { name: 'Progreso', exact: true }) },
  { nombre: '/progreso', ruta: () => '/progreso', listo: (p) => p.getByRole('region', { name: 'Avance general' }) },
]

for (const tema of ['light', 'dark']) {
  test.describe(`teclado · tema ${tema === 'light' ? 'claro' : 'oscuro'}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('theme', t), tema)
      await iniciarSesion(page, usuario)
    })

    for (const vista of RECORRIDOS) {
      test(`${vista.nombre}: el foco se ve en cada elemento al recorrer con Tab`, async ({ page }) => {
        await page.goto(vista.ruta())
        await expect(vista.listo(page)).toBeVisible()
        const recorrido = await recorrerConTab(page)
        const tabla = recorrido.map(({ elemento, indicador, visible }) => ({ elemento, indicador, visible }))
        await test.info().attach(`recorrido-tab-${vista.nombre.replace(/\W+/g, '')}-${tema}.json`, {
          body: JSON.stringify(tabla, null, 2),
          contentType: 'application/json',
        })
        test.info().annotations.push({ type: 'tab', description: `${recorrido.length} elementos recorridos` })
        console.log(`[tab] ${vista.nombre} (${tema}): ${recorrido.length} elementos\n` +
          tabla.map((t) => `  ${t.visible ? '✓' : '✗'} ${t.elemento} → ${t.indicador}`).join('\n'))
        expect(recorrido.length).toBeGreaterThan(3)
        expect(tabla.filter((t) => !t.visible)).toEqual([])
      })
    }
  })
}
