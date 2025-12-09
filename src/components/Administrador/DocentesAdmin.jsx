import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./DocentesAdmin.css";
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaLayerGroup } from "react-icons/fa";

export default function DocentesAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({}); // control de cards expandidas

  useEffect(() => { fetchDocentes(); }, []);

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarDocentes();
      setDocentes(res.data.docentes || res.data);
    } catch (err) {
      console.error(err); alert("Error cargando docentes");
    } finally { setLoading(false); }
  };

  const fetchCursos = async (id) => {
    if (expanded[id]) return; // ya cargado
    try {
      const res = await adminApi.listarCursosDocente(id);
      setExpanded(prev => ({ ...prev, [id]: res.data.cursos }));
    } catch (err) {
      console.error(err);
      alert("Error cargando cursos del docente");
    }
  };

  const toggleExpand = (id) => {
    fetchCursos(id);
    setExpanded(prev => ({ ...prev, [id]: prev[id] ? null : [] }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar/inactivar docente?")) return;
    try {
      await adminApi.eliminarUsuario(id);
      fetchDocentes();
    } catch (err) { console.error(err); alert("Error eliminando"); }
  };

  return (
    <div className="docentes-admin">
      <h2>Gestión de Docentes</h2>
      {loading ? <p>Cargando...</p> : (
        <div className="list">
          {docentes.map(d => (
            <div key={d.id} className="card">
              <div className="card-header" onClick={() => toggleExpand(d.id)}>
                <div>
                  <b>{d.nombre} {d.apellido_paterno}</b>
                  <div className="meta">{d.correo} • {d.telefono}</div>
                </div>
                <div className="indicators">
                  <span title="Docente"><FaChalkboardTeacher /> 1</span>
                </div>
              </div>

              <div className="actions">
                <button className="btn" onClick={() => alert("Editar próximamente")}>Editar</button>
                <button className="btn danger" onClick={() => handleDelete(d.id)}>Eliminar/Inactivar</button>
              </div>

              {expanded[d.id] !== undefined && (
                <div className="card-body">
                  {expanded[d.id] === null ? <p>Cargando cursos...</p> :
                    expanded[d.id].length === 0 ? <p>No tiene cursos asignados</p> :
                    expanded[d.id].map(c => (
                      <div key={c.id} className="curso-card">
                        <div className="curso-header">
                          <b>{c.codigo} - {c.periodo}</b>
                          <div className="curso-info">
                            <span title="Sección"><FaLayerGroup /> {c.seccion_codigo || '-'}</span>
                            <span title="Alumnos"><FaUserGraduate /> {c.alumnos_count}</span>
                            <span title="Modalidad"><FaBook /> {c.modalidad}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
