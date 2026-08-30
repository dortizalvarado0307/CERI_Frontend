# 🎨 Sistema de Diseño CERI - Documentación

Sistema de diseño profesional con **dark mode manual** para el frontend CERI.

---

## ✅ Mejoras Implementadas

### 1. **Sistema de Diseño Completo**
- Variables CSS organizadas en `theme.css` y `components.css`
- Soporte para **dark mode manual** (toggle en sidebar)
- Componentes reutilizables (botones, cards, inputs, badges, etc.)
- Animaciones y transiciones consistentes

### 2. **Dark Mode Toggle**
- Botón en el sidebar para activar/desactivar dark mode
- Preferencia guardada en localStorage
- Transición suave entre modos
- Iconos de sol 🌞 y luna 🌙

### 3. **Mejoras Visuales**
- Sombras más elegantes
- Hover effects profesionales
- Tipografía consistente (Sora para títulos, DM Sans para body)
- Glassmorphism en cards y modales
- Animaciones de entrada (fade-in, slide-up, scale-in)

### 4. **Limpieza de Tooling**
- ✅ Desinstalado `react-hook-form` (no usado)
- ✅ Desinstalado `react-select` (no usado)
- ✅ Eliminados assets muertos (`react.svg`, `vite.svg`, `hero.png`, `App.css`)

---

## 🚀 Uso del Dark Mode

### Opción 1: Toggle en Sidebar
1. Hacé clic en el ícono de sol/luna en el sidebar
2. El modo se guarda automáticamente en localStorage
3. La preferencia persiste entre recargas

### Opción 2: Programático
```tsx
// Activar dark mode
document.documentElement.classList.add('dark');

// Desactivar dark mode
document.documentElement.classList.remove('dark');

// Verificar estado
const isDark = document.documentElement.classList.contains('dark');
```

---

## 📚 Variables Disponibles

### Colores
```css
/* Primarios */
var(--color-primary-600)      /* #2563eb - Azul principal */
var(--gradient-brand)          /* Gradiente CERI */

/* Neutros */
var(--color-neutral-50)       /* #f8fafc */
var(--color-neutral-900)       /* #0f172a */

/* Semánticos */
var(--color-success-500)      /* Verde */
var(--color-error-500)         /* Rojo */
var(--color-warning-500)       /* Naranja */
```

### Sombras
```css
var(--shadow-sm)    /* Sutil */
var(--shadow-md)    /* Estándar */
var(--shadow-lg)    /* Elevado */
var(--shadow-xl)    /* Muy elevado */
var(--shadow-brand) /* Con color de marca */
```

### Espaciado
```css
var(--spacing-1)   /* 4px */
var(--spacing-2)   /* 8px */
var(--spacing-3)   /* 12px */
var(--spacing-4)   /* 16px */
var(--spacing-6)   /* 24px */
var(--spacing-8)   /* 32px */
```

### Bordes
```css
var(--radius-sm)   /* 8px */
var(--radius-md)   /* 12px */
var(--radius-lg)   /* 16px */
var(--radius-xl)   /* 24px */
var(--radius-full) /* 9999px */
```

---

## 🎨 Componentes Disponibles

### Botones
```css
.btn-primary     /* Botón principal con gradiente */
.btn-secondary   /* Botón secundario */
.btn-ghost       /* Botón transparente */
.btn-danger      /* Botón de peligro */
.btn-sm          /* Tamaño pequeño */
.btn-lg          /* Tamaño grande */
```

### Cards
```css
.card            /* Card estándar */
.card.elevated   /* Card con sombra elevada */
.card.glass      /* Card con efecto glassmorphism */
```

### Inputs
```css
.input           /* Input estándar */
.input.error     /* Input con error */
.input.success   /* Input con éxito */
.input:disabled  /* Input deshabilitado */
```

### Badges
```css
.badge-primary   /* Badge azul */
.badge-success   /* Badge verde */
.badge-warning   /* Badge naranja */
.badge-error     /* Badge rojo */
.badge-gray      /* Badge gris */
```

---

## 📝 Ejemplos de Uso

### Card con Variables
```css
.mi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.mi-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
```

### Botón Primario
```css
.mi-boton {
  background: var(--gradient-brand);
  color: white;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-brand-sm);
  transition: all var(--transition-base);
}

.mi-boton:hover {
  background: var(--gradient-brand-hover);
  box-shadow: var(--shadow-brand-md);
  transform: translateY(-2px);
}
```

### Dark Mode en Componentes
```css
/* El dark mode se aplica automáticamente */
.mi-componente {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

/* Pero podés hacer overrides si es necesario */
html.dark .mi-componente {
  background: var(--color-surface-elevated);
}
```

---

## 🎯 Próximos Pasos (Pendientes)

### Críticos
- ⚠️ **Optimizar logo** (1.86 MB → <100 KB) - Usar squoosh.app
- ⚠️ **Validar token expiry** en ProtectedRoute
- ⚠️ **Interceptor 401** para logout automático

### Funcionalidad
- Completar PersonInCharge (edit/delete)
- Agregar ruta 404
- Tests de componentes

### Tooling
- Configurar ESLint correctamente
- Agregar tests (Vitest)

---

## 🛠️ Archivos del Sistema

```
src/styles/
├── theme.css          # Variables globales + dark mode
├── components.css     # Componentes reutilizables
└── README.md          # Esta documentación

src/components/ui/
├── DarkModeToggle.tsx   # Toggle de dark mode
└── DarkModeToggle.css   # Estilos del toggle
```

---

## 💡 Tips

### 1. Usar Variables
Siempre usá variables en lugar de valores hardcodeados:
```css
/* ✅ BIEN */
color: var(--color-text-primary);

/* ❌ MAL */
color: #0f172a;
```

### 2. Dark Mode
Las variables se actualizan automáticamente, pero si necesitas overrides:
```css
html.dark .mi-clase {
  /* Override para dark mode */
}
```

### 3. Hover Effects
Usá los efectos predefinidos:
```css
.hover-lift      /* Eleva al hover */
.hover-scale     /* Escala al hover */
```

### 4. Animaciones
```css
.animate-fade-in      /* Fade in */
.animate-slide-up     /* Slide desde abajo */
.animate-scale-in     /* Scale desde 0.95 */
```

---

**Versión:** 2.0.0  
**Última actualización:** Agosto 2026  
**Dark Mode:** ✅ Manual (toggle en sidebar)
