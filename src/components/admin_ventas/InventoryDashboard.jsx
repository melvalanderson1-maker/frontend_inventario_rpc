import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import api from "../../api/api";

import { Bar, Pie } from "react-chartjs-2";
import { Trash2 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import "./InventoryDashboard.css";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);




export default function InventoryDashboard(){

  
const chartValorRef = useRef(null);
const chartStockRef = useRef(null);

/* ======================= STATE ======================= */

const [kpis,setKpis]=useState({});
const [topValor,setTopValor]=useState([]);
const [rotacion,setRotacion]=useState([]);
const [inventario,setInventario]=useState([]);
const [empresasValor,setEmpresasValor]=useState([]);
const [stockProductos,setStockProductos]=useState([]);

const [categorias,setCategorias]=useState([]);

const [valorTipo,setValorTipo]=useState("mayor");
const [stockTipo,setStockTipo]=useState("mayor");

const [valorTopLimit, setValorTopLimit] = useState(100);
const [stockTopLimit, setStockTopLimit] = useState(100);

const [productoSeleccionado,setProductoSeleccionado]=useState(null);

const [abc,setABC]=useState([]);
const [heatmap,setHeatmap]=useState([]);



const [loading,setLoading]=useState(true);


const [hasMoreValor, setHasMoreValor] = useState(true);
const [hasMoreStock, setHasMoreStock] = useState(true);


const [hasMoreTabla, setHasMoreTabla] = useState(true);


const [pageSize, setPageSize] = useState(10);

const [valorLimit, setValorLimit] = useState(100);
const [stockLimit, setStockLimit] = useState(100);
const [tablaLimit, setTablaLimit] = useState(10);

const [activeIndexValor, setActiveIndexValor] = useState(null);
const [activeIndexStock, setActiveIndexStock] = useState(null);




// ================= TOP VALOR =================
const [pageValor, setPageValor] = useState(0);
const [sizeValor, setSizeValor] = useState(10);
const [orderValor, setOrderValor] = useState("desc");

// ================= TOP STOCK =================
const [pageStock, setPageStock] = useState(0);
const [sizeStock, setSizeStock] = useState(10);
const [orderStock, setOrderStock] = useState("desc");

// ================= TABLA =================
const [pageTabla, setPageTabla] = useState(0);
const [sizeTabla, setSizeTabla] = useState(10);




const [graficoActivo, setGraficoActivo] = useState(null);
// valores: "valor" | "stock" | null

// ================= FILTRO GLOBAL (solo si quieres) =================
const [filters, setFilters] = useState({ categoria: "" });

useEffect(() => {
  setPageValor(0);
  setPageStock(0);
  setPageTabla(0);
}, [filters]);





/* ======================= OPTIONS ======================= */

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "nearest", intersect: true },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#fff",
      bodyColor: "#fff"
    }
  },
  scales: {
x: {
  ticks: {
    color: "#6b7280",
    autoSkip: false,
    maxRotation: 45,
    minRotation: 45,

    callback: function(value) {
      const label = this.getLabelForValue(value);

      // 🔥 divide en bloques de 8 caracteres
      const chunkSize = 15;
      const result = [];

      for (let i = 0; i < label.length; i += chunkSize) {
        result.push(label.substring(i, i + chunkSize));
      }

      return result; // 🔥 ESTO HACE MULTILINEA
    }
  }
},
    y: {
      ticks: { color:"#6b7280" },
      grid: { color:"#e5e7eb" }
    }
  }
};


const rotacionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  layout: {
    padding: 10 // 👈 IMPORTANTE: evita choque con legend
  },

  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#374151",
        font: { size: 12 },
        padding: 15 // 👈 separa leyenda del pie
      }
    },

    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#fff",
      bodyColor: "#fff"
    },

    datalabels: {
      color: "#fff",
      font: {
        weight: "bold",
        size: 12
      },

      anchor: "center",   // 🔥 CLAVE
      align: "center",    // 🔥 CLAVE
      offset: 0,          // 🔥 CLAVE

      clamp: true,
      clip: false,

      display: (context) => {
        const value = context.dataset.data[context.dataIndex];
        const total = context.dataset.data.reduce((a, b) => a + b, 0);
        const percent = (value / total) * 100;

        return percent > 4; // 👈 evita saturación
      },

      formatter: (value, context) => {
        const total = context.chart.data.datasets[0].data
          .reduce((a, b) => a + b, 0);

        const percent = ((value / total) * 100).toFixed(1);
        return `${percent}%`;
      },

      textStrokeColor: "#000",
      textStrokeWidth: 2
    }
  }
};

const stockChartOptions = {
  ...baseChartOptions,

  layout: {
    padding: {
      top: 20
    }
  },

  scales: {
    ...baseChartOptions.scales,
    y: {
      ...baseChartOptions.scales.y,
      grace: "10%"
    }
  },

  plugins: {
    ...baseChartOptions.plugins,
    datalabels: {
      display: true,
      anchor: "end",
      align: "top",
      offset: 4,
      clamp: true,
      clip: false,
      color: "#111827",
      font: {
        weight: "bold",
        size: 10
      },
      formatter: (value) =>
          new Intl.NumberFormat("es-PE").format(value)
    }
  }
};



const empresaChartOptions = {
  ...baseChartOptions,

  indexAxis: "y", // 🔥 IMPORTANTE: horizontal

  layout: {
    padding: {
      right: 30, // 🔥 espacio para que el número respire afuera
      left: 10
    }
  },

  scales: {
    ...baseChartOptions.scales,
    x: {
      ...baseChartOptions.scales.x,
      grace: "10%" // 🔥 da espacio extra al final de la barra
    }
  },

  plugins: {
    ...baseChartOptions.plugins,

    datalabels: {
      display: true,

      // 🔥 CLAVE PARA BARRA HORIZONTAL
      anchor: "end",   // se pega al final de la barra
      align: "right",  // lo manda hacia afuera (derecha)
      offset: 6,       // separación de la barra

      clamp: false,
      clip: false,

      color: "#111827",
      font: {
        weight: "bold",
        size: 10
      },

        formatter: (value) =>
        `S/ ${new Intl.NumberFormat("es-PE").format(value)}`
    }
  }
};

/* ======================= UTILS ======================= */

const formatCurrency=(value)=>
new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(value||0);

/* ======================= QUERY ======================= */

const buildQuery = () => {
  const params = new URLSearchParams();

  if (filters.categoria) {
    params.append("categoria", filters.categoria);
  }

  return params.toString();
};

/* ======================= LOAD DATA ======================= */

const loadCategorias=async()=>{
  try{
    const res=await api.get("/api/dashboard/categorias-resumen");
    const ordenadas=(res.data||[]).sort((a,b)=>b.stock_total-a.stock_total);
    setCategorias(ordenadas);
  }catch(e){ console.error(e); }
};

const loadResumen = async () => {
  try {
    setLoading(true); // 👈 inicia loading

    const query = buildQuery();

    const [kpisRes, rotacionRes, empresasValorRes, abcRes, heatmapRes] = await Promise.all([
      api.get(`/api/dashboard/kpis?${query}`),
      api.get(`/api/dashboard/rotacion?${query}`),
      api.get(`/api/dashboard/valor-por-empresa?${query}`),
      api.get(`/api/dashboard/abc-inventario?${query}`),
      api.get(`/api/dashboard/heatmap-almacenes?${query}`)
    ]);

    setKpis(kpisRes.data || {});
    setRotacion(Array.isArray(rotacionRes.data) ? rotacionRes.data : []);
    setEmpresasValor(Array.isArray(empresasValorRes.data) ? empresasValorRes.data : []);
    setABC(abcRes.data || []);
    setHeatmap(heatmapRes.data || []);

  } catch (e) {
    console.error(e);
  }finally {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }
};

const loadTopValor = async () => {
  try {
    const query = buildQuery();

    const res = await api.get(
      `/api/dashboard/top-productos-valor?page=${pageValor}&size=${sizeValor}&order=${orderValor}&${query}`
    );

    const data = res.data?.data;

    setTopValor(Array.isArray(data) ? data : []);
    setHasMoreValor(res.data.hasMore);
  } catch (e) {
    console.error(e);
  }
};

const loadStock = async () => {
  try {
    const query = buildQuery();

    const res = await api.get(
      `/api/dashboard/productos-stock?page=${pageStock}&size=${sizeStock}&order=${orderStock}&${query}`
    );

    setStockProductos(Array.isArray(res.data?.data) ? res.data.data : []);
    setHasMoreStock(res.data.hasMore);
  } catch (e) {
    console.error(e);
  }
};
const loadTabla = async () => {
  try {
    const query = buildQuery();

    const res = await api.get(
      `/api/dashboard/inventario?page=${pageTabla}&size=${sizeTabla}&producto=${productoSeleccionado || ""}&tipo=${graficoActivo || ""}&${query}`
    );

    setInventario(Array.isArray(res.data?.data) ? res.data.data : []);
    setHasMoreTabla(res.data.hasMore);
  } catch (e) {
    console.error(e);
  }
};
// reset páginas cuando cambia filtro
useEffect(() => {
  setPageValor(0);
  setPageStock(0);
  setPageTabla(0);
}, [filters]);

useEffect(() => {
  loadCategorias();
}, []);

useEffect(() => {
  loadResumen();
}, [filters]);

useEffect(() => {
  loadTopValor();
}, [pageValor, sizeValor, orderValor, filters]);

useEffect(() => {
  loadStock();
}, [pageStock, sizeStock, orderStock, filters]);

useEffect(() => {
  loadTabla();
}, [pageTabla, sizeTabla, filters, productoSeleccionado, graficoActivo]);


useEffect(() => {
  setPageValor(0);

  // 🔥 LIMPIAR SELECCIÓN
  setActiveIndexValor(null);
  setProductoSeleccionado(null);
  setGraficoActivo(null);

}, [orderValor]);

useEffect(() => {
  setPageStock(0);

  // 🔥 LIMPIAR SELECCIÓN
  setActiveIndexStock(null);
  setProductoSeleccionado(null);
  setGraficoActivo(null);

}, [orderStock]);


useEffect(() => {
  setActiveIndexValor(null);
}, [sizeValor]);

useEffect(() => {
  setActiveIndexStock(null);
}, [sizeStock]);



useEffect(() => {
  const chart = chartValorRef.current;

  if (!chart) return;

  const canvas = chart.canvas;

  const handleLeave = () => {
    setActiveIndexValor(null);

    chart.setActiveElements([]);
    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
    chart.update();
  };

  canvas.addEventListener("mouseleave", handleLeave);

  return () => {
    canvas.removeEventListener("mouseleave", handleLeave);
  };
}, [chartValorRef]);

useEffect(() => {
  const chart = chartStockRef.current;

  if (!chart) return;

  const canvas = chart.canvas;

  const handleLeave = () => {
    setActiveIndexStock(null);

    chart.setActiveElements([]);
    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
    chart.update();
  };

  canvas.addEventListener("mouseleave", handleLeave);

  return () => {
    canvas.removeEventListener("mouseleave", handleLeave);
  };
}, [chartStockRef]);
/* ======================= INIT ======================= */


/* ======================= CLICK ======================= */

const handleBarClick = useCallback((event, elements) => {
  if (!elements.length) return;

  const index = elements[0].index;

  setActiveIndexValor(index); // 🔥 SOLO AQUÍ SE PINTA

  if (!topValor[index]) return;

  const producto = topValor[index].codigo_producto;

  setProductoSeleccionado(producto);
  setGraficoActivo("valor");

  setPageTabla(0);
  setSizeTabla(10);

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });

}, [topValor]);




const handleStockBarClick = useCallback((event, elements) => {
  if (!elements.length) return;

  const index = elements[0].index;

  setActiveIndexStock(index); // 🔥 SOLO CLICK

  if (!stockProductos[index]) return;

  const producto = stockProductos[index].codigo_producto;

  setProductoSeleccionado(producto);
  setGraficoActivo("stock");

  setPageTabla(0);
  setSizeTabla(10);

}, [stockProductos]);

/* ======================= FILTER TABLE ======================= */
const inventarioFiltrado = useMemo(() => {
  let data = inventario;

  if (filters.categoria) {
    data = data.filter(i =>
      String(i.categoria_id) === String(filters.categoria)
    );
  }

  return data;
}, [inventario, filters]);

useEffect(() => {
  setProductoSeleccionado(null);
  setGraficoActivo(null); // 🔥 NUEVO
}, [filters.categoria]);
/* ======================= DATASETS ======================= */

const safeTopValor = Array.isArray(topValor) ? topValor : [];

const dataValor = useMemo(() => ({
  labels: safeTopValor.map(p => p.codigo_producto),
  datasets: [{
    data: safeTopValor.map(p => Number(p.valor_total_producto || 0)),

    backgroundColor: safeTopValor.map((_, i) =>
      i === activeIndexValor ? "#1d4ed8" : "#93c5fd"
    ),

    borderRadius: 6
  }]
}), [safeTopValor, activeIndexValor]);




const safeStock = Array.isArray(stockProductos) ? stockProductos : [];

const dataStock = useMemo(() => ({
  labels: safeStock.map(p => p.codigo_producto),
  datasets: [{
    data: safeStock.map(p => Number(p.stock_total_producto || 0)),

    backgroundColor: safeStock.map((_, i) =>
      i === activeIndexStock ? "#15803d" : "#86efac"
    ),

    borderRadius: 6
  }]
}), [safeStock, activeIndexStock]);

const getColorRotacion = (estado) => {
  if (!estado) return "#6b7280";

  const e = String(estado).toLowerCase();

  if (e.includes("inmovilizado")) return "#dc2626"; // 🔴 rojo
  if (e.includes("lenta")) return "#f59e0b";        // 🟡 amarillo
  if (e.includes("normal")) return "#16a34a";       // 🟢 verde

  return "#6b7280"; // gris fallback
};

const dataRotacion = useMemo(() => ({
  labels: rotacion.map(r => r.estado),
  datasets: [{
    data: rotacion.map(r => Number(r.total)),
    backgroundColor: rotacion.map(r => getColorRotacion(r.estado))
  }]
}), [rotacion]);

const dataEmpresas=useMemo(()=>({
  labels:empresasValor.map(e=>e.empresa),
  datasets:[{
    data:empresasValor.map(e=>Number(e.valor_inventario)),
    backgroundColor:"#2563eb",
    borderRadius:6
  }]
}),[empresasValor]);



const getRowColor = (() => {
  let lastCode = null;
  let toggle = false;

  return (codigo) => {
    if (codigo !== lastCode) {
      lastCode = codigo;
      toggle = !toggle;
    }

    return toggle ? "row-blue" : "row-white";
  };
})();

useEffect(() => {
  setPageValor(0);
}, [valorTopLimit, orderValor, pageSize]);

useEffect(() => {
  setPageStock(0);
}, [stockTopLimit, orderStock, pageSize]);


useEffect(() => {
  setActiveIndexValor(null);
  setActiveIndexStock(null);
}, [filters.categoria]);


/* ======================= LOADING ======================= */

if(loading){
  return <div className="dashboard-loading">Cargando...</div>;
}



const limpiarSeleccion = () => {
  setActiveIndexValor(null);
  setActiveIndexStock(null);

  setProductoSeleccionado(null);
  setGraficoActivo(null);

  setPageTabla(0);
  setSizeTabla(10);

  // 🔥 FORZAR REFRESH DE GRÁFICOS
  chartValorRef.current?.update();
  chartStockRef.current?.update();
};
/* ======================= UI ======================= */


const getCategoriaNombre = (id) => {
  const cat = categorias.find(
    c => String(c.categoria_id) === String(id)
  );
  return cat ? cat.categoria : "";
};


return(


  

<div className="inventory-dashboard">

{/* ================= KPIs ================= */}
<div className="kpi-header">
<div className="kpi-grid">

<div className="kpi-card">
<div className="kpi-title">Productos</div>
<div className="kpi-value">{kpis.productos}</div>
</div>

<div className="kpi-card">
<div className="kpi-title">Productos con stock</div>
<div className="kpi-value">{kpis.productos_con_stock}</div>
</div>

<div className="kpi-card">
<div className="kpi-title">Valor inventario</div>
<div className="kpi-value">{formatCurrency(kpis.valor)}</div>
</div>

<div className="kpi-card warning">
<div className="kpi-title">Inmovilizado</div>
<div className="kpi-value">{kpis.inmovilizado}</div>
</div>

<div className="kpi-card categoria-card">
  <div className="kpi-title">📦 Filtro de categoría</div>

  <div className="filter-row">



    <select
      className="categoria-select-modern"
      value={filters.categoria}
      onChange={(e) =>
        setFilters({ ...filters, categoria: e.target.value })
      }
    >
      <option value="">
        Todas las categorías
      </option>

      {categorias.map((c) => (
        <option key={c.categoria_id} value={c.categoria_id}>
          {c.categoria} | 🔵 Stock: {c.stock_total} | 🟢 {formatCurrency(c.valor_total)}
        </option>
      ))}
    </select>

        <button
      className="btn-clear-icon"
      onClick={limpiarSeleccion}
      title="Limpiar filtro"
    >
      <Trash2 size={18} />
    </button>



    

  </div>

      


</div>

{filters.categoria && (
  <div className="categoria-detalle">

    <div className="selected-categoria">
      {getCategoriaNombre(filters.categoria)}
    </div>

    <div className="categoria-info">
      {(() => {
        const cat = categorias.find(
          c => String(c.categoria_id) === String(filters.categoria)
        );

        if (!cat) return null;

        return (
          <>
            <span className="label-stock">
              Stock: {cat.stock_total}
            </span>

            <span className="label-valor">
              Valor: {formatCurrency(cat.valor_total)}
            </span>
          </>
        );
      })()}
    </div>

  </div>
)}

</div>
</div>

{/* ================= CHARTS ================= */}
<div className="charts-grid">

<div className={`chart-card ${graficoActivo === "valor" ? "chart-active" : ""}`}>
<div className="chart-header">
<h3>Inventario por valor</h3>

  <div className="chart-buttons">



  {/* ORDEN */}
 <button
  className={orderValor === "desc" ? "btn-active" : "btn"}
  onClick={() => setOrderValor("desc")}
>
  Mayor
</button>

<button
  className={orderValor === "asc" ? "btn-active" : "btn"}
  onClick={() => setOrderValor("asc")}
>
  Menor
</button>


  {/* TAMAÑO */}
  <select
    value={sizeValor}
    onChange={(e) => setSizeValor(Number(e.target.value))}
  >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
  </select>

</div>
</div>
<div className="chart-body">
    
<Bar 
  ref={chartValorRef}
  data={dataValor} 
  options={{
    ...baseChartOptions,

    layout: {
      padding: {
        top: 20 // 🔥 espacio arriba
      }
    },

    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        grace: "10%" // 🔥 espacio para labels
      }
    },

    plugins:{
      ...baseChartOptions.plugins,

      datalabels: {
        anchor: "end",
        align: "top",
        offset: 4,

        clamp: true,
        clip: false,

        color: "#111827",
        font: {
          weight: "bold",
          size: 10
        },

        display: (context) => {
          const total = context.dataset.data.length;

          if (total > 10) {
            return context.dataIndex % 2 === 0;
          }

          return true;
        },

        formatter: (value) => {
          if (value >= 1000) {
            return `S/ ${(value / 1000).toFixed(1)}K`;
          }
          return `S/ ${value}`;
        }
      }
    },



    onClick: handleBarClick
  }} 

/>
</div>

<div className="pagination-controls">
  <button
    onClick={() => setPageValor(p => Math.max(p - 1, 0))}
    disabled={pageValor === 0}
  >
    ◀ Anterior
  </button>

  <span>Página {pageValor + 1}</span>

  <button
    onClick={() => setPageValor(p => p + 1)}
    disabled={!hasMoreValor}
  >
    Siguiente ▶
  </button>
</div>
</div>

<div className={`chart-card ${graficoActivo === "stock" ? "chart-active" : ""}`}>
  <div className="chart-header">
    <h3>Inventario por stock</h3>
<div className="chart-buttons">



  {/* ORDEN */}
<button
  className={orderStock === "desc" ? "btn-active" : "btn"}
  onClick={() => setOrderStock("desc")}
>
  Mayor
</button>

<button
  className={orderStock === "asc" ? "btn-active" : "btn"}
  onClick={() => setOrderStock("asc")}
>
  Menor
</button>


  {/* TAMAÑO */}
  <select
    value={sizeStock}
    onChange={(e) => setSizeStock(Number(e.target.value))}
  >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
  </select>

</div>
  </div>

  <div className="chart-body">
    <Bar 
      ref={chartStockRef}
    
      data={dataStock} 
      options={{
        ...stockChartOptions,





        onClick: handleStockBarClick
      }}
    />
  </div>


<div className="pagination-controls">
  <button
    onClick={() => setPageStock(p => Math.max(p - 1, 0))}
    disabled={pageStock === 0}
  >
    ◀ Anterior
  </button>

  <span>Página {pageStock + 1}</span>

  <button
    onClick={() => setPageStock(p => p + 1)}
    disabled={!hasMoreStock}
  >
    Siguiente ▶
  </button>
</div>
</div>

<div className="chart-card">
<h3>Rotación inventario</h3>
<div className="chart-body">
<Pie 
  data={dataRotacion} 
  options={rotacionChartOptions}
/>
</div>
</div>

<div className="chart-card">
  <h3>Valor por empresa</h3>

  <div className="chart-body">
    <Bar
      data={dataEmpresas}
      options={empresaChartOptions}
    />
  </div>
</div>

</div>

{/* ================= TABLA ================= */}
<div className="tabla-inventario">

<h3>
Detalle inventario
{productoSeleccionado && ` - Producto ${productoSeleccionado}`}
{graficoActivo && ` (Filtrado desde ${graficoActivo})`}
</h3>

<div className="historial-container">
<div className="tabla tabla-stock-dashboard">

    <div className="pagination-controls">
  <button
    onClick={() => setPageTabla(p => Math.max(p - 1, 0))}
    disabled={pageTabla === 0}
  >
    ◀ Anterior
  </button>

  <span>Página {pageTabla + 1}</span>

  <button
    onClick={() => setPageTabla(p => p + 1)}
    disabled={!hasMoreTabla}
  >
    Siguiente ▶
  </button>
</div>

<div className="fila header">
<div>Codigo</div>
<div>Producto</div>
<div>Empresa</div>
<div>Almacen</div>
<div>Fabricante</div>
<div className="num">Stock</div>
<div className="num">Precio</div>
<div className="num">Valor</div>
<div>Dias</div>
<div>Rotacion</div>
</div>

{inventarioFiltrado.length===0?(
<div className="empty">No hay datos</div>
):(
inventarioFiltrado.map((row,i)=>(

    
  <div
    key={i}
    className={`fila ${getRowColor(row.codigo_producto)}`}
  >

<div>{row.codigo_producto}</div>
<div>{row.producto}</div>
<div>{row.empresa}</div>
<div>{row.almacen}</div>
<div>{row.fabricante}</div>

<div className="num">{row.stock_lote}</div>
<div className="num">{formatCurrency(row.precio_promedio_lote)}</div>
<div className="num strong">{formatCurrency(row.valor_lote)}</div>

<div>{row.dias_sin_movimiento}</div>

<div>
<span className={`estado estado-${row.estado_rotacion}`}>
{row.estado_rotacion}
</span>
</div>

</div>
))
)}

</div>
</div>

</div>

</div>

);
}