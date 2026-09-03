import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import api from "../../api/api";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Trash2 } from "lucide-react";
import { ArrowUp, ArrowDown, DollarSign } from "lucide-react";
import InventoryChartsSection from "./InventoryChartsSection";


import { resolveImageUrl } from "../../utils/imageUrl";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,   // 🔥 AGREGA ESTO
  LineElement,    // 🔥 AGREGA ESTO
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
  PointElement,  // 🔥
  LineElement,   // 🔥
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

const [evolucionInventario, setEvolucionInventario] = useState([]);


const [valorMensual, setValorMensual] = useState([]);

const [resumenMensual, setResumenMensual] = useState([]);


const [imagenPreview, setImagenPreview] = useState(null);


const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const dataValorMensual = useMemo(() => {
  return {
    labels: resumenMensual.map(r =>
      MESES[Number(r.mes.split("-")[1]) - 1]
    ),
    datasets: [
      {
        label: "Valor inventario",
        data: resumenMensual.map(r => Number(r.valor)),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22,163,74,0.2)",
        tension: 0.3
      }
    ]
  };
}, [resumenMensual]);

// 🔥 NUEVOS (IMPORTANTE)
const [entradasSalidas, setEntradasSalidas] = useState({});
const [sinMovimiento, setSinMovimiento] = useState([]);
const [rankingAntiguedad, setRankingAntiguedad] = useState([]);

// 🔥 DETALLE MOVIMIENTOS
const [movimientosProducto, setMovimientosProducto] = useState([]);



const totalEntradas = Number(entradasSalidas?.unidades_entrada ?? 0);
const totalSalidas = Number(entradasSalidas?.unidades_salida ?? 0);

const totalMovEntradas = entradasSalidas.movimientos_entrada || 0;
const totalMovSalidas = entradasSalidas.movimientos_salida || 0;




const [loading,setLoading]=useState(true);






const [comparacionMes, setComparacionMes] = useState({
  actual: {},
  anterior: {}
});


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


const [stockInicial, setStockInicial] = useState(0);



const stockFinal = stockInicial + totalEntradas - totalSalidas;




const [graficoActivo, setGraficoActivo] = useState(null);
// valores: "valor" | "stock" | null

// ================= FILTRO GLOBAL (solo si quieres) =================
const [filters, setFilters] = useState({ categoria: "" });

const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};

const [mes, setMes] = useState(getCurrentMonth());

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

      if (!label) return "";

      const str = String(label);

      const chunkSize = 15;
      const result = [];

      for (let i = 0; i < str.length; i += chunkSize) {
        result.push(str.substring(i, i + chunkSize));
      }

      return result;
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

  params.append("mes", mes);

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

    const [
      kpisRes,
      rotacionRes,
      empresasValorRes,
      abcRes,
      heatmapRes,
      evolucionRes
    ] = await Promise.all([
      api.get(`/api/dashboard/kpis?${query}`),
      api.get(`/api/dashboard/rotacion?${query}`),
      api.get(`/api/dashboard/valor-por-empresa?${query}`),
      api.get(`/api/dashboard/abc-inventario?${query}`),
      api.get(`/api/dashboard/heatmap-almacenes?${query}`),
      api.get(`/api/dashboard/evolucion-inventario?${query}`)
    ]);




    setEvolucionInventario(evolucionRes.data || []);

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


  const loadValorMensual = async () => {
    try {
      const res = await api.get(
        `/api/dashboard/valor-inventario-mensual?${buildQuery()}`
      );

      setValorMensual(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };




const loadExtras = async () => {
  try {
    const queryActual = buildQuery();

    let mesAnterior = "";

    if (mes) {
      const [y, m] = mes.split("-").map(Number);

      const date = new Date(y, m - 1);
      date.setMonth(date.getMonth() - 1);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      mesAnterior = `${year}-${month}`;
    }

    const queryAnterior = new URLSearchParams({
      ...Object.fromEntries(new URLSearchParams(queryActual)),
      mes: mesAnterior
    }).toString();

    const [actual, anterior] = await Promise.all([
      api.get(`/api/dashboard/entradas-salidas?${queryActual}`),
      api.get(`/api/dashboard/entradas-salidas?${queryAnterior}`)
    ]);

    const [valorActual, valorAnterior] = await Promise.all([
      api.get(`/api/dashboard/valor-inventario?${queryActual}`),
      api.get(`/api/dashboard/valor-inventario?${queryAnterior}`)
    ]);

    setEntradasSalidas(actual.data || {});

    setComparacionMes({
      actual: {
        entradas: actual.data?.unidades_entrada || 0,
        salidas: actual.data?.unidades_salida || 0,
        valor: valorActual.data?.valor_final || 0
      },
      anterior: {
        entradas: anterior.data?.unidades_entrada || 0,
        salidas: anterior.data?.unidades_salida || 0,
        valor: valorAnterior.data?.valor_final || 0
      }
    });

  } catch (e) {
    console.error(e);
  }
};




const loadResumen12Meses = async () => {
  try {

    const year = new Date().getFullYear();

    // 🔥 GENERAR ENERO → DICIEMBRE (FIJO)
    const meses = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, "0");
      return `${year}-${month}`;
    });

    const resultados = await Promise.all(
      meses.map(async (mesItem) => {

        // 🔥 SOLO USA CATEGORÍA (NO ARRASTRES OTROS FILTROS)
        const params = new URLSearchParams();

        if (filters.categoria) {
          params.append("categoria", filters.categoria);
        }

        params.append("mes", mesItem);

        const query = params.toString();

        try {
          const [movRes, valorRes] = await Promise.all([
            api.get(`/api/dashboard/entradas-salidas?${query}`),
            api.get(`/api/dashboard/valor-inventario?${query}`)
          ]);

        return {
          mes: mesItem,

          inicial: Number(movRes.data?.unidades_inicial || 0),
          entradas: Number(movRes.data?.unidades_entrada || 0),
          salidas: Number(movRes.data?.unidades_salida || 0),

          monto_inicial: Number(movRes.data?.monto_inicial || 0),
          monto_entrada: Number(movRes.data?.monto_entrada || 0),
          monto_salida: Number(movRes.data?.monto_salida || 0),

          movimientos_inicial: Number(movRes.data?.movimientos_inicial || 0),
          movimientos_entrada: Number(movRes.data?.movimientos_entrada || 0),
          movimientos_salida: Number(movRes.data?.movimientos_salida || 0),

          valor: Number(valorRes.data?.valor_final || 0)
        };

        } catch (err) {
          console.error("Error en mes:", mesItem, err);

          // 🔥 fallback seguro
          return {
            mes: mesItem,
            entradas: 0,
            salidas: 0,
            valor: 0
          };
        }

      })
    );

    // 🔥 ORDENAR POR MES (por si acaso)
    resultados.sort((a, b) => a.mes.localeCompare(b.mes));

    setResumenMensual(resultados);

  } catch (e) {
    console.error("ERROR GENERAL:", e);
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

const loadResumenMensual = async () => {
  try {
    const year = new Date().getFullYear();

    const res = await api.get(
      `/api/dashboard/entradas-salidas-anual?anio=${year}`
    );

    setResumenMensual(res.data || []);

  } catch (e) {
    console.error(e);
  }
};

const loadMovimientosProducto = async (productoId) => {
  if (!productoId) return; // 🔥 evita undefined

  try {
    const res = await api.get(`/api/dashboard/movimientos-producto/${productoId}`);
    setMovimientosProducto(res.data || []);
  } catch (e) {
    console.error(e);
  }
};



// reset páginas cuando cambia filtro
useEffect(() => {
  setPageValor(0);
  setPageStock(0);
  setPageTabla(0);
}, [filters, mes]);


// 🔥 RESET CUANDO CAMBIA MES (IMPORTANTE)
useEffect(() => {
  setPageValor(0);
  setPageStock(0);
  setPageTabla(0);

  setProductoSeleccionado(null);
  setGraficoActivo(null);
}, [mes]);

useEffect(() => {
  loadCategorias();
}, []);

useEffect(() => {
  loadResumen();
  loadResumen12Meses();
}, [filters, mes]);

useEffect(() => {
  loadValorMensual();
}, [filters, mes]);


useEffect(() => {
  loadExtras();
}, [filters, mes]);

useEffect(() => {
  loadTopValor();
}, [pageValor, sizeValor, orderValor, filters, mes]);

useEffect(() => {
  loadStock();
}, [pageStock, sizeStock, orderStock, filters, mes]);

useEffect(() => {
  loadTabla();
}, [pageTabla, sizeTabla, filters, productoSeleccionado, graficoActivo, mes]);


useEffect(() => {
  return () => {
    ChartJS.getChart("canvas")?.destroy();
  };
}, []);
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
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setImagenPreview(null);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);




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
  labels: (safeTopValor || []).map(p =>
    String(p?.codigo_producto ?? "SIN CODIGO")
  ),
  datasets: [{
    data: safeTopValor.map(p => Number(p.valor_total_producto ?? 0)),
    backgroundColor: safeTopValor.map((_, i) =>
      i === activeIndexValor ? "#1d4ed8" : "#93c5fd"
    ),
    borderRadius: 6
  }]
}), [safeTopValor, activeIndexValor]);




const safeStock = Array.isArray(stockProductos) ? stockProductos : [];

const dataStock = useMemo(() => ({
  labels: (safeStock || []).map(p =>
    String(p?.codigo_producto ?? "SIN CODIGO")
  ),
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
  labels: (rotacion || []).map(r =>
    String(r?.estado ?? "SIN ESTADO")
  ),
  datasets: [{
    data: rotacion.map(r => Number(r.total)),
    backgroundColor: rotacion.map(r => getColorRotacion(r.estado))
  }]
}), [rotacion]);

const dataEmpresas=useMemo(()=>({
  labels: (empresasValor || []).map(e =>
    String(e?.empresa ?? "SIN EMPRESA")
  ),
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


  {loading && (
  <div className="dashboard-overlay-loader">

    <div className="dashboard-loader-card">

      <div className="spinner"></div>

      <div className="loader-title">
        Cargando dashboard
      </div>

      <div className="loader-subtitle">
        Procesando inventario y métricas...
      </div>

    </div>

  </div>
)}

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



<div className="timeline-meses">
  {resumenMensual.map((m, i) => {

    const mesActual = new Date().toISOString().slice(0, 7);
    const esMesActual = m.mes === mesActual;

    const mesIndex = Number(m.mes.split("-")[1]) - 1;

    return (
      <div
          key={i}
          className={`timeline-card ${esMesActual ? "mes-actual" : ""}`}
        >
        <div className="timeline-mes">{MESES[mesIndex]}</div>

        <div className="timeline-data">

          {/* 🟣 SALDO INICIAL (solo se muestra si hubo movimientos ese mes) */}
          {m.movimientos_inicial > 0 && (
            <div className="inicial">
              ● {m.inicial} <span className="monto">({formatCurrency(m.monto_inicial)})</span>
            </div>
          )}

          {/* 🔵 CANTIDAD + MONTO */}
          <div className="entrada">
            ↑ {m.entradas} <span className="monto">({formatCurrency(m.monto_entrada)})</span>
          </div>
          <div className="salida">
            ↓ {m.salidas} <span className="monto">({formatCurrency(m.monto_salida)})</span>
          </div>

          {/* 🟡 MOVIMIENTOS */}
          <div className="movimientos">
            Mov: {m.movimientos_inicial} / {m.movimientos_entrada} / {m.movimientos_salida}
          </div>

          <div className="valor">{formatCurrency(m.valor)}</div>

        </div>
      </div>
    );
  })}
</div>






{/* ================= CHARTS SEPARADOS ================= */}
<InventoryChartsSection />



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
  key={`valor-${pageValor}-${sizeValor}-${orderValor}-${mes}-${filters.categoria}`}
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
<div
  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
  onClick={() => loadMovimientosProducto(row.producto_id)}
>

 
  <img
    src={resolveImageUrl({
      storage_provider: row.storage_provider,
      storage_key: row.storage_key
    })}
    alt="producto"

    onClick={() =>
      setImagenPreview(
        resolveImageUrl({
          storage_provider: row.storage_provider,
          storage_key: row.storage_key
        })
      )
    }
    onError={(e) => {
      e.target.src = "/no-image.png"; // opcional fallback
    }}
    style={{
      width: 40,
      height: 40,
      objectFit: "cover",
      borderRadius: 6
    }}
  />
  {row.producto}
</div>
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

{movimientosProducto.length > 0 && (
  <div className="movimientos-box">
    <h3>Movimientos del producto</h3>

    <div className="tabla">
      <div className="fila header">
        <div>Tipo</div>
        <div>Cantidad</div>
        <div>Precio</div>
        <div>Estado</div>
        <div>Fecha</div>
      </div>

      {movimientosProducto.map((m, i) => (
        <div key={i} className="fila">
          <div>{m.tipo_movimiento}</div>
          <div>{m.cantidad}</div>
          <div>{formatCurrency(m.precio)}</div>
          <div>{m.estado}</div>
          <div>{m.fecha}</div>
        </div>
      ))}
    </div>
  </div>
)}

</div>


{imagenPreview && (
  <div
    className="image-modal-overlay"
    onClick={() => setImagenPreview(null)}
  >
    <img
      src={imagenPreview}
      alt="preview"
      className="image-modal"
      onClick={(e) => e.stopPropagation()} // evita cerrar al hacer click en la imagen
    />
  </div>
)}

</div>

);
}