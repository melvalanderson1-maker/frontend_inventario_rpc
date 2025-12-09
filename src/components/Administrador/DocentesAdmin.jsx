// src/components/Administrador/DocentesAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./DocentesAdmin.css";

export default function DocentesAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleDelete = async (id) => {
    if (!confirm("Eliminar docente?")) return;
    try {
      await adminApi.eliminarUsuario(id);
      fetchDocentes();
    } catch (err) { console.error(err); alert("Error eliminando"); }
  };

  return (
    <div className="docentes-admin">
      <h2>Docentes</h2>
      {loading ? <p>Cargando...</p> : (
        <div className="list">
          {docentes.map(d => (
            <div key={d.id} className="card">
              <div>
                <b>{d.nombre} {d.apellido_paterno}</b>
                <div className="meta">{d.correo} • {d.telefono}</div>
              </div>
              <div className="actions">
                <button className="btn" onClick={() => window.alert("Editar próximamente")}>Editar</button>
                <button className="btn danger" onClick={() => handleDelete(d.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
