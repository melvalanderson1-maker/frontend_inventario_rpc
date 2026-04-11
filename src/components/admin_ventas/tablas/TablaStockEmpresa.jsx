import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import "./Historial.css";


/* ===============================
   PALETA ERP DISCRETA (DISTINGUIBLE)
================================ */
const ERP_PASTEL_COLORS = [
  "#e8f0fe",
  "#f3e8ff",
  "#ecfdf3",
  "#fff7ed",
  "#fef2f2",
  "#fdf4ff",
  "#eff6ff",
  "#f0fdfa",
  "#fffbeb",
  "#f1f5f9",
  "#ecfeff",
  "#f7fee7",
  "#fff1f2",
  "#eef2ff",
  "#fefce8",
];

const empresaColorCache = new Map();

function getEmpresaColor(nombre = "") {
  if (empresaColorCache.has(nombre)) return empresaColorCache.get(nombre);

  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % ERP_PASTEL_COLORS.length;
  const color = ERP_PASTEL_COLORS[index];
  empresaColorCache.set(nombre, color);
  return color;
}

/* ===============================
   FECHA ERP COMPACTA
================================ */
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

const formatPrecio = (precio) => {
  if (precio === null || precio === undefined) return "-";
  return `S/ ${Number(precio).toFixed(2)}`;
};

const formatPrecio4 = (precio) => {
  if (precio === null || precio === undefined) return "-";
  return Number(precio).toFixed(4);
};

export default function TablaStockEmpresa({
  productoId,
  varianteId,
  filtro = "",
}) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .get("/api/compras/stock-empresa", {
        params: { productoId: varianteId || productoId },
      })
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]));
  }, [productoId, varianteId]);

  // ✅ FILTRO MULTICAMPO
  const rowsFiltrados = useMemo(() => {
    const texto = filtro.toLowerCase().trim();
    if (!texto) return rows;

    return rows.filter((r) =>
      [r.empresa, r.almacen, r.fabricante, r.cantidad, r.costo_promedio, r.valor_stock, r.updated_at]
        .filter(Boolean)
        .some((campo) =>
          campo.toString().toLowerCase().includes(texto)
        )
    );
  }, [rows, filtro]);

return (
  <div className="historial-container">
    <div className="tabla tabla-stock">

      {/* HEADER */}
      <div className="fila header">
        <div>Empresa</div>
        <div>Almacén</div>
        <div>Fabricante</div>
        <div className="num">Stock</div>
        <div className="num">C. Unitario</div>
        <div className="num">Saldo</div>
        <div>Últ. actualización</div>
      </div>

      {/* BODY */}
      {rowsFiltrados.length === 0 ? (
        <div className="empty">No se encontraron resultados</div>
      ) : (
        rowsFiltrados.map((r, i) => (
          <div
            key={`${r.empresa}-${r.almacen}-${r.fabricante || "x"}-${i}`}
            className="fila"
            style={{ backgroundColor: getEmpresaColor(r.empresa) }}
          >

            <div data-label="Empresa">{r.empresa}</div>
            <div data-label="Almacén">{r.almacen}</div>
            <div data-label="Fabricante">{r.fabricante || "-"}</div>

            <div className="num" data-label="Stock">
              {r.cantidad}
            </div>

            <div className="num" data-label="C. Unitario">
              {formatPrecio(r.costo_promedio)}
              <div className="mini">
                ({formatPrecio4(r.costo_promedio)})
              </div>
            </div>

            <div className="num strong" data-label="Saldo">
              {formatPrecio(
                Number(r.cantidad) * Number(r.costo_promedio)
              )}
            </div>

            <div data-label="Actualización">
              {formatFecha(r.updated_at)}
            </div>

          </div>
        ))
      )}

    </div>
  </div>
);
}
