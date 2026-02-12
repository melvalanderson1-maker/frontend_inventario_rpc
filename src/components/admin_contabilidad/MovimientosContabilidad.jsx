import React, { useState } from "react";
import TablaPendientesContabilidad from "./tablaAllConta/TablaPendientesContabilidad";
import TablaRechazadosContabilidad from "./tablaAllConta/TablaRechazadosContabilidad";
import TablaAprobadosContabilidad from "./tablaAllConta/TablaAprobadosContabilidad";
import TablaHistorialContabilidad from "./tablaAllConta/TablaHistorialContabilidad";
import TablaCambiosAlmacenPendientesContabilidad from "./tablaAllConta/TablaCambiosAlmacenPendientesContabilidad";
import TablaStockCompleto from "./tablaAllConta/TablaStockCompleto";
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
          VALIDAR MOVIMIENTOS
        </button>
        <button className={tab === "aprobados" ? "active" : ""} onClick={() => setTab("aprobados")}>
          RECHAZADOS Y APROBADOS POR CONTABILIDAD
        </button>
        <button className={tab === "rechazados" ? "active" : ""} onClick={() => setTab("rechazados")}>
          RECHAZADOS POR LOGÍSTICA
        </button>

        <button className={tab === "cambios_almacen" ? "active" : ""} onClick={() => setTab("cambios_almacen")}>
          CAMBIOS DE ALMACÉN
        </button>
        <button className={tab === "historial" ? "active" : ""} onClick={() => setTab("historial")}>
          HISTORIAL
        </button>
        <button
          className={tab === "stock" ? "active" : ""}
          onClick={() => setTab("stock")}
        >
          STOCK GENERAL
        </button>
      </div>

      <div className="tab-content">
        {tab === "pendientes" && <TablaPendientesContabilidad />}
        {tab === "rechazados" && <TablaRechazadosContabilidad />}
        {tab === "aprobados" && <TablaAprobadosContabilidad />}
        {tab === "cambios_almacen" && <TablaCambiosAlmacenPendientesContabilidad />}
        {tab === "historial" && <TablaHistorialContabilidad />}
        {tab === "stock" && <TablaStockCompleto />}
      </div>
    </div>
  );
}
