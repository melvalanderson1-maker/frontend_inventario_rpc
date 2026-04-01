import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./MenuCompras.css";

export default function MenuVentas({ open: propOpen, setOpen: setPropOpen }) {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [openLocal, setOpenLocal] = useState(propOpen ?? true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const controlled = typeof propOpen === "boolean" && typeof setPropOpen === "function";

  if (!usuario) return null;

  const esVentas = location.pathname.startsWith("/ventas");

  useEffect(() => {
    // Mantener el menú sincronizado con la ruta: si estamos en /ventas/* abrirlo,
    // si salimos de /ventas cerrarlo. Esto asegura que al entrar a movimientos
    // el menú quede visible y las tablas se muestren correctamente.
    if (controlled) {
      setPropOpen(esVentas);
    } else {
      setOpenLocal(esVentas);
    }
  }, [location.pathname]);

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    if (controlled) setPropOpen(!propOpen);
    else setOpenLocal(!openLocal);
  };

  // Al navegar desde el menú, solo cerrarlo en pantallas pequeñas
  const handleNavClick = () => {
    try {
      if (window.innerWidth <= 768) {
        if (controlled) setPropOpen(false);
        else setOpenLocal(false);
      }
    } catch (e) {
      // entorno seguro si window no existe
      if (controlled) setPropOpen(false);
      else setOpenLocal(false);
    }
  };

  const isOpen = controlled ? propOpen : openLocal;

  return (
    <>
      {!isOpen && (
        <button className="menu-toggle" onClick={toggleMenu} title="Mostrar menú" aria-label="Mostrar menú">
          ☰
        </button>
      )}

      <aside className={`menu-compras ${isOpen ? "open" : "closed"}`}>
        <button
          className="menu-collapse"
          onClick={toggleMenu}
          aria-label={isOpen ? "Ocultar menú" : "Mostrar menú"}
          aria-expanded={isOpen}
          title={isOpen ? "Ocultar menú" : "Mostrar menú"}
        >
          ‹
        </button>
        <div className="brand">Ventas</div>

        <nav>
          <NavLink to="/ventas" end onClick={handleNavClick}>
            Dashboard
          </NavLink>
          <NavLink to="/ventas/productos" onClick={handleNavClick}>
            Productos
          </NavLink>
          <NavLink to="/ventas/movimientos" onClick={handleNavClick}>
            Movimientos
          </NavLink>
          <NavLink to="/ventas/aprobaciones" onClick={handleNavClick}>
            Aprobaciones
          </NavLink>
          <NavLink to="/ventas/inventory" onClick={handleNavClick}>
            Reportes
          </NavLink>
        </nav>

        <div className="menu-footer">
          <div className="user-info">
            <span className="user-name">{usuario.nombre || usuario.email}</span>
            <span className="user-rol">{usuario.rol}</span>
          </div>

          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="logout-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <h3>¿Cerrar sesión?</h3>
            <p>Se cerrará tu sesión actual y deberás iniciar nuevamente.</p>
            <div className="logout-modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={confirmLogout}>Sí, cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}