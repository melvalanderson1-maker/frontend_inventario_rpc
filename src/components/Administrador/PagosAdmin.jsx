// src/components/Administrador/PagosAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./PagosAdmin.css";

export default function PagosAdmin() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarPagos();
      setPagos(res.data.pagos || res.data);
    } catch (err) { console.error(err); alert("Error cargando pagos"); }
    finally { setLoading(false); }
  };

  return (
    <div className="pagos-admin">
      <h2>Pagos</h2>
      {loading ? <p>Cargando...</p> : (
        <table className="table">
          <thead><tr><th>ID</th><th>Monto</th><th>Usuario</th><th>Metodo</th><th>Estado</th></tr></thead>
          <tbody>
            {pagos.map(p=>(
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.monto}</td>
                <td>{p.usuario_id}</td>
                <td>{p.metodo}</td>
                <td>{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
