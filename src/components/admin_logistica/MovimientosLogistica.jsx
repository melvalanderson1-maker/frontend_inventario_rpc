import React, { useState } from "react";
import TablaPendientesLogistica from "./tablas/TablaPendientesLogistica";
import TablaAprobadosLogistica from "./tablas/TablaAprobadosLogistica";
import TablaHistorial from "./tablas/TablaHistorial";
import "./MovimientosLogistica.css";

export default function MovimientosLogistica() {
  const [tab, setTab] = useState("pendientes");

  return (
    <div className="logistica-page">
      <div className="page-header">
        <h1>Movimientos</h1>
        <p>Gestión de entradas, salidas y validaciones de almacén</p>
      </div>

      <div className="tabs">
        <button
          className={tab === "pendientes" ? "active" : ""}
          onClick={() => setTab("pendientes")}
        >
          Pendientes
        </button>
        <button
          className={tab === "aprobados" ? "active" : ""}
          onClick={() => setTab("aprobados")}
        >
          Aprobados
        </button>
        <button
          className={tab === "historial" ? "active" : ""}
          onClick={() => setTab("historial")}
        >
          Historial
        </button>
      </div>

      <div className="tab-content">
        {tab === "pendientes" && <TablaPendientesLogistica />}
        {tab === "aprobados" && <TablaAprobadosLogistica />}
        {tab === "historial" && <TablaHistorial />}
      </div>
    </div>
  );
}
