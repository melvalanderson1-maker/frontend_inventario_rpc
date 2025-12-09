// src/components/Administrador/AuditoriaAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./AuditoriaAdmin.css";

export default function AuditoriaAdmin() {
  const [aud, setAud] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarAuditoria();
      setAud(res.data.auditoria || res.data);
    } catch (err) { console.error(err); alert("Error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="aud-admin">
      <h2>Auditoría</h2>
      {loading ? <p>Cargando...</p> : (
        <div className="list">
          {aud.map(a=>(
            <div className="row" key={a.id}>
              <div className="left">
                <div className="action">{a.accion}</div>
                <div className="meta">{a.entidad} #{a.entidad_id}</div>
              </div>
              <div className="time">{new Date(a.creado_en).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
