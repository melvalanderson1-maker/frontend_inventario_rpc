import React, { useState } from "react";
import MenuVentas from "../components/admin_ventas/MenuVentas";
import "../components/admin_compras/dashboardCompras.css";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function DashboardVentas() {
  const location = useLocation();
  const esHomeVentas = location.pathname === "/ventas";

  // 🔥 Estado global del menú
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <div style={{ display: "flex" }}>
      {/* Pasamos open y setOpen al menú */}
      <MenuVentas open={menuOpen} setOpen={setMenuOpen} />

            <main className={`compras-main ${!menuOpen ? "full" : ""}`}>

        
         <p className={`compras-subtitle ${!menuOpen ? "subtitle-offset" : ""}`}>
           Gestión de productos, movimientos de entrada y control de stock.
         </p>

        {esHomeVentas && (
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

        <Outlet />
      </main>
    </div>
  );
}