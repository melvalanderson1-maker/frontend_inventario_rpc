// src/components/admin_contabilidad/RechazarMovimientoContabilidad.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

import { resolveImageUrl } from "../../utils/imageUrl";

import "./RechazarMovimientoContabilidad.css";

export default function RechazarMovimientoContabilidad() {
  const { id } = useParams(); // id del movimiento
  const navigate = useNavigate();

  const [movimiento, setMovimiento] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(false);

  // Traer detalles del movimiento
  useEffect(() => {
    api
      .get(`/api/contabilidad/movimientos/${id}`)
      .then((res) => setMovimiento(res.data.movimiento))
      .catch(() => setMovimiento(null));
  }, [id]);

  if (!movimiento) return <div>Cargando movimiento...</div>;

  const handleRechazar = async () => {
    if (!window.confirm("¿Confirmar rechazo del movimiento?")) return;

    setLoading(true);
    try {
      await api.post(`/api/contabilidad/movimientos/${id}/rechazar`, {
        observacion,
      });
      alert("Movimiento rechazado correctamente.");
      navigate("/contabilidad/pendientes");
    } catch (err) {
      console.error(err);
      alert("Error al rechazar el movimiento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rechazar-movimiento-container">
      <h2>Rechazar Movimiento</h2>

      <div className="movimiento-detalle">
        <div className="detalle-row">
          <strong>Documento:</strong> {movimiento.documento || "—"}
        </div>
        <div className="detalle-row">
          <strong>Empresa:</strong> {movimiento.empresa || "—"}
        </div>
        <div className="detalle-row">
          <strong>Almacén:</strong> {movimiento.almacen || "—"}
        </div>
        <div className="detalle-row">
          <strong>Tipo:</strong> {movimiento.tipo}
        </div>
        <div className="detalle-row">
          <strong>Estado:</strong> {movimiento.estado}
        </div>
        {movimiento.imagen && (
          <div className="detalle-imagen">
            <img
              src={resolveImageUrl(movimiento.imagen)}
              alt="Documento del movimiento"
            />
          </div>
        )}
      </div>

      <div className="rechazar-form">
        <label>
          Observación obligatoria:
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className="input"
            placeholder="Motivo del rechazo..."
          />
        </label>

        <button
          onClick={handleRechazar}
          className="btn-reject"
          disabled={loading || !observacion.trim()}
        >
          {loading ? "Rechazando..." : "Rechazar Movimiento"}
        </button>
      </div>
    </div>
  );
}
