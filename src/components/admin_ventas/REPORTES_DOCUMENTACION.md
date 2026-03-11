# 📊 Reporte Integral Avanzado de Inventario - Documentación

## 🎯 Descripción General

El componente **`Reportes`** es un dashboard profesional de análisis avanzado de inventario que proporciona:
- Análisis de **importes en soles** 
- **Antigüedad de productos** sin movimiento
- **Filtrado dinámico** por período (día, semana, mes, trimestre, año)
- Gráficos de evolución temporal
- Análisis de rotación y volumen
- Validación de movimientos de logística con importes

---

## 📋 Características Principales

### 1️⃣ **Análisis Temporal Dinámico**
- Período seleccionable: 24h, Semana, Mes, Trimestre, Año, Todo
- Recalcula automáticamente todos los gráficos y KPIs
- Muestra evolución de:
  - **Cantidad**: unidades vendidas/movidas
  - **Importe**: soles totales por período
  - **Movimientos**: número de transacciones

### 2️⃣ **KPIs Profesionales**
- **Stock Total**: Unidades disponibles
- **Importe Total Vendido**: En soles de período
- **Movimientos en Período**: Cantidad de transacciones
- **Mayor Stock**: Producto con más unidades

### 3️⃣ **Análisis de Antigüedad**
- **Productos Sin Movimiento**: Últimos 20 productos sin venta
- **Días Sin Venta**: Conteo automático desde última interacción
- **Antigüedad**: Formato (años, meses, días, horas)
- **Alertas Automáticas**:
  - 🔴 Rojo: 1 año sin venta
  - 🟡 Amarillo: 3 meses sin venta
  - ✅ Verde: Normal

### 4️⃣ **Análisis de Volumen e Importe**
- **Gráfico Dual**: Cantidad vs Importe por período
- **Desglose por Categoría**: Importe vendido por línea
- **% del Total**: Distribución de ventas por categoría
- **Producto Mayor Importe**: Top producto en soles

### 5️⃣ **Insights Estratégicos**
- Hallazgos del período
- Acciones recomendadas
- Métricas de control (rotación, valor promedio)
- Riesgo de quiebre de stock

### 6️⃣ **Exportación Completa**
- **Excel**: 4 hojas (KPI, Movimientos, Categorías, Sin Movimiento)
- **PDF**: Reporte visual profesional

---

## 🚀 Cómo Usar

### 1. Importar
```jsx
import Reportes from "@/components/admin_ventas/Reportes";
```

### 2. Usar en Ruta
```jsx
<Route path="/admin/reportes" element={<Reportes />} />
```

### 3. Usar en Dashboard
```jsx
<Reportes />
```

---

## 📊 Flujo de Datos

```
┌──────────────────────────────────────┐
│  API: /api/compras/productos         │
│       /api/compras/movimientos      │
│       /api/compras/categorias       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│   FILTRADO TEMPORAL                  │
│  (Rango dinámico: día/semana/mes)   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│   ANÁLISIS Y CÁLCULOS               │
│  • Antigüedad de productos          │
│  • Importe vendido por período      │
│  • Agrupación por categoría         │
│  • KPIs profesionales               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│   VISUALIZACIÓN EN GRÁFICOS          │
│  • Temporal dual (cantidad+importe)  │
│  • Importe por categoría             │
│  • Tablas con antigüedad             │
└──────────────────────────────────────┘
```

---

## 🎨 Estructura Visual

```
┌────────────────────────────────────────┐
│   ENCABEZADO (Gradiente Profesional)   │
│   Reporte Integral Avanzado de Inv    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   CONTROLES (Filtros + Exportar)      │
│  [Rango Fecha] [Categoría] [Botones]  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   KPIs (4 Tarjetas: Stock, Importe)   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   GRÁFICOS (2 Análisis)               │
│  [Movimientos Temporal] [Importe Cat] │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   TABLA ANTIGÜEDAD (Productos Sin Mov) │
│   Código | Desc | Stock | Días | Alert│
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   TABLA CATEGORÍAS (Importe Total)    │
│   Cat | # Prod | Stock | S/ | %       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   INSIGHTS (2 Columnas)               │
│   [Hallazgos] [Recomendaciones]       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   PIE DE PÁGINA                        │
└────────────────────────────────────────┘
```

---

## 🔄 Filtros Dinámicos

### Rango de Fecha
- **Últimas 24 Horas** (día): Movimientos del último día
- **Última Semana** (semana): Últimos 7 días
- **Último Mes** (mes): Últimos 30 días
- **Último Trimestre** (trimestre): Últimos 90 días
- **Último Año** (anio): Últimos 365 días
- **Todo el Tiempo** (todo): Desde inicio (2000)

### Por Categoría
- Filtra productos por línea
- Recalcula automáticamente importe, stock, antigüedad

---

## 📊 Funciones de Análisis

### `obtenerRangoFechas(rango)`
Calcula rango de fechas dinámico según selección.

**Entrada:** "dia" | "semana" | "mes" | "trimestre" | "anio" | "todo"

**Salida:**
```javascript
{
  inicio: "2024-02-09",
  fin: "2026-03-09"
}
```

### `calcularAntiguedad(fecha)`
Convierte diferencia de tiempo a formato legible.

**Salida:** "1 año", "3 meses", "5 días", "Hoy"

### `agruparMovimientosPorPeriodo(movimientos, rango)`
Agrupa movimientos por período seleccionado.

**Salida:**
```javascript
[
  {
    periodo: "Marzo 2026",
    cantidad: 450,
    importe: 5000.00,
    movimientos: 12
  }
]
```

### `analizarProductosSinMovimiento(productos, movimientos)`
Identifica productos sin venta y calcula antigüedad.

**Salida:**
```javascript
[
  {
    id: 123,
    codigo: "PROD-001",
    descripcion: "Paño azul",
    stock: 25,
    antigedad: "6 meses",
    diasSinVenta: 180
  }
]
```

### `calcularKPIsAvanzados(productos, movimientos)`
Calcula métricas clave del período.

**Salida:**
```javascript
{
  stockTotal: 3450,
  importeTotal: "125450.50",
  productoMayorStock: { ... },
  productoMayorImporte: { ... },
  totalMovimientos: 87
}
```

### `agruparPorCategoria(productos, movimientos, categorias)`
Suma importes vendidos por categoría.

**Salida:**
```javascript
[
  {
    id: 5,
    nombre: "Paños",
    cantidad: 25,
    stock: 450,
    importe: 8500.00
  }
]
```

---

## 💡 Interpretación de Datos

### Gráfico 1: Movimientos por Período
- **Barras Celestes**: Cantidad de unidades
- **Línea Roja**: Importe en soles
- **Insight**: Identifica picos de venta y fluctuaciones

### Gráfico 2: Importe por Categoría
- **Barras Azules**: Total soles vendidos por línea
- **Insight**: Categorías más rentables vs menos rentables

### Tabla de Antigüedad
- **🔴 Fondo Rojo**: 1 año sin movimiento (crítico)
- **🟡 Fondo Naranja**: 3 meses sin movimiento (alerta)
- **✅ Normal sin color**: Movimiento reciente

---

## 🎯 Casos de Uso

### 1. Análisis de Producto Específico
- ¿Por qué se compró tanto de producto X?
  → Ver en tabla Importe por Categoría
- ¿Cuál es el importe vendido?
  → Ver gráfico Movimientos por Período

### 2. Control de Antigüedad
- ¿Qué productos no se venden?
  → Tabla "Productos Sin Movimiento"
- ¿Cuánto tiempo sin movimiento?
  → Columna "Antigüedad"
- ¿Qué acción tomar?
  → Ver "Acciones Recomendadas"

### 3. Análisis de Rotación
- ¿Qué categoría rota más?
  → Ver Importe por Categoría
- ¿Cuál es el volumen promedio?
  → Métrica "Valor Promedio por Movimiento"
- ¿Hay concentración en pocos productos?
  → Ver % del Total

### 4. Comparación Temporal
- ¿Aumentó la venta semana a semana?
  → Gráfico Movimientos (seleccionar "Semana")
- ¿Qué mes fue más rentable?
  → Gráfico Movimientos (seleccionar "Mes")

---

## ⚠️ Alertas Automáticas

### Productos con Antigüedad
| Tiempo Sin Venta | Icono | Color | Acción |
|---|---|---|---|
| ≥ 1 año | 🔴 | Rojo | Liquidación urgente |
| ≥ 3 meses | 🟡 | Naranja | Promoción recomendada |
| < 3 meses | ✅ | Verde | Monitoreo normal |

### Métricas de Control
- **Stock Comprometido** > 80% → Buena disponibilidad
- **Stock Comprometido** < 50% → Bajo nivel de cobertura
- **Riesgo de Quiebre** > 10% → Requiere reorden inmediata

---

## 📥 Exportación

### Excel (4 Hojas)
1. **KPI**: Resumen ejecutivo del período
2. **Movimientos**: Evolución temporal detallada
3. **Categorías**: Importe y stock por línea
4. **Sin Movimiento**: Productos con antigüedad

### PDF
- Captura visual completa del dashboard
- Incluye todos los gráficos y tablas
- Optimizado para impresión

---

## 🔧 Integración con API

El componente consume automáticamente:

```
GET /api/compras/productos?limit=1000
GET /api/compras/movimientos
GET /api/compras/categorias
```

**Campos esperados en Movimientos:**
```javascript
{
  id: 123,
  producto_id: 45,
  cantidad: 50,
  precio: 10.50,
  estado: "APROBADO_FINAL",
  created_at: "2026-03-09T10:30:00"
}
```

---

## 📚 Referencias Técnicas

### Dependencias
- `recharts`: Gráficos profesionales
- `xlsx`: Exportación a Excel
- `html2canvas` + `jspdf`: Exportación a PDF
- `lucide-react`: Iconos

### Estructuras de Datos

**Producto:**
```javascript
{
  id, codigo, codigo_modelo, descripcion,
  stock_total, categoria_id, created_at
}
```

**Movimiento:**
```javascript
{
  id, producto_id, cantidad, precio, estado,
  created_at, empresa_id, almacen_id
}
```

**Categoría:**
```javascript
{ id, nombre }
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Gráficos sin datos | Verificar que API retorna movimientos |
| Filtro no funciona | Comprobar que fechas de movimientos son válidas |
| PDF vacío | Aumentar timeout en `html2canvas` |
| Soles no calculan | Verificar campo `precio` en movimientos |

---

## 📝 Notas Importantes

1. **Antigüedad**: Se calcula desde `created_at` del producto
2. **Importe**: Calculado como `cantidad × precio`
3. **Período**: Dinámico, se actualiza automáticamente
4. **Alertas**: Basadas en 365 días (1 año) y 90 días (3 meses)
5. **Sin Movimiento**: Top 20 productos sin transacciones

---

**Versión**: 2.0.0  
**Actualizado**: 2026-03-09  
**Estado**: ✅ Producción

---

## 📋 Características Principales

### 1️⃣ **KPIs (Indicadores Clave de Rendimiento)**
- **Total de Productos**: Cantidad total en el catálogo
- **Stock Total**: Unidades disponibles en inventario
- **Productos Sin Stock**: Cantidad en Estado crítico
- **Disponibilidad**: % de productos con stock > 0
- **Rotación**: Clasificación por velocidad de venta

### 2️⃣ **Gráficos Profesionales**
- **Distribución por Categoría**: Barras comparativas de stock
- **Productos Críticos**: Top 15 con stock bajo
- **Rotación del Inventario**: Análisis de velocidad (Rápido/Normal/Lento)
- **Top Marcas**: Concentración de proveedores

### 3️⃣ **Análisis Detallado**
- Tabla de productos críticos con estatus
- Desglose por categoría con barras de progreso
- Matriz de alertas (Stock cero, bajo, excesivo)

### 4️⃣ **Resumen Ejecutivo**
- Hallazgos principales con interpretaciones
- Recomendaciones estratégicas personalizadas
- Métricas de desempeño esperadas

### 5️⃣ **Exportación**
- **Excel**: Múltiples hojas (KPI, Críticos, Categorías, Marcas)
- **PDF**: Reporte completo para presentaciones

---

## 🚀 Cómo Usar el Componente

### 1. Importar el Componente
```jsx
import Reportes from "../../components/admin_ventas/Reportes";
```

### 2. Usarlo en una Ruta
```jsx
// En tu AppRouter.jsx o archivo de rutas
import Reportes from "@/components/admin_ventas/Reportes";

<Route path="/reportes" element={<Reportes />} />
```

### 3. Usar dentro de un Dashboard
```jsx
<div className="dashboard">
  <Reportes />
</div>
```

---

## 📊 Flujo de Datos

```
┌─────────────────────────────────┐
│   API: /api/compras/productos   │  ← Obtiene productos con stock
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│   API: /api/compras/categorias  │  ← Obtiene metadatos
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│     PROCESAMIENTO Y ANÁLISIS    │
├─────────────────────────────────┤
│ • Cálculo de KPIs              │
│ • Agrupación por categoría     │
│ • Agrupación por marca         │
│ • Análisis de rotación         │
│ • Generación de alertas        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│   VISUALIZACIÓN EN GRÁFICOS     │
├─────────────────────────────────┤
│ • Recharts (barras, pastel)    │
│ • Tablas interactivas          │
│ • Tarjetas de KPI              │
└─────────────────────────────────┘
```

---

## ⚙️ Funciones de Análisis Internas

### `calcularKPIs(productos)`
Calcula métricas principales del inventario.

**Devuelve:**
```javascript
{
  totalProductos: 150,
  stockTotal: 3450,
  productosSinStock: 12,
  productosConStock: 138,
  stockPromedio: 23.0,
  productosConVariantes: 45,
  porcentajeStockCero: 8.0
}
```

### `agruparPorCategoria(productos, categorias)`
Agrupa productos por categoría con estadísticas.

**Devuelve:**
```javascript
[
  {
    id: 5,
    nombre: "Paños y Bayetas",
    cantidad: 25,
    stock: 450,
    avgStock: 18.0
  },
  // ...
]
```

### `agruparPorMarca(productos)`
Top 12 marcas por cantidad de productos.

**Devuelve:**
```javascript
[
  {
    marca: "Marca Premium",
    cantidad: 35,
    stock: 1200
  },
  // ...
]
```

### `filtrarProductosCriticos(productos)`
Productos con stock < 10, ordenados por criticidad.

**Devuelve:** Array de máximo 15 productos

### `analizarRotacionInventario(productos)`
Clasifica productos según velocidad de rotación.

**Devuelve:**
```javascript
{
  rapido: 45,   // Stock < 20 (rápida rotación)
  normal: 60,   // Stock 20-50 (rotación normal)
  lento: 45     // Stock > 50 (lenta rotación)
}
```

### `calcularAlertasInventario(productos)`
Genera alertas automáticas según estado del stock.

**Tipos de Alertas:**
- 🔴 **Crítico**: Stock = 0
- 🟡 **Advertencia**: Stock 1-4 unidades
- 🔵 **Info**: Stock > 100 unidades (sobreabastecimiento)

---

## 🎨 Estructura Visual

```
┌─────────────────────────────────────────────────┐
│           ENCABEZADO (MORADO GRADIENTE)         │
│     📊 Reporte Integral de Inventario           │
│            Análisis profesional...              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│        CONTROLES (Filtro + Exportar)            │
│  [Dropdown Categoría] [Excel] [PDF]            │
└─────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│          SECCIÓN KPIs (4 Tarjetas)              │
│  [📦 Total] [📊 Stock] [⛔ Sin Stock] [✅ Con Stock]
└──────────────────────────────────────────────────┘

        ⚠️ ALERTAS (Si existen)

┌──────────────────────────────────────────────────┐
│   GRÁFICOS (Grid Responsivo 2x2 o 1xN)        │
│  ┌──────────────┬──────────────┐             │
│  │ Stock por Cat│Críticos (H)  │             │
│  ├──────────────┼──────────────┤             │
│  │Distribución %│    Marcas    │             │
│  └──────────────┴──────────────┘             │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│   TABLA PRODUCTOS CRÍTICOS                      │
│   Código | Desc | Stock | Marca | Status       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│   ANALÍSIS POR CATEGORÍA (Tabla detallada)     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│   RESUMEN EJECUTIVO (3 Columnas)               │
│ [Hallazgos] [Recomendaciones] [Métricas]     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│         PIE DE PÁGINA (Texto gris)              │
└──────────────────────────────────────────────────┘
```

---

## 🔧 Dependencias Requeridas

```json
{
  "recharts": "^2.10.0",
  "lucide-react": "^0.5.0",
  "xlsx": "^0.18.5",
  "html2canvas": "^1.4.1",
  "jspdf": "^4.0.0"
}
```

**❗ IMPORTANTE**: Si aún no has instalado `recharts`, ejecuta:
```bash
npm install recharts
```

---

## 🎯 Interpretación de Gráficos

### Gráfico 1: Distribución por Categoría
- **Barras Azules**: Stock total por categoría
- **Barras Celestes**: Cantidad de productos
- **Insight**: Identifica categorías con concentración de inventario

### Gráfico 2: Productos Críticos
- **Barras Rojas Horizontales**: Stock muy bajo
- **Top 15**: Los que requieren acción inmediata
- **Insight**: Prioriza reorden de estos ítems

### Gráfico 3: Rotación (Pastel)
- **Verde**: Rápido (alta demanda)
- **Naranja**: Normal (equilibrio)
- **Rojo**: Lento (sobreabastecimiento)
- **Insight**: Detecta productos problemáticos

### Gráfico 4: Top Marcas
- **Barras Naranjas**: Cantidad de SKUs
- **Barras Azules**: Stock total
- **Insight**: Dependencia de proveedores

---

## 💡 Recomendaciones por Escenario

### 🔴 Stock Cero Alto (> 10%)
**Problema**: Quiebres de stock frecuentes
**Acción**:
1. Contactar proveedores para reorden urgente
2. Aumentar puntos de reorden 20-30%
3. Revisar lead times de entrega
4. Implementar alertas automáticas

### 🟡 Rotación Lenta (> 30% en "Lento")
**Problema**: Capital invertido sin recuperación
**Acción**:
1. Analizar precios vs mercado
2. Crear promociones o descuentos
3. Evaluar desinversión o remate
4. Revisar política de devoluciones

### 📦 Stock Excesivo (> 100 unidades)
**Problema**: Sobreabastecimiento innecesario
**Acción**:
1. Reducir frecuencia de pedidos
2. Aumentar cantidad mínima de venta
3. Crear ofertas combinadas
4. Revisar forecast de demanda

---

## 📈 Métricas de Referencia (Mejores Prácticas)

| Métrica | Meta | Rango Aceptable |
|---------|------|-----------------|
| Disponibilidad | 95% | 90-98% |
| Rotación Anual | 4-6x | 2-8x (varía) |
| Stock M-A-D | 30 días | 20-60 días |
| Tasa Stockout | < 2% | < 5% |
| Precisión Inv. | 98% | > 95% |

---

## 🖨️ Exportando Reportes

### Exportar a Excel
1. Clic en botón **"Excel"**
2. Se descarga archivo con 4 hojas:
   - **KPI**: Resumen ejecutivo
   - **Críticos**: Productos en riesgo
   - **Por Categoría**: Análisis por línea
   - **Por Marca**: Análisis por proveedor

### Exportar a PDF
1. Clic en botón **"PDF"**
2. Se genera PDF con:
   - Todas las gráficas y tablas
   - Formato profesional
   - Optimizado para impresión

---

## 🔗 Integración con Otras Vistas

### Desde Admin Dashboard
```jsx
const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <nav>
        <Link to="/reportes">Reportes de Inventario</Link>
      </nav>
      <Routes>
        <Route path="reportes" element={<Reportes />} />
      </Routes>
    </div>
  );
};
```

### Navegación Recomendada
- **Reportes** → Para análisis estratégico
- **Productos** → Para gestión diaria
- **Compras** → Para reorden
- **Logística** → Para distribución

---

## ⚡ Performance Tips

1. **Datos Grandes**: Si tienes > 5000 productos
   - Implementa paginación en tabla de críticos
   - Usa lazy loading para gráficos
   - Cachea datos en context

2. **Filtrado**: Al cambiar categoría
   - Se recalculan todos los gráficos
   - Mantén caché local si es posible

3. **Exportación**: Para archivos muy grandes
   - Considera limitar filas en Excel
   - Genera PDFs por secciones

---

## 🐛 Troubleshooting

### Error: "recharts is not defined"
**Solución**: Instalar recharts
```bash
npm install recharts
```

### Error: "API endpoint not found"
**Verificar**:
- Ruta `/api/compras/productos` existe
- Ruta `/api/compras/categorias` existe
- Base de datos tiene datos

### Gráficos no aparecen
**Verificar**:
- Ancho del contenedor (min. 600px)
- Datos validados (no null/undefined)
- Console por errores JavaScript

### PDF vacío o cortado
**Solución**:
- Aumentar timeout en `html2canvas`
- Usar versión más reciente de jsPDF
- Reducir contenido por página

---

## 📚 Recursos Adicionales

- [Recharts Docs](https://recharts.org/)
- [XLSX Docs](https://github.com/SheetJS/sheetjs)
- [jsPDF Docs](https://github.com/parallax/jsPDF)
- [Best Practices Inventario](https://www.apics.org/)

---

## 📝 Changelog

**v1.0.0** (Actual)
- ✅ KPIs principales
- ✅ 4 gráficos profesionales
- ✅ Tablas interactivas
- ✅ Exportación Excel/PDF
- ✅ Alertas automáticas
- ✅ Responsive Design
- ✅ Resumen ejecutivo

---

## 👨‍💼 Soporte

Si tienes dudas o problemas:
1. Revisa la sección **Troubleshooting**
2. Verifica conexión a la API
3. Abre consola del navegador (F12)
4. Contacta al equipo de desarrollo

---

**Generado**: 2026-03-09  
**Versión**: 1.0.0  
**Estado**: ✅ Producción
