import React, { useState } from "react";
import TablaPendientesContabilidad from "./tablaAllConta/TablaPendientesContabilidad";
import TablaRechazadosContabilidad from "./tablaAllConta/TablaRechazadosContabilidad";
import TablaAprobadosContabilidad from "./tablaAllConta/TablaAprobadosContabilidad";
import TablaHistorialContabilidad from "./tablaAllConta/TablaHistorialContabilidad";
import TablaCambiosAlmacenPendientesContabilidad from "./tablaAllConta/TablaCambiosAlmacenPendientesContabilidad";
//import "./MovimientosLogistica.css";


export default function MovimientosLogistica() {
  const [tab, setTab] = useState("pendientes");

  return (
    <div className="logistica-page">
      <div className="page-header">
        <h1>Movimientos</h1>
        <p>Gestión de validaciones de logística</p>
      </div>

      <div className="tabs">
        <button className={tab === "pendientes" ? "active" : ""} onClick={() => setTab("pendientes")}>
          Pendientes
        </button>
        <button className={tab === "rechazados" ? "active" : ""} onClick={() => setTab("rechazados")}>
          Rechazados
        </button>
        <button className={tab === "aprobados" ? "active" : ""} onClick={() => setTab("aprobados")}>
          Aprobados
        </button>
        <button className={tab === "cambios_almacen" ? "active" : ""} onClick={() => setTab("cambios_almacen")}>
          Cambios de almacén
        </button>
        <button className={tab === "historial" ? "active" : ""} onClick={() => setTab("historial")}>
          Historial
        </button>
      </div>

      <div className="tab-content">
        {tab === "pendientes" && <TablaPendientesContabilidad />}
        {tab === "rechazados" && <TablaRechazadosContabilidad />}
        {tab === "aprobados" && <TablaAprobadosContabilidad />}
        {tab === "cambios_almacen" && <TablaCambiosAlmacenPendientesContabilidad />}
        {tab === "historial" && <TablaHistorialContabilidad />}
      </div>
    </div>
  );
}
