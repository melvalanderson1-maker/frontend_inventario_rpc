import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import { Link } from "react-router-dom";

export default function TablaCambiosAlmacenPendientesContabilidad({ filtro = "" }) {
  const [rows, setRows] = useState([]);
  const [modo, setModo] = useState("pendientes"); // pendientes | todos
  const [loading, setLoading] = useState(false);

  // ==========================
  // Cargar cambios
  // ==========================
  const cargar = () => {
    setLoading(true);

    // Si quieres en el futuro filtrar por "todos" vs "pendientes"
    const estados =
      modo === "todos"
        ? "PENDIENTE_SALIDA,PENDIENTE_INGRESO,VALIDADO_LOGISTICA,VALIDADO_CONTABILIDAD"
        : "PENDIENTE_SALIDA,PENDIENTE_INGRESO";

    api
      .get("/api/logistica/cambios-almacen/todos", { params: { estados } })
      .then((res) => {
        setRows(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Error cargando cambios:", err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, [modo]);

  // ==========================
  // Formateo de fecha
  // ==========================
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return isNaN(d) ? "-" : d.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================
  // Clase de fila (opcional)
  // ==========================
  const getRowClass = (estado) => {
    if (!estado) return "";
    const e = estado.toLowerCase();
    if (e.includes("salida")) return "row-salida";
    if (e.includes("entrada")) return "row-entrada";
    if (e.includes("ajuste")) return "row-ajuste";
    return "";
  };

  // ==========================
  // Filtrado por texto
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

  return (
    <div className="table-wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <strong>Historial de cambios de almacén</strong>

        <button
          onClick={() =>
            setModo((m) => (m === "pendientes" ? "todos" : "pendientes"))
          }
          className="btn-ir"
          style={{ padding: "6px 12px" }}
        >
          {modo === "todos" ? "Solo pendientes" : "Listar todo"}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Emp.Origen</th>
            <th>Alm.Origen</th>
            <th>Fabricante Origen</th>
            <th>Emp.Destino</th>
            <th>Alm.Destino</th>
            <th>Fabricante Destino</th>
            <th>Stock</th>
            <th>Cantidad</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="12" style={{ textAlign: "center", padding: 16 }}>
                Cargando...
              </td>
            </tr>
          ) : rowsFiltrados.length === 0 ? (
            <tr>
              <td colSpan="12" style={{ textAlign: "center", padding: 16 }}>
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            rowsFiltrados.map((r) => (
              <tr key={r.id} className={getRowClass(r.estado)}>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {r.codigo_producto || "-"}
                    {r.codigo_modelo && ` · ${r.codigo_modelo}`}
                    <br />
                    {r.producto || "-"}
                  </div>
                </td>
                <td>{r.empresa_origen || "-"}</td>
                <td>{r.almacen_origen || "-"}</td>
                <td>{r.fabricante_origen || "-"}</td>
                <td>{r.empresa_destino || "-"}</td>
                <td>{r.almacen_destino || "-"}</td>
                <td>{r.fabricante_destino || "-"}</td>
                <td>{r.cantidad_disponible}</td>
                <td>{r.cantidad}</td>
                <td>{formatFecha(r.created_at)}</td>
                <td>
                  <span className={`estado estado-${r.estado}`}>
                    {r.estado.replaceAll("_", " ")}
                  </span>
                </td>
                <td>
                  <Link
                    to={`/logistica/producto/${r.producto_id}`}
                    className="btn-ir"
                  >
                    Ir →
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
