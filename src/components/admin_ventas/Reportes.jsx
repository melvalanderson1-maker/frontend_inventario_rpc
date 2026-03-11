import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
} from "recharts";
import api from "../../api/api";
import { Download, TrendingUp, AlertCircle, Package, Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Reportes.css";

// ========================
// 🎨 COLORES PROFESIONALES
// ========================
const COLORES = {
  primario: "#1f77b4",
  exito: "#2ca02c",
  advertencia: "#ff7f0e",
  peligro: "#d62728",
  info: "#17a2b8",
  neutro: "#6c757d",
  coloresCategorias: [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17a2b8",
  ],
};

// ========================
// 📊 UTILIDADES DE FECHA
// ========================
const obtenerRangoFechas = (rango) => {
  const hoy = new Date();
  let inicio = new Date();

  switch (rango) {
    case "dia":
      inicio.setDate(hoy.getDate() - 1);
      break;
    case "semana":
      inicio.setDate(hoy.getDate() - 7);
      break;
    case "mes":
      inicio.setMonth(hoy.getMonth() - 1);
      break;
    case "trimestre":
      inicio.setMonth(hoy.getMonth() - 3);
      break;
    case "anio":
      inicio.setFullYear(hoy.getFullYear() - 1);
      break;
    case "todo":
      inicio.setFullYear(2000);
      break;
    default:
      inicio.setMonth(hoy.getMonth() - 1);
  }

  return {
    inicio: inicio.toISOString().split("T")[0],
    fin: hoy.toISOString().split("T")[0],
  };
};

const calcularAntiguedad = (fechaValidacion) => {
  if (!fechaValidacion) return "—";

  const hoy = new Date();
  const fecha = new Date(fechaValidacion);

  const diff = hoy - fecha;

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const meses = Math.floor(dias / 30);
  const años = Math.floor(dias / 365);

  if (años >= 1) return `${años} año${años > 1 ? "s" : ""}`;
  if (meses >= 1) return `${meses} mes${meses > 1 ? "es" : ""}`;
  if (dias >= 1) return `${dias} día${dias > 1 ? "s" : ""}`;

  return "Hoy";
};

// ========================
// 📊 FUNCIONES DE ANÁLISIS
// ========================

function agruparMovimientosPorPeriodo(movimientos, rango) {
  const agrupo = {};

  movimientos.forEach((mov) => {
    const fecha = new Date(mov.fecha_creacion);
    let clave = "";

    switch (rango) {
      case "dia":
        clave = fecha.toLocaleDateString("es-PE");
        break;
      case "semana":
        const sem = Math.ceil((fecha.getDate() - fecha.getDay() + 1) / 7);
        clave = `Sem ${sem} - ${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        break;
      case "mes":
        clave = fecha.toLocaleString("es-PE", { month: "long", year: "numeric" });
        break;
      case "trimestre":
        const trim = Math.ceil((fecha.getMonth() + 1) / 3);
        clave = `Q${trim} ${fecha.getFullYear()}`;
        break;
      case "anio":
        clave = fecha.getFullYear().toString();
        break;
      default:
        clave = fecha.toLocaleDateString("es-PE");
    }

    if (!agrupo[clave]) {
      agrupo[clave] = {
        periodo: clave,
        cantidad: 0,
        importe: 0,
        movimientos: 0,
      };
    }

    const importe = (mov.cantidad || 0) * (mov.precio || 0);
    agrupo[clave].cantidad += Number(mov.cantidad || 0);
    agrupo[clave].importe += importe;
    agrupo[clave].movimientos++;
  });

  return Object.values(agrupo);
}

function analizarProductosSinMovimiento(productos, movimientos) {

  const hoy = new Date();

  return productos.map((producto) => {

    const movProducto = movimientos.filter(
      (m) => m.producto_id === producto.id
    );

    const entradasValidadas = movProducto.filter(
      (m) =>
        (m.tipo_movimiento === "entrada" ||
         m.tipo_movimiento === "saldo_inicial") &&
        m.fecha_validacion_logistica
    );

    const salidas = movProducto.filter(
      (m) => m.tipo_movimiento === "salida"
    );

    if (entradasValidadas.length === 0) return null;

    const ultimaEntrada = entradasValidadas
      .sort(
        (a, b) =>
          new Date(b.fecha_validacion_logistica) -
          new Date(a.fecha_validacion_logistica)
      )[0];

      const lotes = calcularAntiguedadFIFO(movProducto)

if(lotes.length===0) return null

const loteMasAntiguo = lotes.sort(
(a,b)=> b.dias - a.dias
)[0]

const dias = loteMasAntiguo.dias





    if(entradasValidadas.length>0){

    fechaInicio=new Date(
    entradasValidadas[0].fecha_validacion_logistica
    )

}

return {
id: producto.id,
codigo: producto.codigo_modelo || producto.codigo,
descripcion: producto.descripcion,
stock: Number(producto.stock_total || 0),
diasSinVenta: dias,
antigedad: calcularAntiguedad(
new Date() - dias*86400000
),
}

  })
  .filter(Boolean)
  .sort((a, b) => b.diasSinVenta - a.diasSinVenta)
  .slice(0, 20);
}


function calcularAntiguedadFIFO(movimientos){

const hoy = new Date()

const ordenados = [...movimientos].sort(
(a,b)=> new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
)

let lotes = []

ordenados.forEach(m=>{

if(
m.tipo_movimiento==="entrada" ||
m.tipo_movimiento==="saldo_inicial"
){

lotes.push({
cantidad:Number(m.cantidad),
fecha:new Date(m.fecha_validacion_logistica)
})

}

if(m.tipo_movimiento==="salida"){

let restante = Number(m.cantidad)

for(let lote of lotes){

if(restante<=0) break

if(lote.cantidad<=restante){

restante -= lote.cantidad
lote.cantidad = 0

}else{

lote.cantidad -= restante
restante = 0

}

}

}

})

lotes = lotes.filter(l=>l.cantidad>0)

const resultado = lotes.map(l=>{

const dias = Math.floor(
(hoy - l.fecha)/(1000*60*60*24)
)

return{
cantidad:l.cantidad,
fecha:l.fecha,
dias
}

})

return resultado

}

function calcularKPIsAvanzados(productos, movimientos) {

    const stockTotal = productos.reduce(
    (sum, p) => sum + Number(p.stock_total || 0),
    0
    );

    const importeTotal = movimientos.reduce(
    (sum, m) =>
        sum + Number(m.cantidad || 0) * Number(m.precio || 0),
    0
    );

  // ✅ evitar reduce en array vacío
  const productoConMayorStock =
    productos.length > 0
      ? productos.reduce((prev, current) =>
          (prev.stock_total || 0) > (current.stock_total || 0) ? prev : current
        )
      : null;

  // ✅ calcular importe por producto
  const productoMayorImporte =
    movimientos.length > 0
      ? movimientos
          .reduce((acc, m) => {
            const existing = acc.find((x) => x.producto_id === m.producto_id);

            if (existing) {
              existing.importe += (m.cantidad || 0) * (m.precio || 0);
              existing.cantidad += m.cantidad || 0;
            } else {
              acc.push({
                producto_id: m.producto_id,
                importe: (m.cantidad || 0) * (m.precio || 0),
                cantidad: m.cantidad || 0,
              });
            }

            return acc;
          }, [])
          .sort((a, b) => b.importe - a.importe)[0]
      : null;

  return {
    stockTotal,
    importeTotal: importeTotal,
    productoMayorStock: productoConMayorStock,
    productoMayorImporte,
    totalMovimientos: movimientos.length,
  };
}
function agruparPorCategoria(productos, movimientos, categorias) {
  const mapa = {};

  productos.forEach((p) => {
    const catId = p.categoria_id;
    if (!mapa[catId]) {
      const categoria = categorias.find((c) => c.id === catId);
      mapa[catId] = {
        id: catId,
        nombre: categoria?.nombre || `Categoría ${catId}`,
        cantidad: 0,
        stock: 0,
        importe: 0,
      };
    }
    mapa[catId].cantidad++;
    mapa[catId].stock += Number(p.stock_total || 0);
  });

  movimientos.forEach((m) => {
    const producto = productos.find((p) => p.id === m.producto_id);
    if (producto) {
      const catId = producto.categoria_id;
      if (mapa[catId]) {
        mapa[catId].importe +=
            Number(m.cantidad || 0) * Number(m.precio || 0);
                }
    }
  });

  return Object.values(mapa).sort((a, b) => b.importe - a.importe);
}


function calcularLineaAntiguedad(movimientos){

let fechaInicio=null
let historial=[]

movimientos.forEach(m=>{

if(m.tipo_movimiento==="entrada"||m.tipo_movimiento==="saldo_inicial"){

fechaInicio=new Date(m.fecha_validacion_logistica)

}

if(m.tipo_movimiento==="salida" && fechaInicio){

const dias=(new Date(m.created_at)-fechaInicio)/(1000*60*60*24)

historial.push({
inicio:fechaInicio,
fin:new Date(m.created_at),
dias:Math.floor(dias)
})

fechaInicio=null

}

})

return historial

}

// ========================
// 🎯 COMPONENTE PRINCIPAL
// ========================

export default function Reportes() {
  // Estado
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangoFecha, setRangoFecha] = useState("mes");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  // ✅ estado faltante
const [productoDetalle, setProductoDetalle] = useState(null);

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [prodRes, movRes, catRes] = await Promise.all([
        api.get("/api/compras/productos"),
        api.get("/api/compras/movimientos/todos"),
        api.get("/api/compras/categorias"),
        ]);

        setProductos(prodRes.data.productos || []);
        setMovimientos(Array.isArray(movRes.data) ? movRes.data : []);
        setCategorias(catRes.data.categorias || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Filtros
  const productosF =
    filtroCategoria === "todas"
      ? productos
      : productos.filter((p) => String(p.categoria_id) === String(filtroCategoria));

  const { inicio, fin } = obtenerRangoFechas(rangoFecha);
    const movimientosF = movimientos.filter((m) => {

    if (!m.created_at) return false;

    const fechaObj = new Date(m.created_at);

    if (isNaN(fechaObj.getTime())) return false;

    const fecha = fechaObj.toISOString().split("T")[0];

    return fecha >= inicio && fecha <= fin;

    });

  // Cálculos
  const kpis = calcularKPIsAvanzados(productosF, movimientosF);
  const productosSinMovimiento = analizarProductosSinMovimiento(
    productosF,
    movimientosF
  );
  const datosMovimientoPeriodo = agruparMovimientosPorPeriodo(
    movimientosF,
    rangoFecha
  );
  const datosCategorias = agruparPorCategoria(productosF, movimientosF, categorias);

  // Exportar
  const exportarExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // KPI
    const sheetKPI = [
      ["REPORTE AVANZADO DE INVENTARIO"],
      [`Período: ${inicio} a ${fin}`],
      [],
      ["INDICADOR", "VALOR"],
      ["Stock Total Unitario", kpis.stockTotal],
      ["Importe Total Vendido", `S/ ${kpis.importeTotal}`],
      ["Total Movimientos", kpis.totalMovimientos],
      ["Producto Mayor Stock", kpis.productoMayorStock?.descripcion || "—"],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetKPI), "KPI");

    // Movimientos por período
    const sheetMovimientos = [
      ["PERÍODO", "CANTIDAD", "IMPORTE S/", "# MOVIMIENTOS"],
      ...datosMovimientoPeriodo.map((m) => [
        m.periodo,
        m.cantidad,
        m.importe.toFixed(2),
        m.movimientos,
      ]),
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(sheetMovimientos),
      "Movimientos"
    );

    // Análisis por categoría
    const sheetCategorias = [
      ["CATEGORÍA", "# PRODUCTOS", "STOCK", "IMPORTE S/"],
      ...datosCategorias.map((c) => [
        c.nombre,
        c.cantidad,
        c.stock,
        c.importe.toFixed(2),
      ]),
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(sheetCategorias),
      "Categorías"
    );

    // Sin movimiento
    const sheetSinMov = [
      ["CÓDIGO", "DESCRIPCIÓN", "STOCK", "DÍAS SIN VENTA", "ANTIGÜEDAD"],
      ...productosSinMovimiento.map((p) => [
        p.codigo,
        p.descripcion,
        p.stock,
        p.diasSinVenta,
        p.antigedad,
      ]),
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(sheetSinMov),
      "Sin Movimiento"
    );

    XLSX.writeFile(wb, `Reporte-Inventario-${new Date().getTime()}.xlsx`);
  }, [kpis, datosMovimientoPeriodo, datosCategorias, productosSinMovimiento, inicio, fin]);

  const exportarPDF = useCallback(async () => {
    const element = document.getElementById("reporte-container");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`Reporte-Inventario-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
    }
  }, []);

  if (loading) {
    return (
      <div className="reporte-loading">
        <div className="spinner"></div>
        <p>Cargando análisis completo...</p>
      </div>
    );
  }


  const verDetalleProducto=(producto)=>{

    const movs=movimientos
    .filter(m=>m.producto_id===producto.id)
    .sort((a,b)=>new Date(b.fecha_creacion)-new Date(a.fecha_creacion))

    setProductoDetalle({
    producto,
    movimientos:movs
    })

    }

  return (
    <div id="reporte-container" className="reporte-container">
      {/* ENCABEZADO */}
      <div className="reporte-header">
        <div className="reporte-titulo">
          <h1>📊 Reporte Integral Avanzado de Inventario</h1>
          <p>Análisis profesional de stock, importes y movimientos</p>
        </div>
        <div className="reporte-fecha">
          <small>
            Período: {inicio} a {fin} | Actualizado: {new Date().toLocaleString("es-PE")}
          </small>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="reporte-controles">
        <div className="control-rango-fecha">
          <label>📅 Rango de Fecha:</label>
          <select value={rangoFecha} onChange={(e) => setRangoFecha(e.target.value)}>
            <option value="dia">Últimas 24 Horas</option>
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mes</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="anio">Último Año</option>
            <option value="todo">Todo el Tiempo</option>
          </select>
        </div>

        <div className="control-filtro">
          <label>🏷️ Categoría:</label>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="todas">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>


        <section className="reporte-seccion">
        <h2 className="reporte-subtitulo">📦 Inventario Completo</h2>

        <div className="tabla-container">
        <table className="tabla-analisis">
        <thead>
        <tr>
        <th>Código</th>
        <th>Producto</th>
        <th>Categoría</th>
        <th>Stock</th>
        <th>Última Entrada</th>
        <th>Última Salida</th>
        <th>Días Sin Venta</th>
        <th>Acciones</th>
        </tr>
        </thead>

        <tbody>

        {productosF.map((p)=>{

        const movProducto = movimientos.filter(
        m => Number(m.producto_id) === Number(p.id)
        )

        const entradas = movProducto
        .filter(
        m =>
        (m.tipo_movimiento==="entrada" ||
        m.tipo_movimiento==="saldo_inicial") &&
        m.fecha_validacion_logistica
        )
        .sort(
        (a,b)=>
        new Date(b.fecha_validacion_logistica) -
        new Date(a.fecha_validacion_logistica)
        )

        const salidas = movProducto
        .filter(
        m =>
        m.tipo_movimiento==="salida" &&
        m.fecha_validacion_logistica
        )
        .sort(
        (a,b)=>
        new Date(b.fecha_validacion_logistica) -
        new Date(a.fecha_validacion_logistica)
        )

        const ultimaEntrada = entradas[0]
        const ultimaSalida = salidas[0]

        let diasSinVenta="—"

        if(ultimaSalida){

        const diff =
        (new Date() - new Date(ultimaSalida.fecha_validacion_logistica))
        / (1000*60*60*24)

        diasSinVenta=Math.floor(diff)

        }

        return(

        <tr key={p.id}>

        <td>{p.codigo_modelo||p.codigo}</td>

        <td>{p.descripcion}</td>

        <td>
        {categorias.find(c=>c.id===p.categoria_id)?.nombre}
        </td>

        <td>{p.stock_total}</td>

        <td>
        {ultimaEntrada?.fecha_validacion_logistica?.split("T")[0]||"—"}
        </td>

        <td>
        {ultimaSalida?.fecha_validacion_logistica?.split("T")[0]||"—"}
        </td>

        <td>{diasSinVenta}</td>

        <td>

        <button
        className="btn-detalle"
        onClick={()=>verDetalleProducto(p)}
        >
        Ver historial
        </button>

        </td>

        </tr>

        )

        })}

        </tbody>

        </table>
        </div>
        </section>

        <div className="control-exportar">
          <button onClick={exportarExcel} className="btn-exportar">
            <Download size={18} /> Excel
          </button>
          <button onClick={exportarPDF} className="btn-exportar btn-pdf">
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      {/* KPIs PRINCIPALES */}
      <section className="reporte-seccion">
        <h2 className="reporte-subtitulo">📈 Indicadores Clave (KPI)</h2>
        <div className="kpi-grid">
          <div className="kpi-card kpi-primario">
            <div className="kpi-icono">📦</div>
            <div className="kpi-datos">
              <div className="kpi-valor">{kpis.stockTotal.toLocaleString()}</div>
              <div className="kpi-etiqueta">Stock Total (unidades)</div>
            </div>
          </div>

          <div className="kpi-card kpi-exito">
            <div className="kpi-icono">💵</div>
            <div className="kpi-datos">
              <div className="kpi-valor">S/ {Number(kpis.importeTotal).toLocaleString()}</div>
              <div className="kpi-etiqueta">Importe Total Vendido</div>
            </div>
          </div>

          <div className="kpi-card kpi-info">
            <div className="kpi-icono">🔄</div>
            <div className="kpi-datos">
              <div className="kpi-valor">{kpis.totalMovimientos}</div>
              <div className="kpi-etiqueta">Movimientos en Período</div>
            </div>
          </div>

          <div className="kpi-card kpi-advertencia">
            <div className="kpi-icono">📊</div>
            <div className="kpi-datos">
              <div className="kpi-valor">
                {kpis.productoMayorStock?.descripcion?.substring(0, 20) || "—"}
              </div>
              <div className="kpi-etiqueta">Mayor Stock</div>
              <div className="kpi-detalle">{kpis.productoMayorStock?.stock_total || 0} unidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* GRÁFICOS - FILA 1 */}
      <section className="reporte-seccion">
        <h2 className="reporte-subtitulo">📉 Análisis Temporal</h2>
        <div className="graficos-grid">
          {/* Movimientos por Período */}
          <div className="grafico-container">
            <h3>Movimientos y Ventas por {rangoFecha}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={datosMovimientoPeriodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number" ? `S/ ${value.toFixed(2)}` : value
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="cantidad" fill={COLORES.info} name="Cantidad (unid)" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="importe"
                  stroke={COLORES.peligro}
                  name="Importe (S/)"
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="grafico-interpretacion">
              Evolución de ventas en cantidad y valor. Identifica picos de venta y tendencias.
            </p>
          </div>

          {/* Stock por Categoría */}
          <div className="grafico-container">
            <h3>Importe por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosCategorias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
                <Bar dataKey="importe" fill={COLORES.primario} name="Importe (S/)" />
              </BarChart>
            </ResponsiveContainer>
            <p className="grafico-interpretacion">
              Distribución de importes vendidos por categoría. Identifica líneas más rentables.
            </p>
          </div>
        </div>
      </section>

      {/* TABLA - PRODUCTOS SIN MOVIMIENTO */}
      <section className="reporte-seccion">
        <h2 className="reporte-subtitulo">⚠️ Productos Sin Movimiento (Antigüedad)</h2>
        <div className="tabla-container">
          <table className="tabla-critica">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Stock Actual</th>
                <th>Días Sin Venta</th>
                <th>Antigüedad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productosSinMovimiento.map((p, idx) => {
                const esAlerta = p.diasSinVenta >= 365;
                const esAdvertencia = p.diasSinVenta >= 90;
                return (
                  <tr key={idx} className={esAlerta ? "fila-alerta" : esAdvertencia ? "fila-warning" : ""}>
                    <td className="codigo-col">{p.codigo}</td>
                    <td className="desc-col">{p.descripcion?.substring(0, 40)}</td>
                    <td className="stock-col">{p.stock}</td>
                    <td className="num-col">{p.diasSinVenta}</td>
                    <td className="num-col">{p.antigedad}</td>
                    <td className="estatus-col">
                      {esAlerta && "🔴 1 año sin venta"}
                      {!esAlerta && esAdvertencia && "🟡 3 meses sin venta"}
                      {!esAlerta && !esAdvertencia && "✅ Normal"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="tabla-pie">
          <p>
            <strong>Total productos sin movimiento:</strong> {productosSinMovimiento.length}
          </p>
          <p className="recomendacion">
            ⚠️ Estos productos requieren análisis para descarga, promociones o liquidación.
          </p>
        </div>
      </section>

      {/* TABLA - RESUMEN CATEGORÍAS CON IMPORTES */}
      <section className="reporte-seccion">
        <h2 className="reporte-subtitulo">💰 Análisis por Categoría (Importe Total)</h2>
        <div className="tabla-container">
          <table className="tabla-analisis">
            <thead>
              <tr>
                <th>Categoría</th>
                <th># Productos</th>
                <th>Stock Total</th>
                <th>Importe Vendido (S/)</th>
                <th>% del Total</th>
              </tr>
            </thead>
            <tbody>
              {datosCategorias.map((cat, idx) => (
                <tr key={idx}>
                  <td className="categoria-col">
                    <strong>{cat.nombre}</strong>
                  </td>
                  <td className="num-col">{cat.cantidad}</td>
                  <td className="num-col">{cat.stock}</td>
                  <td className="num-col">
                    <strong>S/ {cat.importe.toLocaleString("es-PE", { maximumFractionDigits: 2 })}</strong>
                  </td>
                  <td className="num-col">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: (kpis.importeTotal ? (cat.importe / kpis.importeTotal) * 100 : 0),
                        }}
                      ></div>
                    </div>
                    {kpis.importeTotal ? ((cat.importe / kpis.importeTotal) * 100).toFixed(1) : "0.0"}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ANÁLISIS DETALLADO - SUGERENCIAS */}
      <section className="reporte-seccion seccion-resumen">
        <h2 className="reporte-subtitulo">💡 Insights y Recomendaciones</h2>
        <div className="resumen-contenido">
          <div className="resumen-bloque">
            <h4>🎯 Hallazgos del Período</h4>
            <ul>
              <li>
                <strong>Importe Total:</strong> S/ {Number(kpis.importeTotal).toLocaleString()}
              </li>
              <li>
                <strong>Movimientos Realizados:</strong> {kpis.totalMovimientos}
              </li>
              <li>
                <strong>Productos Sin Movimiento:</strong> {productosSinMovimiento.length} (requieren acción)
              </li>
              <li>
                <strong>Categoría Más Rentable:</strong> {datosCategorias[0]?.nombre || "—"} (S/{" "}
                {datosCategorias[0]?.importe.toFixed(2) || "0"})
              </li>
            </ul>
          </div>

          <div className="resumen-bloque">
            <h4>💼 Acciones Recomendadas</h4>
            <ul>
              <li>
                🔄 <strong>Revisar Productos Sin Movimiento:</strong> {productosSinMovimiento.length} artículos
                sin venta. Considerar descuentos, promociones o liquidación.
              </li>
              <li>
                📊 <strong>Optimizar Categoría Top:</strong> {datosCategorias[0]?.nombre} es la más
                rentable. Aumentar inversión en inventario.
              </li>
              <li>
                💰 <strong>Analizar Concentración:</strong> Verificar si las ventas en soles están
                concentradas en pocos productos.
              </li>
              <li>
                📈 <strong>Proyecciones:</strong> Basado en movimientos actuales, proyectar demanda
                para próximos períodos.
              </li>
              <li>
                🏭 <strong>Control de Volumen:</strong> Monitorear variaciones significativas en
                cantidad vs importe.
              </li>
            </ul>
          </div>

          <div className="resumen-bloque">
            <h4>📋  Métricas de Control</h4>
            <ul>
              <li>
                ✅ <strong>Rotación de Inventario:</strong> {(
                  kpis.totalMovimientos / productos.length
                ).toFixed(2)}x (por producto en período)
              </li>
              <li>
                💵 <strong>Valor Promedio por Movimiento:</strong> S/{" "}
                {(kpis.importeTotal / Math.max(kpis.totalMovimientos, 1)).toFixed(2)}
              </li>
              <li>
                📦 <strong>Stock Comprometido:</strong> {Math.round(
                  (productos.filter((p) => p.stock_total > 0).length / productos.length) * 100
                )}
                % con disponibilidad
              </li>
              <li>
                ⚠️ <strong>Riesgo de Quiebre:</strong>{" "}
                {Math.round(
                  (productos.filter((p) => p.stock_total === 0).length / productos.length) * 100
                )}
                % sin stock
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PIE */}
      <footer className="reporte-footer">
        <p>
          Reporte generado automáticamente por el Sistema de Gestión de Inventario.
          Los datos mostrados representan el estado real del inventario en el período seleccionado.
        </p>
        <p className="nota-confidencial">
          ⚠️ Información Confidencial - Uso Interno Únicamente
        </p>
      </footer>



      {productoDetalle && (

        <div className="modal-overlay">

        <div className="modal-producto">

        <h2>
        Historial del producto
        </h2>

        <h3>
        {productoDetalle.producto.descripcion}
        </h3>

        <table>

        <thead>

        <tr>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>Cantidad</th>
        <th>Precio</th>
        <th>Importe</th>
        </tr>


        </thead>

        <tbody>

        {productoDetalle.movimientos.map((m,i)=>{

        const importe=m.cantidad*m.precio

        return(

        <tr key={i}>

        <td>{m.fecha_creacion?.split("T")[0]}</td>

        <td>{m.tipo_movimiento}</td>

        <td>{m.cantidad}</td>

        <td>S/ {m.precio}</td>

        <td>S/ {importe}</td>

        </tr>

        )

        })}

        </tbody>

        </table>

        <button
        onClick={()=>setProductoDetalle(null)}
        className="btn-cerrar"
        >
        Cerrar
        </button>

        </div>

        </div>

        )}
    </div>
  );
}
