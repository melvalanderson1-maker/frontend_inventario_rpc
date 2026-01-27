import React from "react";
import MenuLogistica from "../components/admin_logistica/MenuLogistica";
import "../components/admin_logistica/dashboardLogistica.css";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function DashboardLogistica() {
  const location = useLocation();
  const esHome = location.pathname === "/logistica";

  return (
    <div style={{ display: "flex" }}>
      <MenuLogistica />

      <main className="logistica-main">
        <h1 className="logistica-title">Panel de Logística</h1>
        <p className="logistica-subtitle">
          Validación de movimientos, control de almacenes y transferencias.
        </p>

        {esHome && (
          <div className="logistica-dashboard-container">
            <div className="logistica-grid">

              <Link className="logistica-card" to="movimientos">
                <span className="emoji">🧾</span>
                <h3>Movimientos</h3>
                <p>Entradas y salidas pendientes</p>
              </Link>

              <Link className="logistica-card" to="aprobaciones">
                <span className="emoji">✅</span>
                <h3>Aprobaciones</h3>
                <p>Validar o rechazar movimientos</p>
              </Link>

              <Link className="logistica-card" to="cambio-almacen">
                <span className="emoji">🏬</span>
                <h3>Cambio de almacén</h3>
                <p>Transferencias entre almacenes</p>
              </Link>

            </div>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
