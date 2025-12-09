import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./DocentesAdmin.css";
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaLayerGroup, FaCircle } from "react-icons/fa";

export default function DocentesAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({}); // almacena cursos y estadísticas

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

  const fetchCursos = async (id) => {
    console.log("Cargando cursos del docente:", id);
    try {
      const res = await adminApi.listarCursosDocente(id);
      console.log("Cursos obtenidos:", res.data.cursos);
      setExpanded((prev) => ({
        ...prev,
        [id]: { cursos: res.data.cursos, visible: true },
      }));
    } catch (err) {
      console.error("Error fetchCursos:", err);
      alert("Error cargando cursos del docente");
    }
  };

  const toggleExpand = (id) => {
    if (!expanded[id]) {
      fetchCursos(id);
    } else {
      setExpanded((prev) => ({
        ...prev,
        [id]: { ...prev[id], visible: !prev[id].visible },
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
        <div className="list">
          {docentes.map((d) => {
            const cursosInfo = expanded[d.id]?.cursos || [];
            const visible = expanded[d.id]?.visible;
            const totalAlumnos = cursosInfo.reduce((acc, c) => acc + (c.alumnos_count || 0), 0);
            return (
              <div key={d.id} className="card">
                <div className="card-header" onClick={() => toggleExpand(d.id)}>
                  <div>
                    <b>{d.nombre} {d.apellido_paterno}</b>
                    <div className="meta">{d.correo} • {d.telefono}</div>
                  </div>
                  <div className="indicators">
                    <span title="Docente"><FaChalkboardTeacher /> 1</span>
                    <span title="Cursos"><FaBook /> {cursosInfo.length}</span>
                    <span title="Alumnos"><FaUserGraduate /> {totalAlumnos}</span>
                  </div>
                </div>

                <div className="actions">
                  <button className="btn" onClick={() => alert("Editar próximamente")}>Editar</button>
                  <button className="btn danger" onClick={() => handleDelete(d.id)}>Eliminar/Inactivar</button>
                </div>

                {visible && (
                  <div className="card-body">
                    {cursosInfo.length === 0 ? (
                      <p>No tiene cursos asignados</p>
                    ) : (
                      cursosInfo.map((c) => (
                        <div key={c.id} className="curso-card">
                          <div className="curso-header">
                            <b>{c.codigo} - {c.periodo}</b>
                            <div className="curso-info">
                              <span title="Sección"><FaLayerGroup /> {c.seccion_codigo || "-"}</span>
                              <span title="Alumnos"><FaUserGraduate /> {c.alumnos_count}</span>
                              <span title="Modalidad"><FaBook /> {c.modalidad}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
