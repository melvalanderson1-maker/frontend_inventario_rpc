// src/pages/docente/MisSecciones.jsx
import React, { useEffect, useState, useContext } from "react";
import docentesApi from "../../api/docentesApi";
import { AuthContext } from "../../context/AuthContext";
import "./MisSecciones.css";
import { Link } from "react-router-dom";

export default function MisSecciones() {
  const { usuario } = useContext(AuthContext);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    fetchSecciones(usuario.id);
  }, [usuario]);

  const fetchSecciones = async (docenteId) => {
    setLoading(true);
    try {
      const res = await docentesApi.listarSeccionesDocente(docenteId);
      setSecciones(res.data.secciones || []);
    } catch (err) {
      console.error(err);
      alert("Error cargando secciones");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mis-secciones">
      <header>
        <h2>Mis Secciones</h2>
        <p className="muted">Lista de cursos y secciones que dictas.</p>
      </header>

      {loading ? <p>Cargando...</p> : (
        <div className="secciones-grid">
          {secciones.length === 0 ? <div className="empty">No tienes secciones asignadas</div> :
            secciones.map(s => (
              <div className="seccion-card" key={s.seccion_id}>
                <div className="seccion-info">
                  <div className="seccion-title">{s.curso_titulo}</div>
                  <div className="seccion-sub">{s.seccion_codigo} • {s.periodo} • {s.modalidad}</div>
                  <div className="seccion-count">Alumnos: <b>{s.alumnos_count}</b></div>
                </div>

                <div className="seccion-actions">
                  <Link to={`/docente/asistencia?seccion=${s.seccion_id}`} className="btn">Asistencia</Link>
                  <Link to={`/docente/notas?seccion=${s.seccion_id}`} className="btn outline">Notas</Link>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
