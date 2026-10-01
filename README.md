# Agendo — Frontend

Organizador de eventos y sus gestiones (Miniproyecto 1, Proyecto Integrador I). React 19 + Vite.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no está en localhost:8080
npm run dev
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | Revisa el código con oxlint |

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL del backend Spring Boot, por ejemplo `http://localhost:8080` |

## Tema

Modo claro y oscuro con el switch del sidebar o del login. La primera vez sigue la preferencia del sistema. Los colores viven en `src/styles/tokens.css`.
