import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

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

export default function TablaStockEmpresa({
  productoId,
  varianteId,
  filtro = "",
}) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .get("/api/logistica/stock-empresa", {
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
      [r.empresa, r.almacen, r.fabricante, r.cantidad, r.updated_at]
        .filter(Boolean)
        .some((campo) => campo.toString().toLowerCase().includes(texto))
    );
  }, [rows, filtro]);

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Almacén</th>
            <th>Fabricante</th>
            <th>Stock</th>
            <th>Últ. actualización</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {rowsFiltrados.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            rowsFiltrados.map((r, i) => (
              <tr
                key={`${r.empresa}-${r.almacen}-${i}`}
                className="row-empresa"
                style={{ backgroundColor: getEmpresaColor(r.empresa) }}
              >
                <td>{r.empresa}</td>
                <td>{r.almacen}</td>
                <td>{r.fabricante || "-"}</td>
                <td className="td-num">{r.cantidad}</td>
                <td>{formatFecha(r.updated_at)}</td>
                <td>
                <button
                  className="btn-mini"
                  onClick={() =>
                    navigate(`/logistica/cambio-almacen/${productoId}`, {
                    state: {
                      stockOrigen: {
                        producto_id: r.producto_id,
                        empresa_id: r.empresa_id,
                        empresa: r.empresa,
                        almacen_id: r.almacen_id,
                        almacen: r.almacen,
                        fabricante_id: r.fabricante_id,
                        fabricante: r.fabricante,
                        cantidad: r.cantidad,
                      },
                    },

                    })
                  }
                >
                  🔁 Cambiar
                </button>


                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
