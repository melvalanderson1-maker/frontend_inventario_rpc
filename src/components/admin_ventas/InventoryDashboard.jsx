import { useEffect, useState } from "react";
import api from "../../api/api";

import { Bar, Pie } from "react-chartjs-2";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function InventoryDashboard() {
  const [kpis, setKpis] = useState({});
  const [topValor, setTopValor] = useState([]);
  const [rotacion, setRotacion] = useState([]);
  const [inventario, setInventario] = useState([]);

  const [empresas, setEmpresas] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [filters, setFilters] = useState({
    empresa: "",
    almacen: "",
    fabricante: ""
  });

  const [loading, setLoading] = useState(true);

  const formatCurrency = value =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value || 0);

  const buildQuery = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return params.toString();
  };

  const loadCatalogos = async () => {
    const [emp, alm, fab] = await Promise.all([
      api.get("/api/empresas"),
      api.get("/api/almacenes"),
      api.get("/api/fabricantes")
    ]);

    setEmpresas(emp.data || []);
    setAlmacenes(alm.data || []);
    setFabricantes(fab.data || []);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const query = buildQuery();
      const [kpisRes, topValorRes, rotacionRes, inventarioRes] = await Promise.all([
        api.get(`/api/dashboard/kpis?${query}`),
        api.get(`/api/dashboard/top-productos-valor?${query}`),
        api.get(`/api/dashboard/rotacion?${query}`),
        api.get(`/api/dashboard/inventario?${query}`)
      ]);

      setKpis(kpisRes.data || {});
      setTopValor(topValorRes.data || []);
      setRotacion(rotacionRes.data || []);
      setInventario(inventarioRes.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCatalogos();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  /* CLICK EN BARRA */
  const handleBarClick = (event, elements) => {
    if (!elements.length) return;
    const index = elements[0].index;
    const producto = topValor[index].codigo_producto;
    setProductoSeleccionado(producto);
  };

  /* FILTRO TABLA */
  const inventarioFiltrado = productoSeleccionado
    ? inventario.filter(i => String(i.codigo_producto) === String(productoSeleccionado))
    : inventario;

  /* DATA CHART */
  const dataValor = {
    labels: topValor.map(p => p.codigo_producto),
    datasets: [{
      label: "Valor inventario",
      data: topValor.map(p => Number(p.valor_total_producto)),
      backgroundColor: "#2563eb"
    }]
  };

  const dataRotacion = {
    labels: rotacion.map(r => r.estado),
    datasets: [{
      data: rotacion.map(r => Number(r.total)),
      backgroundColor: ["#3b82f6", "#60a5fa", "#93c5fd"]
    }]
  };

  if (loading) return <div className="dashboard-loading">Cargando dashboard...</div>;

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Inventario</h1>
        <span>Análisis ejecutivo de inventarios</span>
      </div>

      {/* FILTROS */}
      <div className="filters">
        <select value={filters.empresa} onChange={e => setFilters({ ...filters, empresa: e.target.value })}>
          <option value="">Todas empresas</option>
          {empresas.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
        </select>

        <select value={filters.almacen} onChange={e => setFilters({ ...filters, almacen: e.target.value })}>
          <option value="">Todos almacenes</option>
          {almacenes.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
        </select>

        <select value={filters.fabricante} onChange={e => setFilters({ ...filters, fabricante: e.target.value })}>
          <option value="">Todos fabricantes</option>
          {fabricantes.map(f => <option key={f.id} value={f.nombre}>{f.nombre}</option>)}
        </select>

        <button className="reset-btn" onClick={() => setProductoSeleccionado(null)}>Mostrar todos los productos</button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Productos</div>
          <div className="kpi-value">{kpis.productos}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Con stock</div>
          <div className="kpi-value">{kpis.con_stock}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Valor inventario</div>
          <div className="kpi-value">{formatCurrency(kpis.valor)}</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-title">Inmovilizado</div>
          <div className="kpi-value">{kpis.inmovilizado}</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Top productos por valor</h3>
          <Bar data={dataValor} options={{ onClick: handleBarClick, plugins: { legend: { display: false } } }} />
        </div>

        <div className="chart-card">
          <h3>Rotación inventario</h3>
          <div className="pie-container">
            <Pie data={dataRotacion} options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} />
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="tabla-inventario">
        <h3>Detalle inventario {productoSeleccionado && `- Producto ${productoSeleccionado}`}</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Producto</th>
                <th>Empresa</th>
                <th>Almacen</th>
                <th>Fabricante</th>
                <th>Stock lote</th>
                <th>Precio</th>
                <th>Valor lote</th>
                <th>Dias sin mov</th>
                <th>Rotacion</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((row, i) => (
                <tr key={i} className={productoSeleccionado && row.codigo_producto === productoSeleccionado ? "highlight-row" : ""}>
                  <td>{row.codigo_producto}</td>
                  <td>{row.producto}</td>
                  <td>{row.empresa}</td>
                  <td>{row.almacen}</td>
                  <td>{row.fabricante}</td>
                  <td>{row.stock_lote}</td>
                  <td>{row.precio_promedio_lote}</td>
                  <td>{formatCurrency(row.valor_lote)}</td>
                  <td>{row.dias_sin_movimiento}</td>
                  <td>{row.estado_rotacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}