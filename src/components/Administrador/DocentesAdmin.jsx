import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./DocentesAdmin.css";
import { FaUserGraduate, FaBook, FaLayerGroup, FaIdCard } from "react-icons/fa";

export default function DocentesAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCursos, setExpandedCursos] = useState({});
  const [expandedAlumnos, setExpandedAlumnos] = useState({});

  useEffect(() => {
    fetchDocentes();
  }, []);

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarDocentes();
      const lista = res.data.docentes || res.data;

      const docentesConCursos = await Promise.all(
        lista.map(async (d) => {
          try {
            const cursosRes = await adminApi.listarCursosDocente(d.id);
            const cursos = cursosRes.data.cursos || [];
            return { ...d, cursos };
          } catch {
            return { ...d, cursos: [] };
          }
        })
      );

      setDocentes(docentesConCursos);
    } catch (err) {
      console.error("Error fetchDocentes:", err);
      alert("Error cargando docentes");
    } finally {
      setLoading(false);
    }
  };

  const toggleCursos = (docenteId) => {
    setExpandedCursos((prev) => ({
      ...prev,
      [docenteId]: !prev[docenteId],
    }));
  };

  const toggleAlumnos = async (curso) => {
    if (!expandedAlumnos[curso.seccion_id]) {
      try {
        const res = await adminApi.lumnosSeccion(curso.seccion_id);
        setExpandedAlumnos((prev) => ({
          ...prev,
          [curso.seccion_id]: res.data.alumnos || [],
        }));
      } catch (err) {
        console.error("Error al cargar alumnos:", err);
        alert("Error cargando alumnos");
      }
    } else {
      setExpandedAlumnos((prev) => ({
        ...prev,
        [curso.seccion_id]: prev[curso.seccion_id] ? null : [],
      }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar/Inactivar docente?")) return;
    try {
      await adminApi.eliminarUsuario(id);
      fetchDocentes();
    } catch (err) {
      console.error(err);
      alert("Error eliminando");
    }
  };

  return (
    <div className="docentes-admin">
      <h2>Gestión de Docentes</h2>

      {loading ? (
        <p>Cargando docentes...</p>
      ) : (
        <div className="grid-docentes">
          {docentes.map((d) => {
            const totalAlumnos = d.cursos?.reduce((acc, c) => acc + (c.alumnos_count || 0), 0) || 0;
            const totalCursos = d.cursos?.length || 0;
            const cursosVisible = expandedCursos[d.id];

            return (
              <div key={d.id} className="card">
                <div className="card-header">
                  <div>
                    <b>{d.nombre} {d.apellido_paterno} {d.apellido_materno || ""}</b>
                    <div className="meta">{d.correo} • {d.telefono || "-"}</div>
                  </div>
                  <div className="indicators">
                    <span title="Cursos"><FaBook /> {totalCursos}</span>
                    <span title="Alumnos"><FaUserGraduate /> {totalAlumnos}</span>
                  </div>
                </div>

                <div className="actions">
                  {totalCursos > 0 && (
                    <button className="btn" onClick={() => toggleCursos(d.id)}>
                      {cursosVisible ? "Ocultar Cursos" : "Ver Cursos"}
                    </button>
                  )}
                  <button className="btn danger" onClick={() => handleDelete(d.id)}>Eliminar/Inactivar</button>
                </div>

                {cursosVisible && (
                  <div className="grid-cursos">
                    {d.cursos.map((c) => {
                      const alumnos = expandedAlumnos[c.seccion_id] || [];
                      const tituloCurso = c.curso_titulo + (c.codigo ? ` (${c.codigo})` : "");

                      return (
                        <div key={c.seccion_id} className="curso-card">
                          <div className="curso-header" onClick={() => toggleAlumnos(c)}>
                            <b>{tituloCurso}</b>
                          </div>
                          <div className="curso-info">
                            <span title="Sección"><FaLayerGroup /> {c.seccion_codigo || "-"}</span>
                            <span title="Alumnos"><FaUserGraduate /> {c.alumnos_count}</span>
                            <span title="Modalidad"><FaBook /> {c.modalidad}</span>
                          </div>

                          {alumnos && alumnos.length > 0 && (
                            <div className="alumnos-list">
                              {alumnos.map((a) => (
                                <div key={a.id} className="alumno-item">
                                  <span className="alumno-nombre">{a.nombre} {a.apellido_paterno} {a.apellido_materno}</span>
                                  <span className="alumno-dni"><FaIdCard /> {a.numero_documento}</span>
                                  <span className="alumno-correo">{a.correo}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {alumnos && alumnos.length === 0 && (
                            <div className="alumnos-list">
                              <p>No hay alumnos</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
