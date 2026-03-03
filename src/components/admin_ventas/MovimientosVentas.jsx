import React, { useState } from "react";
import TablaPendientesCompras from "./tablaAllVentas/TablaPendientesVentas";
import TablaRechazadosCompras from "./tablaAllVentas/TablaRechazadosVentas";
import TablaAprobadosCompras from "./tablaAllVentas/TablaAprobadosVentas";
import TablaHistorialCompras from "./tablaAllVentas/TablaHistorialVentas";

import TablaStockCompleto from "./tablaAllVentas/TablaStockCompleto";

export default function MovimientosCompras() {
  const [tab, setTab] = useState("pendientes");

  return (
    <div className="ventas-page">
      <div className="page-header">
        <h1>Movimientos</h1>
        <p>Gestión de validaciones de logística</p>
      </div>

      <div className="tabs">
        <button className={tab === "pendientes" ? "active" : ""} onClick={() => setTab("pendientes")}>
          VALIDADOS POR LOGISTICA
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
        {tab === "pendientes" && <TablaPendientesCompras />}
        {tab === "rechazados" && <TablaRechazadosCompras />}
        {tab === "aprobados" && <TablaAprobadosCompras />}
        {tab === "cambios_almacen" && <TablaCambiosAlmacenPendientesCompras />}
        {tab === "historial" && <TablaHistorialCompras />}
        {tab === "stock" && <TablaStockCompleto />}
      </div>
    </div>
  );
}
