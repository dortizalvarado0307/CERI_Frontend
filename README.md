# CERI - Frontend

Sistema de control de proyectos de vinculación con la comunidad.

## Stack

- React 19 + TypeScript 6
- Vite 8
- React Router 7
- Axios
- Sonner (notificaciones)

## Requisitos

- Node.js 18+
- Backend CERI ejecutándose

## Instalación

```bash
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y configurar:

```
VITE_API_URL=http://localhost:3000/api
```

## Scripts

- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción (tsc + vite)
- `npm run lint` — ESLint
- `npm run preview` — Preview del build

## Estructura

```
src/
  api/          - Clientes API (axios)
  assets/       - Imágenes y logos
  components/   - Componentes compartidos (Layout, Sidebar)
  components/ui/- Componentes UI reutilizables (DarkModeToggle)
  hooks/        - Hooks custom (useModalFocus)
  models/       - Interfaces TypeScript (Project, PersonInCharge)
  pages/        - Páginas (login, projects, personInCharge)
  routes/       - Rutas protegidas
  styles/       - Variables CSS, tema, componentes base
```

## Funcionalidades

- Autenticación con JWT
- CRUD de proyectos de vinculación
- Gestión de personas a cargo
- Filtros por catálogos (región, universidad, tipo de iniciativa, etc.)
- Modo oscuro manual
- Validaciones de formulario
- Diseño responsive