import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./DocentesAdmin.css";
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaLayerGroup, FaIdCard } from "react-icons/fa";

export default function DocentesAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [viewDetalle, setViewDetalle] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);

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

  const fetchCursosDetalle = async (docente) => {
    try {
      const res = await adminApi.listarCursosDocente(docente.id);
      const cursos = res.data.cursos || [];
      setExpanded((prev) => ({
        ...prev,
        [docente.id]: { cursos, visible: true },
      }));
      setSelectedDocente(docente);
      setViewDetalle(true);
    } catch (err) {
      console.error("Error fetchCursosDetalle:", err);
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
          <h3>{selectedDocente.nombre} {selectedDocente.apellido_paterno} {selectedDocente.apellido_materno || ""}</h3>

          <div className="grid-cursos">
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
                              <span className="alumno-nombre">{a.nombre} {a.apellido_paterno} {a.apellido_materno}</span>
                              <span className="alumno-dni"><FaIdCard /> {a.dni}</span>
                              <span className="alumno-correo">{a.correo}</span>
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
            const totalAlumnos = d.cursos?.reduce((acc, c) => acc + (c.alumnos_count || 0), 0) || 0;
            const totalCursos = d.cursos?.length || 0;

            return (
              <div key={d.id} className="card">
                <div className="card-header">
                  <div>
                    <b>{d.nombre} {d.apellido_paterno}</b>
                    <div className="meta">{d.correo} • {d.telefono || "-"}</div>
                  </div>
                  <div className="indicators">
                    <span title="Docente"><FaChalkboardTeacher /> 1</span>
                    <span title="Cursos"><FaBook /> {totalCursos}</span>
                    <span title="Alumnos"><FaUserGraduate /> {totalAlumnos}</span>
                  </div>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => fetchCursosDetalle(d)}>Ver Cursos</button>
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
