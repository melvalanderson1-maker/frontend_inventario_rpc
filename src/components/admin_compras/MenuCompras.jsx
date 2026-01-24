import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./MenuCompras.css";

export default function MenuCompras() {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!usuario) return null;

  // Detecta cualquier ruta /compras/*
  const esCompras = location.pathname.startsWith("/compras");

  useEffect(() => {
    setOpen(esCompras);
  }, [location.pathname]);

  const confirmLogout = () => {
    logout();                // 🔥 borra token + usuario
    navigate("/login");      // 🔥 redirige
  };

  return (
    <>
      {!open && (
        <button className="menu-toggle" onClick={() => setOpen(true)}>
          ☰
        </button>
      )}

      <aside className={`menu-compras ${open ? "open" : "closed"}`}>
        <div className="brand">Compras</div>

        <nav>
          <NavLink to="/compras" end onClick={() => setOpen(false)}>
            Dashboard
          </NavLink>

          <NavLink to="/compras/productos" onClick={() => setOpen(false)}>
            Productos
          </NavLink>

          <NavLink to="/compras/movimientos" onClick={() => setOpen(false)}>
            Movimientos
          </NavLink>

          <NavLink to="/compras/aprobaciones" onClick={() => setOpen(false)}>
            Aprobaciones
          </NavLink>
        </nav>

        {/* ===== FOOTER USUARIO ===== */}
        <div className="menu-footer">
          <div className="user-info">
            <span className="user-name">{usuario.nombre || usuario.email}</span>
            <span className="user-rol">{usuario.rol}</span>
          </div>

          <button
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ================= MODAL LOGOUT ================= */}
      {showLogoutModal && (
        <div className="logout-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <h3>¿Cerrar sesión?</h3>
            <p>Se cerrará tu sesión actual y deberás iniciar nuevamente.</p>

            <div className="logout-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </button>

              <button
                className="btn-confirm"
                onClick={confirmLogout}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
