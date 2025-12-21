import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import docentesApi from "../../api/docentesApi";
import { AuthContext } from "../../context/AuthContext";
import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";
import "./MisSecciones.css";
import CalendarioSeccion from "./CalendarioSeccion";
import ListaAlumnos from "./ListaAlumnos";

export default function MisSecciones() {
  const { usuario } = useContext(AuthContext);
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    fetchSecciones(usuario.id);
  }, [usuario]);

  const fetchSecciones = async (docenteId) => {
    setLoading(true);
    try {
      const res = await docentesApi.listarSeccionesDocente(docenteId);
      // Agrupar por curso
      const cursosMap = {};
      res.data.secciones.forEach((s) => {
        if (!cursosMap[s.curso_id]) cursosMap[s.curso_id] = { ...s, secciones: [] };
        cursosMap[s.curso_id].secciones.push(s);
      });
      setCursos(Object.values(cursosMap));
    } catch (err) {
      console.error(err);
      alert("Error cargando secciones");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardHeader />
      <div className="mis-secciones">
        <header>
          <h2>Mis Cursos y Secciones</h2>
          <p className="muted">Selecciona un curso para ver sus secciones.</p>
        </header>

        {loading ? (
          <p>Cargando...</p>
        ) : cursos.length === 0 ? (
          <div className="empty">No tienes secciones asignadas</div>
        ) : (
          <div className="cursos-grid">
            {cursos.map((curso) => (
              <div className="curso-card" key={curso.curso_id}>
                <div className="curso-header" onClick={() => setSelectedCurso(selectedCurso === curso.curso_id ? null : curso.curso_id)}>
                  <h3>{curso.curso_titulo}</h3>
                  <span>{selectedCurso === curso.curso_id ? "▲" : "▼"}</span>
                </div>
                {selectedCurso === curso.curso_id && (
                  <div className="secciones-list">
                    {curso.secciones.map((s) => (
                      <div className="seccion-card" key={s.seccion_id}>
                        <div className="seccion-info">
                          <div>{s.seccion_codigo} • {s.periodo} • {s.modalidad}</div>
                          <div>Alumnos: <b>{s.alumnos_count}</b></div>
                        </div>
                        <div className="seccion-actions">
                          <CalendarioSeccion seccionId={s.seccion_id} />
                          <ListaAlumnos seccionId={s.seccion_id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <DashboardFooter />
    </>
  );
}
