import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./DocentesAdmin.css";
import { FaUserGraduate, FaBook, FaLayerGroup, FaIdCard, FaTimes } from "react-icons/fa";

export default function DocentesAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewDetalle, setViewDetalle] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [modalCurso, setModalCurso] = useState(null); // curso que se muestra en modal
  const [alumnosCurso, setAlumnosCurso] = useState([]);

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
      setSelectedDocente({ ...docente, cursos });
      setViewDetalle(true);
    } catch (err) {
      console.error("Error fetchCursosDetalle:", err);
      alert("Error cargando cursos del docente");
    }
  };

  const abrirModalAlumnos = async (curso) => {
    try {
      const res = await adminApi.lumnosSeccion(curso.seccion_id);
      setAlumnosCurso(res.data.alumnos || []);
      setModalCurso(curso);
    } catch (err) {
      console.error("Error fetch alumnos:", err);
      alert("Error cargando alumnos del curso");
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
            {selectedDocente.cursos.length === 0 ? (
              <p>No tiene cursos asignados</p>
            ) : (
              selectedDocente.cursos.map((c) => {
                const cursoTitulo = c.codigo ? `${c.curso_titulo} (${c.codigo})` : c.curso_titulo;
                return (
                  <div key={c.seccion_id} className="curso-card">
                    <div className="curso-header" onClick={() => abrirModalAlumnos(c)}>
                      <b className="curso-titulo">{cursoTitulo}</b>
                      <div className="curso-info">
                        <span title="Sección"><FaLayerGroup /> {c.seccion_codigo || "-"}</span>
                        <span title="Alumnos"><FaUserGraduate /> {c.alumnos_count || 0}</span>
                        <span title="Modalidad"><FaBook /> {c.modalidad || "-"}</span>
                      </div>
                    </div>
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

      {/* Modal de alumnos */}
      {modalCurso && (
        <div className="modal-overlay" onClick={() => setModalCurso(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalCurso.curso_titulo} - {modalCurso.seccion_codigo}</h3>
              <button className="btn cerrar" onClick={() => setModalCurso(null)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              {alumnosCurso.length === 0 ? <p>No hay alumnos matriculados</p> :
                alumnosCurso.map(a => (
                  <div key={a.id} className="alumno-item">
                    <span className="alumno-nombre">{a.nombre} {a.apellido_paterno} {a.apellido_materno}</span>
                    <span className="alumno-dni"><FaIdCard /> {a.numero_documento}</span>
                    <span className="alumno-correo">{a.correo}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
