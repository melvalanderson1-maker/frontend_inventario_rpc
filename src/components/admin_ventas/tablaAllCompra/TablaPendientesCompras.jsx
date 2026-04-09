import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../../../api/api";



import EditAndDelete from "../productos/EditAndDelete";//IMPORT PARA EL OJITO
import "./TablaPendientesCompras.css";

export default function TablaPendientesCompras({ filtro = "" }) {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  //PARA EL OJITO

  const [productoEditar, setProductoEditar] = useState(null);

  const cargar = () => {
    setLoading(true);

    const estados = "VALIDADO_LOGISTICA";

    api
      .get("/api/compras/movimientos/todos", { params: { estados } })
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const formatPrecio = (precio) =>
    precio == null ? "-" : `S/ ${Number(precio).toFixed(2)}`;

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return isNaN(d) ? "-" : d.toLocaleString();
  };

  const formatEstado = (estado) => {
    const estadosMap = {
      VALIDADO_LOGISTICA: "VALIDADO",
    };

    return estadosMap[estado] || estado?.replaceAll("_", " ") || "-";
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
        .some((campo) =>
          campo.toString().toLowerCase().includes(texto)
        )
    );
  }, [rows, filtro]);

  return (
    <>
      <div className="tabla-header">
        <h3>Pendientes de Compras</h3>
      </div>

      <table className="tabla-pendientes">
        <thead>
          <tr>
            <th>PRODUCTO</th>
            <th>Tipo</th>
            <th>OP</th>
            <th>Fabricante</th>
            <th>COSTO</th>
            <th>Cant</th>
            <th>Empresa</th>
            <th>F Registro</th>
            <th>Almacén</th>
            <th>F Validación</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="12" className="center">
                Cargando...
              </td>
            </tr>
          ) : rowsFiltrados.length === 0 ? (
            <tr>
              <td colSpan="12" className="center">
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            rowsFiltrados.map((r) => (
              <tr
                key={r.id}
                className={getRowClass(r.tipo_movimiento)}
                onClick={() =>
                  navigate(`/compras/producto/${r.producto_id}`)
                }
              >
                <td className="producto-cell">
                  <div className="producto-codigo">
                    {r.producto_codigo || "-"}
                    {r.codigo_modelo && ` · ${r.codigo_modelo}`}
                  </div>

                  <div
                    className="producto-desc"
                    title={r.producto_descripcion}
                  >
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
                    {formatEstado(r.estado)}
                  </span>
                </td>

                <td className="col-accion">
                  <div className="acciones-wrapper">

                                        {/* BOTÓN OJITO */}
                    <button
                      className="btn-eye"
                      onClick={async (e) => {
                        e.stopPropagation();

                        try {
                          const res = await api.get(`/api/compras/productos/${r.producto_id}`);
                          setProductoEditar(res.data.producto);
                        } catch (error) {
                          console.error("Error cargando producto:", error);
                        }
                      }}
                      title="Ver detalles"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </button>

                    {/* BOTÓN IR */}
                    <Link
                      to={`/compras/producto/${r.producto_id}`}
                      className="btn-ir"
                      onClick={(e) => e.stopPropagation()}
                      title="Ir al producto"
                    >
                      →
                    </Link>



                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


      <EditAndDelete
        producto={productoEditar}
        abierto={!!productoEditar}
        onCerrar={() => setProductoEditar(null)}
        onActualizado={cargar}
      />
    </>
  );
}