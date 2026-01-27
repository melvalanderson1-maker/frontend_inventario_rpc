import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import "./ModalMovimiento.css";

export default function ModalRechazarMovimiento({
  movimiento,
  onClose,
  onSuccess,
}) {
  const [motivos, setMotivos] = useState([]);
  const [motivoId, setMotivoId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/api/logistica/motivos-rechazo").then((res) => {
      setMotivos(res.data);
    });
  }, []);

  const onMotivoChange = (id) => {
    const m = motivos.find((x) => x.id === Number(id));
    setMotivoId(id);
    setObservaciones(m?.mensaje_default || "");
  };

  const rechazar = async () => {
    if (!motivoId) {
      setError("Debe seleccionar un motivo");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post(
        `/api/logistica/movimientos/${movimiento.id}/rechazar`,
        { observaciones, motivoId }
      );


      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || "Error rechazando movimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mov-modal-backdrop">
      <div className="mov-modal">
        <h2>Rechazar movimiento</h2>

        <div className="mov-modal-body">
          <div>
            <label>Motivo *</label>
            <select
              value={motivoId}
              onChange={(e) => onMotivoChange(e.target.value)}
            >
              <option value="">Seleccione motivo</option>
              {motivos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Observaciones</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />

          </div>

          {error && <div className="mov-error">{error}</div>}
        </div>

        <div className="mov-modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button
            className="btn-danger"
            onClick={rechazar}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Rechazar movimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}
