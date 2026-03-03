import React from "react";
import MenuVentas from "../components/admin_ventas/MenuVentas";
import "../components/admin_compras/dashboardCompras.css";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function DashboardVentas() {
  const location = useLocation();
  const esHomeCompras = location.pathname === "/ventas";

  return (
    <div style={{ display: "flex" }}>
      <MenuVentas />

      <main className="compras-main">
        <h1 className="compras-title">Panel de Ventas</h1>
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
