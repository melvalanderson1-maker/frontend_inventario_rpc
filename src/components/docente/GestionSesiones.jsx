// src/pages/docente/GestionSesiones.jsx
import React, { useEffect, useState } from "react";
import docentesApi from "../../api/docentesApi";
import "./GestionSesiones.css";

export default function GestionSesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSesiones();
  }, []);

  const fetchSesiones = async () => {
    setLoading(true);
    try {
      // suponemos que el backend puede identificar al docente con token,
      // si no, necesitarás pasar el id del docente aquí.
      const res = await docentesApi.listarSesionesDocente("me"); // si tu backend soporta 'me', o reemplazar por id
      setSesiones(res.data.sesiones || []);
    } catch (err) {
      console.error(err);
      alert("Error cargando sesiones");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gestion-sesiones">
      <header>
        <h2>Gestión de Sesiones</h2>
        <p className="muted">Aquí puedes ver y administrar tus sesiones programadas.</p>
      </header>

      {loading ? <p>Cargando...</p> : (
        <div className="sesiones-list">
          {sesiones.length === 0 ? <div className="empty">No hay sesiones programadas</div> :
            sesiones.map(s => (
              <div className="sesion-card" key={s.id}>
                <div className="sesion-left">
                  <div className="sesion-title">{s.titulo}</div>
                  <div className="sesion-meta">{new Date(s.inicia_en).toLocaleString()} - {s.tipo_sesion}</div>
                </div>
                <div className="sesion-right">
                  <a className="btn small" href={s.enlace_meet || "#"} target="_blank" rel="noreferrer">Abrir enlace</a>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
