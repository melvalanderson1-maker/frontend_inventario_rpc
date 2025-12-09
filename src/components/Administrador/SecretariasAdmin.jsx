// src/components/Administrador/SecretariasAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./SecretariasAdmin.css";

export default function SecretariasAdmin() {
  const [secretarias, setSecretarias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarSecretarias();
      setSecretarias(res.data.secretarias || res.data);
    } catch (err) { console.error(err); alert("Error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="secretarias-admin">
      <h2>Secretarias</h2>
      {loading ? <p>Cargando...</p> : (
        <div className="cards">
          {secretarias.map(s => (
            <div className="card" key={s.id}>
              <div>
                <b>{s.nombre} {s.apellido_paterno}</b>
                <div className="meta">{s.correo}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
