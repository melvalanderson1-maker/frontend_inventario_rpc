import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { menuByRole } from "../../config/rolesConfig";
import "./MenuAdmin.css";

export default function MenuAdmin() {
  const { usuario } = useContext(AuthContext);
  const location = useLocation();

  // 🔑 abierto / cerrado
  const [open, setOpen] = useState(true);

  if (!usuario) return null;

  const menuItems = menuByRole[usuario.rol] || [];

  // 📌 detectar si estamos SOLO en dashboard
  const esDashboard =
    location.pathname === "/dashboard/admin";

  // 🎯 regla principal
  useEffect(() => {
    if (esDashboard) {
      setOpen(true);   // dashboard → menú visible
    } else {
      setOpen(false);  // otras vistas → menú oculto
    }
  }, [location.pathname]);

  return (
    <>
      {/* ☰ SOLO cuando menú está cerrado */}
      {!open && (
        <button
          className="menu-toggle"
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
      )}

      <aside className={`menu-admin ${open ? "open" : "closed"}`}>
        <div className="brand">Inventario</div>

        <nav>
          {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard/admin"}  // 🔑 CLAVE
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </NavLink>

          ))}
        </nav>
      </aside>
    </>
  );
}
