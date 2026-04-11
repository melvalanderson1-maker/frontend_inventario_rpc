import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import "./Historial.css";

export default function TablaHistorial({ productoId, varianteId, filtro = "" }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/api/compras/movimientos", {
      params: {
        productoId: varianteId || productoId,
        estados:
          "PENDIENTE_LOGISTICA,VALIDADO_LOGISTICA,RECHAZADO_LOGISTICA,APROBADO_FINAL,RECHAZADO_CONTABILIDAD",
      },
    }).then((res) => setRows(res.data));
  }, [productoId, varianteId]);

  const formatPrecio = (precio) => {
    if (precio === null || precio === undefined) return "-";
    return `S/ ${Number(precio).toFixed(2)}`;
  };

  const formatPrecio4 = (precio) => {
    if (precio === null || precio === undefined) return "-";
    return Number(precio).toFixed(4);
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
      Object.values(r)
        .filter(Boolean)
        .some((campo) =>
          campo.toString().toLowerCase().includes(texto)
        )
    );
  }, [rows, filtro]);

  return (
    <div className="historial-container">
      <div className="tabla">

        {/* HEADER */}
        <div className="fila header">
          <div>Tipo</div>
          <div>OP</div>
          <div>Fabricante</div>
          <div className="num">C/U</div>
          <div className="num">Q</div>
          <div className="num">Total</div>

          <div className="num">C. Prom</div>
          <div className="num">Stock</div>
          <div className="num">Valorizado</div>

          <div>Empresa</div>
          <div>F. Registro</div>
          <div>Almacén</div>
          <div>F. Validación</div>
          <div>Estado</div>
        </div>

        {/* BODY */}
        {rowsFiltrados.length === 0 ? (
          <div className="empty">No hay datos</div>
        ) : (
          rowsFiltrados.map((r) => (
            <div key={r.id} className={`fila ${getRowClass(r.tipo_movimiento)}`}>

              <div data-label="Tipo">{r.tipo_movimiento}</div>
              <div data-label="OP">{r.op_vinculada || "-"}</div>
              <div data-label="Fabricante">{r.fabricante || "-"}</div>

              <div className="num">
                {r.tipo_movimiento === "salida"
                  ? formatPrecio(r.costo_anterior)
                  : formatPrecio(r.precio)}
              </div>

              <div className="num">{r.cantidad}</div>

              <div className="num">
                {formatPrecio(
                  (r.tipo_movimiento === "salida"
                    ? r.costo_anterior
                    : r.precio || 0) * r.cantidad
                )}
              </div>

              <div className="num">
                {formatPrecio(r.costo_promedio_resultante)}
                <div className="mini">
                  ({formatPrecio4(r.costo_promedio_resultante)})
                </div>
              </div>

              <div className="num">{r.stock_resultante}</div>

              <div className="num strong">
                {formatPrecio(
                  Number(r.stock_resultante) *
                  Number(r.costo_promedio_resultante)
                )}
              </div>

              <div>{r.empresa}</div>

              <div>
                {new Date(r.fecha_creacion).toLocaleString()}
              </div>

              <div>{r.almacen}</div>

              <div>
                {r.fecha_validacion_logistica
                  ? new Date(r.fecha_validacion_logistica).toLocaleString()
                  : "-"}
              </div>

              <div>
                <span className={`estado estado-${r.estado}`}>
                  {r.estado.replaceAll("_", " ")}
                </span>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}