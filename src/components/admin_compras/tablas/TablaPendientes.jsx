import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import "./MovimientosTablas.css";

export default function TablaPendientes({ productoId, varianteId, filtro = "" }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .get("/api/compras/movimientos", {
        params: {
          productoId: varianteId || productoId,
          estados: "PENDIENTE_LOGISTICA",
        },
      })
      .then((res) => setRows(res.data));
  }, [productoId, varianteId]);

  const getRowClass = (tipo) => {
    if (!tipo) return "";
    const t = tipo.toLowerCase();
    if (t.includes("entrada")) return "row-entrada";
    if (t.includes("salida")) return "row-salida";
    if (t.includes("ajuste")) return "row-ajuste";
    return "";
  };

  // ✅ FILTRO REAL MULTICAMPO
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
      ]
        .filter(Boolean)
        .some((campo) =>
          campo.toString().toLowerCase().includes(texto)
        )
    );
  }, [rows, filtro]);

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
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {rowsFiltrados.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: 16 }}>
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            rowsFiltrados.map((r) => (
              <tr key={r.id} className={getRowClass(r.tipo_movimiento)}>
                <td data-label="Tipo">{r.tipo_movimiento}</td>
                <td data-label="OP vinc">{r.op_vinculada || "-"}</td>
                <td data-label="Fabricante">{r.fabricante || "-"}</td>
                <td data-label="Precio" className="td-num">
                  {r.precio}
                </td>
                <td data-label="Cantidad">{r.cantidad}</td>
                <td data-label="Empresa">{r.empresa}</td>
                <td data-label="F Registro">
                  {new Date(r.fecha_creacion).toLocaleString()}
                </td>
                <td data-label="Estado">
                  <span className={`estado estado-${r.estado}`}>
                    {r.estado.replaceAll("_", " ")}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
