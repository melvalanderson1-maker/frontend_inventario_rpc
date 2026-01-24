// src/components/admin_contabilidad/ValidarMovimientoContabilidad.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { resolveImageUrl } from "../../utils/imageUrl";

import "./ValidarMovimientoContabilidad.css";

export default function ValidarMovimientoContabilidad() {
  const { id } = useParams(); // id del movimiento
  const navigate = useNavigate();

  const [movimiento, setMovimiento] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  // Traer detalles del movimiento
  useEffect(() => {
    api
      .get(`/api/contabilidad/movimientos/${id}`)
      .then((res) => setMovimiento(res.data.movimiento))
      .catch(() => setMovimiento(null));
  }, [id]);

  if (!movimiento) return <div>Cargando movimiento...</div>;

  const handleValidar = async () => {
    if (!window.confirm("¿Confirmar validación del movimiento?")) return;

    const formData = new FormData();
    formData.append("observacion", observacion);
    if (imagen) formData.append("imagen", imagen);

    setLoading(true);
    try {
      await api.post(`/api/contabilidad/movimientos/${id}/validar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Movimiento validado correctamente.");
      navigate("/contabilidad/pendientes");
    } catch (err) {
      console.error(err);
      alert("Error al validar el movimiento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="validar-movimiento-container">
      <h2>Validar Movimiento</h2>

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

      <div className="validar-form">
        <label>
          Observación (opcional):
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className="input"
          />
        </label>

        <label>
          Subir imagen (opcional):
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            className="input"
          />
        </label>

        <button
          onClick={handleValidar}
          className="btn-validate"
          disabled={loading}
        >
          {loading ? "Validando..." : "Validar Movimiento"}
        </button>
      </div>
    </div>
  );
}
