// src/pages/DashboardAdmin.jsx (updated)
import React from "react";
import MenuAdmin from "../components/Administrador/MenuAdmin";
import "../components/Administrador/adminDashboard.css";
import { Outlet } from "react-router-dom"; // if you want nested routes
export default function DashboardAdmin() {
  return (
    <div style={{ display: "flex" }}>
      <MenuAdmin />
      <main style={{ marginLeft: 240, padding: 24, width: "100%" }}>
        <h1>Panel de Administración</h1>
        <p>Gestiona todos los elementos del sistema académico desde un solo lugar.</p>
        {/* If you want the grid of cards on the main page, keep your admin-dashboard-container here */}
        <div className="admin-dashboard-container"> {/* ...cards... */} </div>

        {/* If using nested routes, include <Outlet/> here */}
      </main>
    </div>
  );
}
