// src/components/Administrador/FacturasAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./FacturasAdmin.css";

export default function FacturasAdmin() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarFacturas();
      setFacturas(res.data.facturas || res.data);
    } catch (err) { console.error(err); alert("Error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="facturas-admin">
      <h2>Facturas</h2>
      {loading ? <p>Cargando...</p> : (
        <div className="list">
          {facturas.map(f=>(
            <div className="card" key={f.id}>
              <div>
                <b>{f.numero_factura}</b>
                <div className="meta">Total: S/ {f.monto_total}</div>
              </div>
              <div>{f.estado}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
