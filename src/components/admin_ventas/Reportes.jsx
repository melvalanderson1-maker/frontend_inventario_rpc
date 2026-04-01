import React, { useEffect, useState } from "react"
import {
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer
} from "recharts"

import api from "../../api/api"

export default function DashboardGerencialInventario(){

const [top,setTop]=useState(10)
const [mesesSinSalida,setMesesSinSalida]=useState(3)

const [mayorStock,setMayorStock]=useState([])
const [menorStock,setMenorStock]=useState([])
const [mayorValor,setMayorValor]=useState([])
const [menorValor,setMenorValor]=useState([])
const [sinSalida,setSinSalida]=useState([])

useEffect(()=>{
cargarDatos()
},[top,mesesSinSalida])

const cargarDatos = async()=>{

const [prodRes,movRes] = await Promise.all([
api.get("/api/compras/productos"),
api.get("/api/compras/movimientos/todos")
])

const productos = prodRes.data.productos
const movimientos = movRes.data

/*
SOLO MOVIMIENTOS QUE IMPACTAN INVENTARIO
*/

const movimientosValidos = movimientos.filter(m =>
m.estado === "VALIDADO_LOGISTICA" ||
m.estado === "APROBADO_FINAL"
)

calcularDashboard(productos,movimientosValidos)

}

const calcularDashboard = (productos, movimientos) => {

const lotes = {}

/*
IDENTIFICAR LOTES
*/

movimientos.forEach(m => {

const key = `${m.producto_id}_${m.empresa_id}_${m.almacen_id}_${m.fabricante_id || 0}`

if(!lotes[key]){

lotes[key] = {
producto_id: m.producto_id,
stock:0,
precio:0,
ultimaSalida:null,
ultimoMovimiento:null
}

}

const fecha = new Date(
m.fecha_validacion_logistica || m.fecha_creacion
)

/*
ULTIMO MOVIMIENTO DEL LOTE
*/

if(
!lotes[key].ultimoMovimiento ||
fecha > lotes[key].ultimoMovimiento
){
lotes[key].ultimoMovimiento = fecha
}

/*
ENTRADAS Y SALDO INICIAL
*/

if(m.tipo_movimiento === "entrada" || m.tipo_movimiento === "saldo_inicial"){

lotes[key].stock += Number(m.cantidad)

if(m.precio){
lotes[key].precio = Number(m.precio)
}

}

/*
SALIDAS
*/

if(m.tipo_movimiento === "salida"){

lotes[key].stock -= Number(m.cantidad)

if(
!lotes[key].ultimaSalida ||
fecha > lotes[key].ultimaSalida
){
lotes[key].ultimaSalida = fecha
}

}

})

/*
CONVERTIR LOTES A ARRAY
*/

const lotesArray = Object.values(lotes)

/*
CALCULAR MESES SIN SALIDA POR LOTE
*/

lotesArray.forEach(lote => {

let fechaBase

if(lote.ultimaSalida){
fechaBase = lote.ultimaSalida
}else{
fechaBase = lote.ultimoMovimiento
}

const diff = (new Date() - fechaBase)/(1000*60*60*24*30)

lote.mesesSinSalida = Math.floor(diff)

})

/*
AGRUPAR POR PRODUCTO
*/

const productosMap = {}

lotesArray.forEach(lote => {

if(!productosMap[lote.producto_id]){

productosMap[lote.producto_id] = {
stock:0,
valor:0,
mesesSinVenta:0
}

}

productosMap[lote.producto_id].stock += lote.stock
productosMap[lote.producto_id].valor += lote.stock * lote.precio

/*
TOMAR EL LOTE MAS ANTIGUO SIN SALIDA
*/

if(lote.mesesSinSalida > productosMap[lote.producto_id].mesesSinVenta){

productosMap[lote.producto_id].mesesSinVenta = lote.mesesSinSalida

}

})

/*
CONSTRUIR DATASET
*/

const dataset = productos.map(p => {

const data = productosMap[p.id] || {}

return {
id:p.id,
nombre:p.descripcion?.substring(0,40) || "Sin nombre",
stock:data.stock || 0,
valor:data.valor || 0,
mesesSinVenta:data.mesesSinVenta || 0
}

})

/*
TOP MAYOR STOCK
*/

setMayorStock(
[...dataset]
.sort((a,b)=>b.stock-a.stock)
.slice(0,top)
)

/*
MENOR STOCK
*/

setMenorStock(
[...dataset]
.sort((a,b)=>a.stock-b.stock)
.slice(0,top)
)

/*
MAYOR VALOR
*/

setMayorValor(
[...dataset]
.sort((a,b)=>b.valor-a.valor)
.slice(0,top)
)

/*
MENOR VALOR
*/

setMenorValor(
[...dataset]
.sort((a,b)=>a.valor-b.valor)
.slice(0,top)
)

/*
PRODUCTOS CON MAS TIEMPO SIN SALIDA
*/

setSinSalida(
dataset
.filter(p=>p.mesesSinVenta >= mesesSinSalida)
.sort((a,b)=>b.mesesSinVenta-a.mesesSinVenta)
.slice(0,top)
)

}

return(

<div style={{padding:30}}>

<h1>📊 Dashboard Gerencial de Inventario</h1>

<div style={{marginBottom:20}}>

<label>Top productos: </label>

<select
value={top}
onChange={e=>setTop(Number(e.target.value))}
>
<option value={10}>Top 10</option>
<option value={20}>Top 20</option>
<option value={30}>Top 30</option>
</select>

<label style={{marginLeft:20}}>Meses sin salida:</label>

<select
value={mesesSinSalida}
onChange={e=>setMesesSinSalida(Number(e.target.value))}
>
<option value={1}>1 mes</option>
<option value={2}>2 meses</option>
<option value={3}>3 meses</option>
<option value={6}>6 meses</option>
</select>

</div>

<h2>📦 Productos con Mayor Stock</h2>

<ResponsiveContainer width="100%" height={350}>
<BarChart data={mayorStock}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="nombre"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="stock"/>
</BarChart>
</ResponsiveContainer>

<h2>⚠️ Productos con Menor Stock</h2>

<ResponsiveContainer width="100%" height={350}>
<BarChart data={menorStock}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="nombre"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="stock"/>
</BarChart>
</ResponsiveContainer>

<h2>💰 Productos con Mayor Valor en Inventario</h2>

<ResponsiveContainer width="100%" height={350}>
<BarChart data={mayorValor}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="nombre"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="valor"/>
</BarChart>
</ResponsiveContainer>

<h2>💸 Productos con Menor Valor en Inventario</h2>

<ResponsiveContainer width="100%" height={350}>
<BarChart data={menorValor}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="nombre"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="valor"/>
</BarChart>
</ResponsiveContainer>

<h2>📉 Productos con más tiempo sin salida</h2>

<ResponsiveContainer width="100%" height={350}>
<BarChart data={sinSalida}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="nombre"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="mesesSinVenta"/>
</BarChart>
</ResponsiveContainer>

</div>

)

}