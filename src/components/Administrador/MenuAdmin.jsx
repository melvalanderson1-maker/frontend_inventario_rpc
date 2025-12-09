// src/components/Administrador/MenuAdmin.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./MenuAdmin.css";

export default function MenuAdmin() {
  return (
    <aside className="menu-admin">
      <div className="brand">UQUANTUM Admin</div>
      <nav>
        <NavLink to="/dashboard/admin" end>Dashboard</NavLink>
        <NavLink to="/dashboard/admin/usuarios">Usuarios</NavLink>
        <NavLink to="/dashboard/admin/docentes">Docentes</NavLink>
        <NavLink to="/dashboard/admin/secretarias">Secretarias</NavLink>
        <NavLink to="/dashboard/admin/alumnos">Alumnos</NavLink>
        <NavLink to="/dashboard/admin/cursos">Cursos</NavLink>
        <NavLink to="/dashboard/admin/secciones">Secciones</NavLink>
        <NavLink to="/dashboard/admin/pagos">Pagos</NavLink>
        <NavLink to="/dashboard/admin/facturas">Facturas</NavLink>
        <NavLink to="/dashboard/admin/auditoria">Auditoría</NavLink>
      </nav>
    </aside>
  );
}
