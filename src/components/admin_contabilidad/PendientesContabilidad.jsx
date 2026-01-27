// src/components/contabilidad/PendientesContabilidad.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/api";

export default function PendientesContabilidad() {
  const [pendientes, setPendientes] = useState([]);

  useEffect(() => {
    api.get("/api/contabilidad/pendientes")
      .then(res => setPendientes(res.data || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Movimientos Pendientes</h2>
      {pendientes.length === 0 ? (
        <p>No hay movimientos pendientes.</p>
      ) : (
        <ul>
          {pendientes.map((mov) => (
            <li key={mov.id}>
              {mov.descripcion || `Movimiento #${mov.id}`} - Estado: {mov.estado}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
