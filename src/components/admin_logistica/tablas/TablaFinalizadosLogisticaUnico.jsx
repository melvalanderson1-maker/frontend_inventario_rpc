import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import { Link, useParams } from "react-router-dom";
import ModalMovimientoDetalle from "../modales/ModalMovimientoDetalle";
import "../tablaAll/BotonElegante.css";

export default function TablaFinalizadosLogisticaUnico({ filtro = "", productoId: productoIdProp }) {
  const params = useParams();
  const productoId = productoIdProp || params.productoId || null;

  const [rows, setRows] = useState([]);
  const [modo, setModo] = useState("logistica"); // logistica | todos
  const [loading, setLoading] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState(null);

  // Función para cargar movimientos
  const cargar = () => {
    setLoading(true);

    const estados =
      modo === "todos"
        ? "APROBADO_FINAL,RECHAZADO_CONTABILIDAD"
        : "APROBADO_FINAL,RECHAZADO_CONTABILIDAD";

    const request = productoId
      ? api.get("/api/logistica/movimientos", {
          params: {
            productoId,
            estados,
          },
        })
      : api.get("/api/logistica/movimientos/todos", { params: { estados } });

    request
      .then((res) => {
        console.log("🧪 MOVIMIENTOS FRONT LOGISTICA:", res.data);
        setRows(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Error cargando movimientos LOGISTICA:", err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, [modo, productoId]);

  // Formateo de precios
  const formatPrecio = (precio) => {
    if (precio === null || precio === undefined) return "-";
    return `S/ ${Number(precio).toFixed(2)}`;
  };

  // Formateo de fechas
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d)) return "-";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Clases para filas según tipo
  const getRowClass = (tipo) => {
    if (!tipo) return "";
    const t = tipo.toLowerCase();
    if (t.includes("entrada")) return "row-entrada";
    if (t.includes("salida")) return "row-salida";
    if (t.includes("ajuste")) return "row-ajuste";
    return "";
  };

  // Filtrado de filas según texto
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
        <strong>Movimientos Finalizados Por Contabilidad</strong>

        <button
          onClick={() =>
            setModo((m) => (m === "logistica" ? "todos" : "logistica"))
          }
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
                  <button onClick={() => setModalMovimiento(r.id)}>
                    Detalles
                  </button>
                  <Link
                    to={`/logistica/producto/${r.producto_id}`}
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
