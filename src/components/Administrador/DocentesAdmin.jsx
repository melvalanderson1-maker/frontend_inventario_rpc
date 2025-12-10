import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./DocentesAdmin.css";
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaLayerGroup } from "react-icons/fa";

export default function DocentesAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({}); // cursos por docente o alumnos por sección
  const [viewDetalle, setViewDetalle] = useState(false); // para mostrar detalle de un docente
  const [selectedDocente, setSelectedDocente] = useState(null);

  useEffect(() => {
    fetchDocentes();
  }, []);

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarDocentes();
      console.log("Docentes cargados:", res.data.docentes || res.data);
      setDocentes(res.data.docentes || res.data);
    } catch (err) {
      console.error("Error fetchDocentes:", err);
      alert("Error cargando docentes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async (docente) => {
    console.log("Cargando cursos del docente:", docente.id);
    try {
      const res = await adminApi.listarCursosDocente(docente.id);
      console.log("Cursos obtenidos:", res.data.cursos);
      setExpanded((prev) => ({
        ...prev,
        [docente.id]: { cursos: res.data.cursos, visible: true },
      }));
      setSelectedDocente(docente);
      setViewDetalle(true);
    } catch (err) {
      console.error("Error fetchCursos:", err);
      alert("Error cargando cursos del docente");
    }
  };

  const toggleExpandSeccion = async (c) => {
    if (!expanded[c.seccion_id]) {
      const res = await adminApi.lumnosSeccion(c.seccion_id);
      setExpanded((prev) => ({
        ...prev,
        [c.seccion_id]: { alumnos: res.data.alumnos, visible: true },
      }));
    } else {
      setExpanded((prev) => ({
        ...prev,
        [c.seccion_id]: { ...prev[c.seccion_id], visible: !prev[c.seccion_id].visible },
      }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar/Inactivar docente?")) return;
    try {
      await adminApi.eliminarUsuario(id);
      fetchDocentes();
      setViewDetalle(false);
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
      ) : viewDetalle && selectedDocente ? (
        <div className="detalle-docente">
          <button className="btn regresar" onClick={() => setViewDetalle(false)}>← Regresar</button>
          <h3>{selectedDocente.nombre} {selectedDocente.apellido_paterno}</h3>
          <div className="list-cursos">
            {expanded[selectedDocente.id]?.cursos.length === 0 ? (
              <p>No tiene cursos asignados</p>
            ) : (
              expanded[selectedDocente.id]?.cursos.map((c) => {
                const alumnos = expanded[c.seccion_id]?.alumnos || [];
                const alumnosVisible = expanded[c.seccion_id]?.visible;
                return (
                  <div key={c.seccion_id} className="curso-card">
                    <div className="curso-header" onClick={() => toggleExpandSeccion(c)}>
                      <b>{c.curso_titulo} ({c.codigo})</b>
                      <div className="curso-info">
                        <span title="Sección"><FaLayerGroup /> {c.seccion_codigo || "-"}</span>
                        <span title="Alumnos"><FaUserGraduate /> {c.alumnos_count}</span>
                        <span title="Modalidad"><FaBook /> {c.modalidad}</span>
                      </div>
                    </div>
                    {alumnosVisible && (
                      <div className="alumnos-list">
                        {alumnos.length === 0 ? <p>No hay alumnos</p> :
                          alumnos.map(a => (
                            <div key={a.id} className="alumno-item">
                              {a.nombre} {a.apellido_paterno} ({a.correo})
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="grid-docentes">
          {docentes.map((d) => {
            const totalAlumnos = expanded[d.id]?.cursos?.reduce((acc, c) => acc + (c.alumnos_count || 0), 0) || 0;
            const totalCursos = expanded[d.id]?.cursos?.length || 0;
            return (
              <div key={d.id} className="card">
                <div className="card-header">
                  <div>
                    <b>{d.nombre} {d.apellido_paterno}</b>
                    <div className="meta">{d.correo} • {d.telefono}</div>
                  </div>
                  <div className="indicators">
                    <span title="Docente"><FaChalkboardTeacher /> 1</span>
                    <span title="Cursos"><FaBook /> {totalCursos}</span>
                    <span title="Alumnos"><FaUserGraduate /> {totalAlumnos}</span>
                  </div>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => fetchCursos(d)}>Ver Cursos</button>
                  <button className="btn danger" onClick={() => handleDelete(d.id)}>Eliminar/Inactivar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
