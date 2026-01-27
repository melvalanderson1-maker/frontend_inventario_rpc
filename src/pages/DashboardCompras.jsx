import React from "react";
import MenuCompras from "../components/admin_compras/MenuCompras";
import "../components/admin_compras/dashboardCompras.css";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function DashboardCompras() {
  const location = useLocation();
  const esHomeCompras = location.pathname === "/compras";

  return (
    <div style={{ display: "flex" }}>
      <MenuCompras />

      <main className="compras-main">
        <h1 className="compras-title">Panel de Compras</h1>
        <p className="compras-subtitle">
          Gestión de productos, movimientos de entrada y control de stock.
        </p>

        {/* 🔥 SOLO mostrar cards en /compras */}
        {esHomeCompras && (
          <div className="compras-dashboard-container">
            <div className="compras-grid">

              <Link className="compras-card" to="productos">
                <span className="emoji">📦</span>
                <h3>Productos</h3>
                <p>Ver y buscar productos</p>
              </Link>

              <Link className="compras-card" to="movimientos">
                <span className="emoji">🧾</span>
                <h3>Movimientos</h3>
                <p>Entradas y salidas</p>
              </Link>

              <Link className="compras-card" to="aprobaciones">
                <span className="emoji">✅</span>
                <h3>Aprobaciones</h3>
                <p>Pendientes de logística</p>
              </Link>

            </div>
          </div>
        )}

        {/* 👇 AQUÍ se renderizan productos / crear producto */}
        <Outlet />
      </main>
    </div>
  );
}
