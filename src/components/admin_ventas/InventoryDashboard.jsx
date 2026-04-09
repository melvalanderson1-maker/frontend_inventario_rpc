import { useEffect, useState, useMemo, useCallback } from "react";
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

export default function InventoryDashboard(){

/* =======================
STATE
======================= */

const [kpis,setKpis]=useState({});
const [topValor,setTopValor]=useState([]);
const [rotacion,setRotacion]=useState([]);
const [inventario,setInventario]=useState([]);
const [empresasValor,setEmpresasValor]=useState([]);
const [stockProductos,setStockProductos]=useState([]);

const [categorias,setCategorias]=useState([]);

const [valorTipo,setValorTipo]=useState("mayor");
const [stockTipo,setStockTipo]=useState("mayor");

const [limit,setLimit]=useState(10);

const [productoSeleccionado,setProductoSeleccionado]=useState(null);

const [abc,setABC]=useState([]);
const [heatmap,setHeatmap]=useState([]);

const [filters,setFilters]=useState({
categoria:""
});

const [loading,setLoading]=useState(true);


/* =======================
UTILS
======================= */

const formatCurrency=(value)=>
new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(value||0);


/* =======================
QUERY BUILDER
======================= */

const buildQuery=useCallback(()=>{

const params=new URLSearchParams();

Object.entries(filters).forEach(([k,v])=>{
if(v) params.append(k,v);
});

return params.toString();

},[filters]);


/* =======================
CARGAR CATEGORIAS
======================= */

const loadCategorias=async()=>{

try{

const res=await api.get("/api/dashboard/categorias-resumen");

const ordenadas=(res.data||[]).sort(
(a,b)=>b.stock_total-a.stock_total
);

setCategorias(ordenadas);

}catch(e){
console.error(e);
}

};


/* =======================
CARGAR DATA
======================= */

const loadData=async()=>{

setLoading(true);

try{

const query=buildQuery();

const [
kpisRes,
topValorRes,
rotacionRes,
inventarioRes,
stockRes,
empresasValorRes,
abcRes,
heatmapRes
]=await Promise.all([

api.get(`/api/dashboard/kpis?${query}`),

api.get(`/api/dashboard/top-productos-valor?tipo=${valorTipo}&limit=${limit}&${query}`),

api.get(`/api/dashboard/rotacion?${query}`),

api.get(`/api/dashboard/inventario?${query}`),

api.get(`/api/dashboard/productos-stock?tipo=${stockTipo}&limit=${limit}&${query}`),

api.get(`/api/dashboard/valor-por-empresa?${query}`),

api.get(`/api/dashboard/abc-inventario?${query}`),

api.get(`/api/dashboard/heatmap-almacenes?${query}`)

]);

setKpis(kpisRes.data||{});
setTopValor(topValorRes.data||[]);
setRotacion(rotacionRes.data||[]);
setInventario(inventarioRes.data||[]);
setStockProductos(stockRes.data||[]);
setEmpresasValor(empresasValorRes.data||[]);

setABC(abcRes.data||[]);
setHeatmap(heatmapRes.data||[]);

}catch(e){

console.error(e);

}

setLoading(false);

};


/* =======================
INIT
======================= */

useEffect(()=>{ loadCategorias(); },[]);

useEffect(()=>{
loadData();
},[filters,valorTipo,stockTipo,limit]);


/* =======================
CLICK BARRA
======================= */

const handleBarClick=useCallback((event,elements)=>{

if(!elements.length) return;

const index=elements[0].index;

if(!topValor[index]) return;

const producto=topValor[index].codigo_producto;

setProductoSeleccionado(producto);

window.scrollTo({
top:document.body.scrollHeight,
behavior:"smooth"
});

},[topValor]);


/* =======================
FILTRAR TABLA
======================= */

const inventarioFiltrado=useMemo(()=>{

if(!productoSeleccionado) return inventario;

return inventario.filter(
i=>String(i.codigo_producto)===String(productoSeleccionado)
);

},[inventario,productoSeleccionado]);


/* =======================
DATASETS
======================= */

const dataValor=useMemo(()=>({

labels:topValor.map(p=>p.codigo_producto),

datasets:[{
label:"Valor inventario",
data:topValor.map(p=>Number(p.valor_total_producto)),
backgroundColor:"#2563eb"
}]

}),[topValor]);


const dataStock=useMemo(()=>({

labels:stockProductos.map(p=>p.codigo_producto),

datasets:[{
label:"Stock",
data:stockProductos.map(p=>Number(p.stock_total_producto)),
backgroundColor:stockTipo==="mayor"?"#16a34a":"#dc2626"
}]

}),[stockProductos,stockTipo]);


const dataRotacion=useMemo(()=>({

labels:rotacion.map(r=>r.estado),

datasets:[{
data:rotacion.map(r=>Number(r.total)),
backgroundColor:["#16a34a","#f59e0b","#dc2626"]
}]

}),[rotacion]);


const dataEmpresas=useMemo(()=>({

labels:empresasValor.map(e=>e.empresa),

datasets:[{
label:"Valor inventario",
data:empresasValor.map(e=>Number(e.valor_inventario)),
backgroundColor:"#2563eb",
borderRadius:6,
barThickness:18
}]

}),[empresasValor]);


const totalABC = useMemo(
() => abc.reduce((sum,a)=>sum + Number(a.valor||0),0),
[abc]
);

const dataABC=useMemo(()=>({

labels:abc.map(a=>{

const porcentaje = totalABC
? ((Number(a.valor)/totalABC)*100).toFixed(1)
: 0;

if(a.categoria==="A") return `A - Críticos (${a.productos} productos | ${porcentaje}%)`;
if(a.categoria==="B") return `B - Importantes (${a.productos} productos | ${porcentaje}%)`;
return `C - Bajo impacto (${a.productos} productos | ${porcentaje}%)`;

}),

datasets:[{
label:"Valor inventario",
data:abc.map(a=>Number(a.valor)),
backgroundColor:["#dc2626","#f59e0b","#16a34a"]
}]

}),[abc,totalABC]);


/* =======================
LOADING
======================= */

if(loading)
return <div className="dashboard-loading">Cargando...</div>;


/* =======================
UI
======================= */

return(

<div className="inventory-dashboard">

{/* =======================
HEADER KPIS + FILTRO
======================= */}

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

{/* FILTRO CATEGORIA COMO KPI */}

<div className="kpi-card categoria-card">

<div className="kpi-title">
Categoría
</div>

<select
className="categoria-select"
value={filters.categoria}
onChange={(e)=>
setFilters({
...filters,
categoria:e.target.value
})
}
>

<option value="">Todas las categorias</option>

{categorias.map(c=>(

<option
key={c.categoria_id}
value={c.categoria_id}
>

{c.categoria} | 📦 {c.stock_total} | 💰 {formatCurrency(c.valor_total)}

</option>

))}

</select>

</div>

</div>

</div>


{/* =======================
CHARTS
======================= */}

<div className="charts-grid">

<div className="chart-card">

<div className="chart-header">

<h3>Inventario por valor</h3>

<div className="chart-buttons">

<button
className={valorTipo==="mayor"?"active":""}
onClick={()=>setValorTipo("mayor")}
>
Mayor
</button>

<button
className={valorTipo==="menor"?"active":""}
onClick={()=>setValorTipo("menor")}
>
Menor
</button>

</div>

</div>

<Bar
data={dataValor}
options={{
responsive:true,
maintainAspectRatio:false,
onClick:handleBarClick,
plugins:{legend:{display:false}}
}}
/>

</div>


<div className="chart-card">

<div className="chart-header">

<h3>Inventario por stock</h3>

<div className="chart-buttons">

<button
className={stockTipo==="mayor"?"active":""}
onClick={()=>setStockTipo("mayor")}
>
Mayor
</button>

<button
className={stockTipo==="menor"?"active":""}
onClick={()=>setStockTipo("menor")}
>
Menor
</button>

</div>

</div>

<Bar
data={dataStock}
options={{
responsive:true,
maintainAspectRatio:false,
plugins:{legend:{display:false}}
}}
/>

</div>


<div className="chart-card">

<h3>Rotación inventario</h3>

<Pie
data={dataRotacion}
options={{
plugins:{legend:{position:"bottom"}}
}}
/>

</div>


<div className="chart-card">

<h3>Valor inventario por empresa</h3>

<Bar
data={dataEmpresas}
options={{
responsive:true,
maintainAspectRatio:false,
indexAxis:'y',
plugins:{legend:{display:false}}
}}
/>

</div>




<div className="chart-card">

<h3>Matriz ABC Inventario</h3>

<Bar
data={dataABC}
options={{
responsive:true,
maintainAspectRatio:false,
plugins:{legend:{display:false}}
}}
/>

</div>



<div className="chart-card">

<h3>Inventario por almacén</h3>

<table className="heatmap-table">

<thead>
<tr>
<th>Almacen</th>
<th>Valor inventario</th>
</tr>
</thead>

<tbody>

{heatmap.map((a,i)=>{

let color="green";

if(a.valor_inventario>1000000) color="red";
else if(a.valor_inventario>300000) color="orange";

return(

<tr key={i}>

<td>{a.almacen}</td>

<td className={`heat-${color}`}>
{formatCurrency(a.valor_inventario)}
</td>

</tr>

);

})}

</tbody>

</table>

</div>

</div>


{/* =======================
TABLA
======================= */}

<div className="tabla-inventario">

<h3>
Detalle inventario
{productoSeleccionado&&` - Producto ${productoSeleccionado}`}
</h3>

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

{inventarioFiltrado.map((row,i)=>(

<tr
key={i}
className={
productoSeleccionado && row.codigo_producto===productoSeleccionado
? "highlight-row"
: ""
}
>

<td>{row.codigo_producto}</td>
<td>{row.producto}</td>
<td>{row.empresa}</td>
<td>{row.almacen}</td>
<td>{row.fabricante}</td>
<td>{row.stock_lote}</td>
<td>{formatCurrency(row.precio_promedio_lote)}</td>
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