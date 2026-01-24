import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./MenuContabilidad.css";

export default function MenuContabilidad() {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!usuario) return null;

  const esContabilidad = location.pathname.startsWith("/contabilidad");

    useEffect(() => {
    setOpen(esContabilidad);
    }, [location.pathname]);


  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {!open && (
        <button className="menu-toggle" onClick={() => setOpen(true)}>
          ☰
        </button>
      )}

      <aside className={`menu-contabilidad ${open ? "open" : "closed"}`}>
        <div className="brand">Contabilidad</div>


        <nav>
          <NavLink to="/contabilidad" end>
            Dashboard
          </NavLink>

          <NavLink to="/contabilidad/productos">
            Productos
          </NavLink>


          <NavLink to="/contabilidad/movimientos">
            Movimientos
          </NavLink>

          <NavLink to="/contabilidad/aprobaciones">
            Aprobaciones
          </NavLink>

          <NavLink to="/contabilidad/cambio-almacen">

            Cambio de almacén
          </NavLink>
        </nav>

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

      {showLogoutModal && (
        <div className="logout-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <h3>¿Cerrar sesión?</h3>
            <p>Se cerrará tu sesión actual.</p>

            <div className="logout-modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </button>
              <button className="btn-confirm" onClick={confirmLogout}>
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
