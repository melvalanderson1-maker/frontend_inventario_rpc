import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import ModalValidarCambioAlmacen from "../ModalValidarCambioAlmacen";

// ==========================
// Componente Toast
// ==========================
function Toast({ type = "success", message, onClose }) {
  const color = type === "success" ? "#28a745" : "#dc3545";
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: color,
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        fontSize: 13,
        zIndex: 2000,
      }}
    >
      {message}
      <span
        onClick={onClose}
        style={{ marginLeft: 10, cursor: "pointer", fontWeight: "bold" }}
      >
        ×
      </span>
    </div>
  );
}

// ==========================
// Formato de fecha compacto
// ==========================
function formatFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ==========================
// Modal de confirmación
// ==========================
function ModalConfirmacion({ title, message, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-sm">
        <h3>{title}</h3>
        <div style={{ margin: "12px 0", color: "#555" }}>{message}</div>

        <div className="modal-actions compact">
          <button className="btn ghost small" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn danger small" onClick={onConfirm}>
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================
// Componente principal
// ==========================
export default function TablaCambiosAlmacenPendientes({ productoId, filtro = "" }) {
  const [rows, setRows] = useState([]);
  const [cambioSeleccionado, setCambioSeleccionado] = useState(null);
  const [rechazoSeleccionado, setRechazoSeleccionado] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [toast, setToast] = useState(null); // ✅ Aquí dentro del componente

  // ==========================
  // Cargar cambios pendientes
  // ==========================
  const cargar = () => {
    api
      .get("/api/logistica/cambios-almacen/pendientes")
      .then((res) => {
        let data = res.data || [];
        if (productoId) {
          data = data.filter((r) => String(r.producto_id) === String(productoId));
        }
        setRows(data);
      })
      .catch((e) => {
        console.error("❌ Error cargando cambios:", e);
        setRows([]);
      });
  };

  useEffect(() => {
    cargar();
  }, [productoId]);

  // ==========================
  // Filtrado de texto
  // ==========================
  const rowsFiltrados = useMemo(() => {
    const texto = filtro.toLowerCase().trim();
    if (!texto) return rows;

    return rows.filter((r) =>
      [
        r.producto,
        r.codigo_producto,
        r.codigo_modelo,
        r.empresa_origen,
        r.empresa_destino,
        r.almacen_origen,
        r.almacen_destino,
        r.fabricante_origen,
        r.fabricante_destino,
        r.estado,
      ]
        .filter(Boolean)
        .some((campo) => campo.toString().toLowerCase().includes(texto))
    );
  }, [rows, filtro]);

  // ==========================
  // Rechazar cambio
  // ==========================
  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim()) return;

    try {
      await api.post(
        `/api/logistica/cambios-almacen/${rechazoSeleccionado.id}/rechazar`,
        { observaciones: motivoRechazo }
      );

      // Quitar el cambio de la tabla
      setRows((r) => r.filter((x) => x.id !== rechazoSeleccionado.id));

      // Reset
      setRechazoSeleccionado(null);
      setMotivoRechazo("");

      // ✅ Mostrar toast de éxito
      setToast({ type: "success", message: "✅ Cambio rechazado correctamente" });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setToast({
        type: "error",
        message: e.response?.data?.error || "❌ Error rechazando cambio",
      });
      setRechazoSeleccionado(null);
      setMotivoRechazo("");
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <>
      <div className="table-scroll-wrapper">
        <table className="tabla-cambios">
          <thead>
            <tr>
              <th className="th-empresa">Emp.Origen</th>
              <th>Alm.Origen</th>
              <th>Fabricante Origen</th>
              <th className="th-empresa">Emp.Destino</th>
              <th>Alm.Destino</th>
              <th>Fabricante Destino</th>
              <th className="th-corto">Stock</th>
              <th className="th-corto">Cantidad</th>
              <th className="th-fecha">Fecha</th>
              <th className="th-estado">Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {rowsFiltrados.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: "center", padding: 12 }}>
                  No hay cambios pendientes
                </td>
              </tr>
            ) : (
              rowsFiltrados.map((r) => (
                <tr key={r.id}>
                  <td className="td-empresa">{r.empresa_origen || "-"}</td>
                  <td>{r.almacen_origen || "-"}</td>
                  <td>{r.fabricante_origen || "-"}</td>
                  <td className="td-empresa">{r.empresa_destino || "-"}</td>
                  <td>{r.almacen_destino || "-"}</td>
                  <td>{r.fabricante_destino || "-"}</td>
                  <td className="td-num td-corto">{r.cantidad_disponible}</td>
                  <td className="td-num td-corto">{r.cantidad}</td>
                  <td className="td-fecha">{formatFecha(r.created_at)}</td>
                  <td className="td-estado">{r.estado}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      className="btn-mini success"
                      onClick={() => setCambioSeleccionado(r)}
                    >
                      Validar
                    </button>
                    <button
                      className="btn-mini danger"
                      onClick={() => setRechazoSeleccionado(r)}
                      style={{ marginLeft: 4 }}
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Validación */}
      {cambioSeleccionado && (
        <ModalValidarCambioAlmacen
          cambio={cambioSeleccionado}
          onClose={() => setCambioSeleccionado(null)}
          onSuccess={cargar}
        />
      )}

      {/* Modal de Confirmación de Rechazo */}
      {rechazoSeleccionado && (
        <ModalConfirmacion
          title="¿Rechazar este cambio?"
          message={
            <>
              <div>Esta acción no se puede deshacer.</div>
              <div style={{ marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Motivo del rechazo"
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    marginTop: 6,
                  }}
                />
              </div>
            </>
          }
          onCancel={() => setRechazoSeleccionado(null)}
          onConfirm={confirmarRechazo}
        />
      )}

      {/* ======================
            Toast flotante
      ====================== */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      {/* ========================== 
           Estilos (los tuyos intactos)
      ========================== */}
      <style jsx>{` /* ...tus estilos aquí... */ `}</style>
    </>
  );
}
