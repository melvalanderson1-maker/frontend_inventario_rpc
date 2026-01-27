import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import ModalEditarRechazado from "../modales/ModalEditarRechazado";
import "./MovimientosTablas.css";

export default function TablaRechazados({ productoId, varianteId, filtro = "" }) {
  const [rows, setRows] = useState([]);
  const [movSeleccionado, setMovSeleccionado] = useState(null);

  const cargar = () => {
    api
      .get("/api/compras/movimientos", {
        params: {
          productoId: varianteId || productoId,
          estados: "RECHAZADO_LOGISTICA",
        },
      })
      .then((res) => setRows(res.data));
  };

  useEffect(() => {
    cargar();
  }, [productoId, varianteId]);

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
        r.estado,
        r.fecha_creacion,
        r.motivo_rechazo,
        r.usuario_logistica
      ]
        .filter(Boolean)
        .some((campo) =>
          campo.toString().toLowerCase().includes(texto)
        )
    );
  }, [rows, filtro]);

  return (
    <>
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
              <th>Rechazado por</th>
              <th>Estado</th>
              <th>Motivo rechazo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rowsFiltrados.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: "center", padding: 16 }}>
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              rowsFiltrados.map((r) => (
                <tr
                  key={r.id}
                  className={`${getRowClass(r.tipo_movimiento)} fila-rechazada`}
                >
                  <td data-label="Tipo">{r.tipo_movimiento}</td>
                  <td data-label="OP vinc">{r.op_vinculada || "-"}</td>
                  <td data-label="Fabricante">{r.fabricante || "-"}</td>
                  <td data-label="Precio" className="td-num">
                    {r.precio ?? "-"}
                  </td>
                  <td data-label="Cantidad">{r.cantidad}</td>
                  <td data-label="Empresa">{r.empresa}</td>
                  <td data-label="F Registro">
                    {new Date(r.fecha_creacion).toLocaleString()}
                  </td>
                  <td data-label="Rechazado por">{r.usuario_logistica || "-"}</td>
                  <td data-label="Estado">
                    <span className={`estado estado-${r.estado}`}>
                      {r.estado.replaceAll("_", " ")}
                    </span>
                  </td>
                <td className="texto-error">{r.motivo_rechazo || "—"}</td>
                  <td data-label="Acciones">
                    <button
                      className="btn-warning"
                      onClick={() => setMovSeleccionado(r)}
                    >
                      Corregir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {movSeleccionado && (
      <ModalEditarRechazado
        movimientoId={movSeleccionado.id}
        onClose={() => setMovSeleccionado(null)}
        onSuccess={() => {
          setMovSeleccionado(null);
          cargar();
        }}
      />

      )}
    </>
  );
}
