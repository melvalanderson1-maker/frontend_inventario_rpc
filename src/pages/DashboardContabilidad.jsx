// src/pages/DashboardContabilidad.jsx
import React from "react";
import MenuContabilidad from "../components/admin_contabilidad/MenuContabilidad";
import "../components/admin_contabilidad/dashboardContabilidad.css";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function DashboardContabilidad() {
  const location = useLocation();
  const esHome = location.pathname === "/contabilidad";

  return (
    <div style={{ display: "flex" }}>
      <MenuContabilidad />

      <main className="contabilidad-main">
        <h1 className="contabilidad-title">Panel de Contabilidad</h1>
        <p className="contabilidad-subtitle">
          Validación de movimientos, control de estados y revisión histórica.
        </p>

        {esHome && (
          <div className="contabilidad-dashboard-container">
            <div className="contabilidad-grid">

              <Link className="contabilidad-card" to="pendientes">
                <span className="emoji">🕒</span>
                <h3>Pendientes</h3>
                <p>Movimientos por validar</p>
              </Link>

              <Link className="contabilidad-card" to="historial">
                <span className="emoji">📜</span>
                <h3>Historial</h3>
                <p>Revisión completa de movimientos</p>
              </Link>

            </div>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
