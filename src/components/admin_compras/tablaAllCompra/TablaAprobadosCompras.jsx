import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import { Link } from "react-router-dom";
import ModalMovimientoDetalle from "../modales/ModalMovimientoDetalle";
import "./BotonElegante.css";

export default function TablaAprobadosCompras({ filtro = "" }) {
  const [rows, setRows] = useState([]);
  const [modo, setModo] = useState("compras"); // compras | todos
  const [loading, setLoading] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const estados =
        modo === "todos"
          ? "APROBADO_FINAL,RECHAZADO_CONTABILIDAD,RECHAZADO_LOGISTICA"
          : "APROBADO_FINAL";

      const { data } = await api.get("/api/compras/movimientos/todos", {
        params: { estados },
      });

      console.log("🧪 MOVIMIENTOS COMPRAS:", data);
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error cargando aprobados compras:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
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
    if (isNaN(d)) return "-";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
        r.producto_codigo,
        r.codigo_modelo,
        r.producto_descripcion,
        r.tipo_movimiento,
        r.op_vinculada,
        r.fabricante,
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

  return (
    <div className="table-wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <strong>Movimientos aprobados (Compras)</strong>

        <button
          onClick={() =>
            setModo((m) => (m === "compras" ? "todos" : "compras"))
          }
          className="btn-ir"
          style={{ padding: "6px 12px" }}
        >
          {modo === "todos" ? "Solo aprobados" : "Ver todo"}
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
            <th>Acciones</th>
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
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {r.producto_codigo || "-"}
                    {r.codigo_modelo && ` · ${r.codigo_modelo}`}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {r.producto_descripcion}
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
                    {r.estado?.replaceAll("_", " ")}
                  </span>
                </td>
                <td>
                  <button onClick={() => setModalMovimiento(r.id)}>
                    Detalles
                  </button>
                  <Link
                    to={`/compras/producto/${r.producto_id}`}
                    className="btn-ir"
                    style={{ marginLeft: 8 }}
                  >
                    Ir →
                  </Link>
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
