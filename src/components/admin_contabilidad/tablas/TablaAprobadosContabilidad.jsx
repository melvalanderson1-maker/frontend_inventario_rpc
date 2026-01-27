import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import ModalMovimientoDetalle from "../modales/ModalMovimientoDetalle";
import "./MovimientosTablas.css";

export default function TablaAprobadosContabilidad({ productoId, varianteId, filtro = "" }) {
  const [rows, setRows] = useState([]);
  const [modalMovimiento, setModalMovimiento] = useState(null);

  const fetchMovimientos = () => {
    api
      .get("/api/contabilidad/movimientos", {
        params: { productoId: varianteId || productoId, estados: "VALIDADO_LOGISTICA" },
      })
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]));
  };

  useEffect(() => {
    fetchMovimientos();
  }, [productoId, varianteId]);

  const formatPrecio = (precio) => (precio == null ? "-" : `S/ ${Number(precio).toFixed(2)}`);
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d)) return "-";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const getRowClass = (tipo) => {
    if (!tipo) return "";
    const t = tipo.toLowerCase();
    if (t.includes("entrada")) return "row-entrada";
    if (t.includes("salida")) return "row-salida";
    if (t.includes("ajuste")) return "row-ajuste";
    return "";
  };

  const rowsFiltrados = useMemo(() => {
    const texto = filtro.toLowerCase().trim();
    if (!texto) return rows;
    return rows.filter((r) =>
      [
        r.tipo_movimiento,
        r.op_vinculada,
        r.fabricante,
        r.precio,
        r.cantidad,
        r.empresa,
        r.almacen,
        r.estado,
        r.fecha_creacion,
        r.fecha_validacion_logistica,
      ]
        .filter(Boolean)
        .some((campo) => campo.toString().toLowerCase().includes(texto))
    );
  }, [rows, filtro]);

  const handleValidar = (id) => {
    api.post(`/api/contabilidad/movimientos/${id}/validar`).then(() => fetchMovimientos());
  };

  const handleRechazar = (id) => {
    const motivo = prompt("Ingrese el motivo del rechazo:");
    if (!motivo) return;
    api.post(`/api/contabilidad/movimientos/${id}/rechazar`, { motivo }).then(() => fetchMovimientos());
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>OP vinc</th>
            <th>Fabricante</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Empresa</th>
            <th>F Registro</th>
            <th>Lug Almac</th>
            <th>F Validación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rowsFiltrados.length === 0 ? (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: 16 }}>No se encontraron resultados</td>
            </tr>
          ) : (
            rowsFiltrados.map((r) => (
              <tr key={r.id} className={getRowClass(r.tipo_movimiento)}>
                <td>{r.tipo_movimiento}</td>
                <td>{r.op_vinculada || "-"}</td>
                <td>{r.fabricante || "-"}</td>
                <td className="td-num">{formatPrecio(r.precio)}</td>
                <td>{r.cantidad}</td>
                <td>{r.empresa}</td>
                <td>{formatFecha(r.fecha_creacion)}</td>
                <td>{r.almacen}</td>
                <td>{formatFecha(r.fecha_validacion_logistica)}</td>
                <td><span className={`estado estado-${r.estado}`}>{r.estado.replaceAll("_", " ")}</span></td>
                <td>
                  <button onClick={() => setModalMovimiento(r.id)}>Detalles</button>
                  <button onClick={() => handleValidar(r.id)}>Validar</button>
                  <button onClick={() => handleRechazar(r.id)}>Rechazar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalMovimiento && (
        <ModalMovimientoDetalle
          movimientoId={modalMovimiento}
          onClose={() => setModalMovimiento(null)}
        />
      )}
    </div>
  );
}
