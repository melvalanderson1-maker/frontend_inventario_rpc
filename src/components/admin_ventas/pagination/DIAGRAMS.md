## 📊 DIAGRAMA DE FLUJO - PAGINACIÓN PROFESIONAL

### 1️⃣ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────┐
│         COMPONENTE ProductosVentas.jsx              │
└─────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐    ┌──────▼──────┐   ┌─────▼────┐
    │ ESTADO  │    │ FETCHDATA   │   │ FILTROS  │
    │current  │    │  (API)      │   │ SEARCH   │
    │Page=1   │    │             │   │ TIPO,    │
    │         │    │ productos[] │   │ STOCK    │
    └────┬────┘    └──────┬──────┘   └─────┬────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                ┌─────────▼──────────┐
                │ productosFiltrados │
                │  (con scoring)     │
                └─────────┬──────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
   ┌────▼─────────────┐          ┌─────────▼───────┐
   │  SLICE DATOS     │          │ PAGINATION      │
   │  (página actual) │          │ COMPONENT       │
   │                  │          │  - Sticky Top   │
   │ Página 1: 0-12   │          │  - Sticky Bottom│
   │ Página 2: 12-24  │          │  - Info stats   │
   │ Página N: ...    │          └────────┬────────┘
   └────┬─────────────┘                   │
        │                                 │
        └────────────────┬────────────────┘
                         │
                    ┌────▼────────────┐
                    │  PRODUCTOS GRID │
                    │  (12 items)     │
                    └─────────────────┘
```

---

### 2️⃣ FLUJO DE CAMBIO DE PÁGINA

```
Usuario hace click en página X
        │
        ▼
┌─────────────────────────────────────┐
│  onPageChange(X)                    │
│  ↓                                  │
│  setCurrentPage(X)                  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  Scroll suave hacia arriba          │
│  window.scrollTo({top: 0, ...})     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  Re-render con nuevos items         │
│  productosFiltrados.slice(...)      │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  Paginación actualiza:              │
│  - Botón activo = X                 │
│  - Info = "Mostrando Y a Z..."      │
│  - Estados de botones               │
└─────────────────────────────────────┘
```

---

### 3️⃣ FLUJO DE CAMBIO DE FILTRO

```
Usuario cambia FILTRO (búsqueda, tipo, categoría, stock)
        │
        ▼
┌─────────────────────────────────────┐
│  onChange(filtro)                   │
│  ↓                                  │
│  setFiltro(valor)                   │
│  setCurrentPage(1) ⭐ CLAVE        │
│  setSearchParams({...})             │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  Re-calcular productosFiltrados     │
│  (aplicar filtros + scoring)        │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  RESET: currentPage = 1             │
│  ✅ Muestra primeros 12 items       │
│  ✅ Paginación muestra página 1     │
└─────────────────────────────────────┘
```

---

### 4️⃣ CÁLCULO DE PAGINACIÓN

```
Total de productos filtrados: 145
Items por página: 12

┌─────────────────────────────────────┐
│  Cálculo de páginas totales:        │
│  totalPages = ceil(145 / 12)        │
│  totalPages = ceil(12.08)           │
│  totalPages = 13                    │
└─────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Distribución de items por página:                    │
│ Página 1:  items 1-12     (12 items)               │
│ Página 2:  items 13-24    (12 items)               │
│ Página 3:  items 25-36    (12 items)               │
│ ...                                                  │
│ Página 13: items 133-145  (13 items) ⭐ última    │
└──────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Para la página X:                   │
│ Start = (X - 1) × 12                │
│ End = X × 12                        │
│                                     │
│ Ejemplo, página 5:                  │
│ Start = (5-1) × 12 = 48             │
│ End = 5 × 12 = 60                   │
│ Items mostrados: 49-60 ✅           │
└─────────────────────────────────────┘
```

---

### 5️⃣ INFORMACIÓN MOSTRADA

```
┌────────────────────────────────────────────────────────┐
│  PAGINATION INFO (ComponenteSuperior e Inferior)       │
└────────────────────────────────────────────────────────┘

Ejemplo Página 1 de 145 items:
  "Mostrando 1 a 12 de 145 resultados • Página 1 de 13"
   ↑           ↑      ↑     ↑       ↑ separador  ↑  ↑
   Inicio    Fin   Total   Items   Info página

Ejemplo Página 5 de 145 items:
  "Mostrando 49 a 60 de 145 resultados • Página 5 de 13"

Ejemplo Página 13 de 145 items:
  "Mostrando 133 a 145 de 145 resultados • Página 13 de 13"

┌────────────────────────────────────────────────────────┐
│ Si no hay resultados:                                  │
│  "No hay resultados"                                   │
│  (Paginación se oculta automáticamente)                │
└────────────────────────────────────────────────────────┘
```

---

### 6️⃣ EFECTO VISUAL STICKY

```
┌─────────────────────────────────────────┐
│ ✨ PAGINACIÓN STICKY TOP (z-index: 98) │ ← Siempre visible
├─────────────────────────────────────────┤
│                                         │
│         [Producto Grid]                 │
│         (12 productos)                  │
│                                         │
│         [Producto Grid]                 │
│         (continuación)                  │
│                                         │
│         [Producto Grid]                 │
│         (más productos)                 │
│                                         │
├─────────────────────────────────────────┤
│ ✨ PAGINACIÓN STICKY BOTTOM (z-index: 98) │ ← Siempre visible
└─────────────────────────────────────────┘

Usuario scrollea hacia arriba:
└─ Paginación TOP permanece pegada al techo

Usuario scrollea hacia abajo:
└─ Paginación BOTTOM permanece pegada al piso

Ambas con: backdrop-filter: blur(10px) para un efecto glassmorphism
```

---

### 7️⃣ LÓGICA DE BOTONES

```
┌───────────────────────────────────────────────────────┐
│           BOTÓN ANTERIOR                              │
├───────────────────────────────────────────────────────┤
│ Estado:           disabled={currentPage === 1}        │
│ Acción:           setCurrentPage(currentPage - 1)     │
│ Alcance:          Nunca menor a 1                     │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│         BOTONES DE NÚMERO DE PÁGINA                   │
├───────────────────────────────────────────────────────┤
│ Visible:          De la 1 a 7 simultáneamente         │
│ Activo:           className="active" si === page      │
│ Efecto Activo:    Gradiente azul + Shimmer animation │
│ Acción:           onClick={() => setCurrentPage(n)}  │
│ Máx visible:      7 botones numéricos                 │
│                                                       │
│ Ejemplo con 13 páginas, en página 7:                 │
│ [<] [1] ... [4] [5] [6] [7] [8] [9] [10] ... [13] [>]│
│                       ↑ Active                        │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│           BOTÓN SIGUIENTE                             │
├───────────────────────────────────────────────────────┤
│ Estado:           disabled={currentPage === totalPages}│
│ Acción:           setCurrentPage(currentPage + 1)     │
│ Alcance:          Nunca mayor a totalPages            │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│         PUNTOS SUSPENSIVOS (...)                      │
├───────────────────────────────────────────────────────┤
│ Mostrado si:      Hay páginas no mostradas            │
│ Ejemplo:          [1] ... [5] [6] [7] ... [13]        │
│ Visual:           Gris suave, sin interacción         │
│ Meaning:          "Hay más páginas aquí"              │
└───────────────────────────────────────────────────────┘
```

---

### 8️⃣ RESPONSIVE LAYOUT

```
DESKTOP (> 768px):
┌───────────────────────────────────────────────────────┐
│ Mostrando 1 a 12 de 145 • Página 1 de 13 │ [<] 1 2 3 │
└───────────────────────────────────────────────────────┘

TABLET (768px):
┌───────────────────────────────────────────────────────┐
│ Mostrando 1 a 12 de 145 • Página 1 de 13             │
│                [<] [1] 2 3 ... 13 [>]                │
└───────────────────────────────────────────────────────┘

MOBILE (< 480px):
┌───────────────────────────────────────────────────────┐
│ Mostrando 1 a 12 de 145                              │
│                  [<] [1] [>]                         │
└───────────────────────────────────────────────────────┘
(Solo muestra número actual + flechas)
```

---

### 9️⃣ INTEGRACIONES CON FILTROS

```
┌──────────────────────────────────────────────────────┐
│ FILTROS GLOBALES (productos-filtros)                │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🔍 Búsqueda: _________________ [🎤]               │
│ Tipo:        [Todos ▼]                             │
│ Categoría:   [Todas ▼]                             │
│ Stock:       [Todos ▼]                             │
│                                                      │
└──────────────────────────────────────────────────────┘
              │ onChange triggers
              ▼
    ┌─────────────────────────┐
    │ setFiltro(valor)        │
    │ setCurrentPage(1) ⭐    │
    │ setSearchParams({...})  │
    └─────────────────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ Re-calcular filtrados   │
    │ Re-render con página 1  │
    └─────────────────────────┘
```

---

### 🔟 ANIMACIONES

```
1. Fade In (Inicio)
   opacity: 0 → 1
   duration: 300ms
   easing: ease

2. Shimmer (Botón Activo)
   Efecto de brillo recorriendo de izquierda a derecha
   duration: 2s
   infinite

3. Hover (Botones normales)
   transform: translateY(-1px)
   duration: 200ms
   color + box-shadow change

4. Page Transition
   opacity: 0.8 → 1
   Transición suave del contenido
```

---

### 1️⃣1️⃣ ACCESIBILIDAD (a11y)

```
✅ ARIA Labels:
   - aria-label="Página anterior"
   - aria-label="Página X"
   - aria-current="page" (en página activa)

✅ Keyboard Navigation:
   - Tab: Navega entre botones
   - Enter: Activa botón
   - Space: Activa botón

✅ Focus Visible:
   outline: 2px solid #3b82f6
   outline-offset: 2px

✅ Screen Readers:
   Anuncian: "Página X de Y, Mostrando A a B de C resultados"

✅ High Contrast Mode:
   border-width: 2px (más visible)
```

---

### 🎨 ESTILOS CLAVE

```css
/* Sticky Positioning */
position: sticky;
top: 0;         /* Para paginación superior */
bottom: 0;      /* Para paginación inferior */
z-index: 98;    /* Sobre contenido, bajo modales */

/* Glassmorphism */
backdrop-filter: blur(10px);
background: rgba(255, 255, 255, 0.95);

/* Botón Activo */
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);

/* Transiciones */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

---

**¡Eso es todo! 🚀 Una paginación completamente profesional y experta.**
