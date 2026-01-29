import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import { Link } from "react-router-dom";

export default function TablaHistorial({ filtro = "" }) {
  const [rows, setRows] = useState([]);
  const [modo, setModo] = useState("logistica"); // logistica | todos
  const [loading, setLoading] = useState(false);

  const cargar = () => {
    setLoading(true);

    const estados =
      modo === "todos"
        ? "PENDIENTE_LOGISTICA,VALIDADO_LOGISTICA,RECHAZADO_LOGISTICA,APROBADO_FINAL,RECHAZADO_CONTABILIDAD,PENDIENTE_CONTABILIDAD"
        : "PENDIENTE_LOGISTICA,VALIDADO_LOGISTICA,RECHAZADO_LOGISTICA";

    api
      .get("/api/contabilidad/movimientos/todos", { params: { estados } })
      .then((res) => {
        console.log("🧪 MOVIMIENTOS FRONT:", res.data);
        setRows(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Error cargando movimientos:", err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, [modo]);

  const formatPrecio = (precio) => {
    if (precio === null || precio === undefined) return "-";
    return `S/ ${Number(precio).toFixed(2)}`;
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
        r.producto_codigo,
        r.codigo_modelo,
        r.producto_descripcion,
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
        <strong>Historial de movimientos</strong>

        <button
          onClick={() => setModo((m) => (m === "logistica" ? "todos" : "logistica"))}
          className="btn-ir"
          style={{ padding: "6px 12px" }}
        >
          {modo === "todos" ? "Solo logística" : "Listar todo"}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Tipo</th>
            <th>OP</th>
            
            <th>Fabricante</th>
            <th>Precio</th>
            <th>Cant</th>
            <th>Empresa</th>
            <th>F Registro</th>
            <th>Almacén</th>
            <th>F Validación</th>
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
              <tr key={r.id} className={getRowClass(r.tipo_movimiento)}>
                                {/* ✅ PRODUCTO: CÓDIGO + MODELO + DESCRIPCIÓN */}
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {r.producto_codigo || "-"}
                    {r.codigo_modelo && ` · ${r.codigo_modelo}`}
                  </div>
                </td>
                <td>{r.tipo_movimiento}</td>
                <td>{r.op_vinculada || "-"}</td>



                <td>{r.fabricante || "-"}</td>
                <td className="td-num">{formatPrecio(r.precio)}</td>
                <td>{r.cantidad}</td>
                <td>{r.empresa}</td>
                <td>{formatFecha(r.fecha_creacion)}</td>
                <td>{r.almacen}</td>
                <td>{formatFecha(r.fecha_validacion_logistica)}</td>
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
