import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import "./Historial.css";

export default function TablaPendientes({
  productoId,
  varianteId,
  filtro = "",
}) {
  const [rows, setRows] = useState([]);
  const [modalTexto, setModalTexto] = useState(null);

  useEffect(() => {
    api
      .get("/api/compras/movimientos", {
        params: {
          productoId: varianteId || productoId,
          estados: "PENDIENTE_LOGISTICA",
        },
      })
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]));
  }, [productoId, varianteId]);

  // 🔥 FORMATO SEGURO
  const formatPrecio = (precio) => {
    if (precio === null || precio === undefined) return "-";

    const num = Number(precio); // 🔥 fuerza conversión
    if (isNaN(num)) return "-";

    return `S/ ${num.toFixed(2)}`;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return isNaN(d) ? "-" : d.toLocaleString();
  };

  const getRowClass = (tipo) => {
    if (!tipo) return "";
    const t = tipo.toLowerCase();
    if (t.includes("entrada")) return "row-entrada";
    if (t.includes("salida")) return "row-salida";
    if (t.includes("ajuste")) return "row-ajuste";
    return "";
  };

  const cortar = (text, n = 36) => {
    if (!text) return "-";
    return text.length > n ? text.slice(0, n) + "…" : text;
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
    <>
      <div className="historial-container">
        <div className="tabla tabla-pendientes-grid">

          {/* HEADER */}
          <div className="fila header">
            <div>Tipo</div>
            <div>OP</div>
            <div>Fabricante</div>

            <div className="num">Costo</div>
            <div className="num">Cantidad</div>

            <div>Empresa</div>

            <div>Obs Compras</div>

            <div>F Registro</div>

            <div>Estado</div>
          </div>

          {/* BODY */}
          {rowsFiltrados.length === 0 ? (
            <div className="empty">No hay datos</div>
          ) : (
            rowsFiltrados.map((r) => {
              // 🔥 COSTO EXACTO COMO HISTORIAL PERO ROBUSTO
              const costo =
                r.tipo_movimiento === "salida"
                  ? r.costo_anterior
                  : r.precio;

              return (
                <div
                  key={r.id}
                  className={`fila ${getRowClass(r.tipo_movimiento)}`}
                >
                  <div>{r.tipo_movimiento}</div>

                  <div>{r.op_vinculada || "-"}</div>

                  <div onClick={() => setModalTexto(r.fabricante)}>
                    {cortar(r.fabricante)}
                  </div>

                  {/* 🔥 AQUI YA FUNCIONA BIEN */}
                  <div className="num">
                    {formatPrecio(costo)}
                  </div>

                  <div className="num">{r.cantidad}</div>

                  <div>{r.empresa}</div>

                  <div
                    onClick={() =>
                      setModalTexto(r.observaciones_compras)
                    }
                  >
                    {cortar(r.observaciones_compras)}
                  </div>

                  <div>{formatFecha(r.fecha_creacion)}</div>

                  <div>
                    <span className={`estado estado-${r.estado}`}>
                      {r.estado?.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL TEXTO */}
      {modalTexto && (
        <div
          className="modal-overlay"
          onClick={() => setModalTexto(null)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">{modalTexto}</div>
            <button onClick={() => setModalTexto(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}