// src/components/contabilidad/HistorialContabilidad.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/api";

export default function HistorialContabilidad() {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    api.get("/api/contabilidad/historial")
      .then(res => setHistorial(res.data || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Historial de Movimientos</h2>
      {historial.length === 0 ? (
        <p>No hay movimientos en el historial.</p>
      ) : (
        <ul>
          {historial.map((mov) => (
            <li key={mov.id}>
              {mov.descripcion || `Movimiento #${mov.id}`} - Estado: {mov.estado} - Fecha: {mov.updated_at}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
