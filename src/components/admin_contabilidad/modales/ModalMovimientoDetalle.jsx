import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import "./ModalMovimientoDetalle.css";

export default function ModalMovimientoDetalle({ movimientoId, onClose }) {
  const [movimiento, setMovimiento] = useState(null);
  const [cantidadReal, setCantidadReal] = useState(0);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!movimientoId) return;

    api
      .get(`/api/contabilidad/movimientos/${movimientoId}/detalle`)
      .then((res) => {
        setMovimiento(res.data);
        setCantidadReal(res.data.cantidad_real || res.data.cantidad || 0);
      })
      .catch((err) => {
        console.error("Error cargando detalle:", err.response?.data || err);
        alert("No se pudo cargar el detalle del movimiento.");
        onClose();
      });
  }, [movimientoId]);

  if (!movimiento) return null;

  const formatPrecio = (precio) =>
    precio == null ? "-" : `S/ ${Number(precio).toFixed(2)}`;

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d)) return "-";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const handleGuardarCantidadReal = async () => {
    if (cantidadReal <= 0) return alert("La cantidad real debe ser mayor que 0");

    setGuardando(true);
    try {
      const res = await api.post(
        `/api/contabilidad/movimientos/${movimiento.id}/guardar-cantidad-real`,
        { cantidad_real: cantidadReal }
      );

      alert(res.data.msg || "Cantidad real guardada ✅");
    } catch (error) {
      console.error("Error guardando cantidad real:", error.response?.data || error);
      alert(error.response?.data?.msg || "No se pudo guardar. Verifica tu sesión");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Detalle del Movimiento</h2>

        <table className="detalle-table">
          <tbody>
            <tr>
              <td>Tipo</td>
              <td>{movimiento.tipo_movimiento}</td>
            </tr>
            <tr>
              <td>OP Vinculada</td>
              <td>{movimiento.op_vinculada || "-"}</td>
            </tr>
            <tr>
              <td>Fabricante</td>
              <td>{movimiento.fabricante || "-"}</td>
            </tr>
            <tr>
              <td>Precio</td>
              <td>{formatPrecio(movimiento.precio)}</td>
            </tr>
            <tr>
              <td>Cantidad Validado por Compras</td>
              <td>{movimiento.cantidad_solicitada}</td>
            </tr>
            <tr>
              <td>Cantidad Validado por Logística</td>
              <td>{movimiento.cantidad}</td>
            </tr>
            <tr>
              <td>Cantidad Real</td>
              <td>
                <input
                  type="number"
                  value={cantidadReal}
                  onChange={(e) => setCantidadReal(Number(e.target.value))}
                  style={{ width: "80px" }}
                  min={0}
                />
                <button
                  onClick={handleGuardarCantidadReal}
                  disabled={guardando}
                  style={{ marginLeft: 8 }}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </td>
            </tr>
            <tr>
              <td>Empresa</td>
              <td>{movimiento.empresa || "-"}</td>
            </tr>
            <tr>
              <td>Almacén</td>
              <td>{movimiento.almacen || "-"}</td>
            </tr>
            <tr>
              <td>Fecha Registro</td>
              <td>{formatFecha(movimiento.fecha_creacion)}</td>
            </tr>
            <tr>
              <td>Fecha Validación Logística</td>
              <td>{formatFecha(movimiento.fecha_validacion_logistica)}</td>
            </tr>
            <tr>
              <td>Usuario Logística</td>
              <td>{movimiento.usuario_logistica || "-"}</td>
            </tr>
            <tr>
              <td>Usuario Contabilidad</td>
              <td>{movimiento.usuario_contabilidad || "-"}</td>
            </tr>
            <tr>
              <td>Estado</td>
              <td
                className={
                  movimiento.estado === "APROBADO_FINAL"
                    ? "estado-aprobado"
                    : movimiento.estado === "RECHAZADO_CONTABILIDAD"
                    ? "estado-rechazado"
                    : ""
                }
              >
                {movimiento.estado.replaceAll("_", " ")}
              </td>
            </tr>

            <tr>
              <td>Número de Orden</td>
              <td>{movimiento.numero_orden || "-"}</td>
            </tr>
            <tr>
              <td>Observaciones Compras</td>
              <td>{movimiento.observaciones || "-"}</td>
            </tr>
            <tr>
              <td>Observaciones Logística</td>
              <td>{movimiento.observacion_logistica || "-"}</td>
            </tr>
            <tr>
              <td>Observaciones Contabilidad</td>
              <td>{movimiento.observacion_contabilidad || "-"}</td>
            </tr>

            <tr>
              <td>Motivo de Rechazo</td>
              <td>{movimiento.motivo_contabilidad || "-"}</td>
            </tr>

          </tbody>
        </table>

        <button className="modal-close-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
