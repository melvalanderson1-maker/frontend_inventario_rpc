import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";

import "./MovimientosTablas.css";

export default function TablaPendientesContabilidad({
  productoId,
  varianteId,
  filtro = "",
}) {
  const [rows, setRows] = useState([]);
  const [movSeleccionado, setMovSeleccionado] = useState(null);
  const [showValidar, setShowValidar] = useState(false);
  const [showRechazar, setShowRechazar] = useState(false);

  useEffect(() => {
    cargar();
  }, [productoId, varianteId]);

  const cargar = () => {
    api
      .get("/api/contabilidad/movimientos", {
        params: {
          productoId: varianteId || productoId,
          estados: "PENDIENTE_LOGISTICA",
        },
      })
      .then((res) => {
        console.log("📥 ROWS LOGISTICA →", res.data);
        setRows(res.data || []);
      })
      .catch(() => setRows([]));
  };

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
        r.estado,
        r.fecha_creacion,
      ]
        .filter(Boolean)
        .some((campo) => campo.toString().toLowerCase().includes(texto))
    );
  }, [rows, filtro]);

  const abrirValidar = (mov) => {
    console.log("🟢 VALIDAR CLICK →", mov);

    // 🔥 Ahora sí deben venir IDs
    if (!mov?.producto_id || !mov?.empresa_id) {
      alert("❌ Este movimiento no tiene IDs internos completos");
      return;
    }

    setMovSeleccionado(mov);
    setShowValidar(true);
  };

  const abrirRechazar = (mov) => {
    console.log("🟡 CLICK RECHAZAR →", mov);
    setMovSeleccionado(mov);
    setShowRechazar(true);
  };

  const onProcesado = () => {
    setShowValidar(false);
    setShowRechazar(false);
    setMovSeleccionado(null);
    cargar();
  };

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
            <th style={{ width: 160 }}></th>
          </tr>
        </thead>

        <tbody>
          {rowsFiltrados.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: 16 }}>
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            rowsFiltrados.map((r) => (
              <tr key={r.id} className={getRowClass(r.tipo_movimiento)}>
                <td>{r.tipo_movimiento}</td>
                <td>{r.op_vinculada || "-"}</td>
                <td>{r.fabricante || "-"}</td>
                <td className="td-num">{formatPrecio(r.precio)}</td>
                <td>{r.cantidad}</td>
                <td>{r.empresa}</td>
                <td>{formatFecha(r.fecha_creacion)}</td>
                <td>
                  <span className={`estado estado-${r.estado}`}>
                    {r.estado.replaceAll("_", " ")}
                  </span>
                </td>
                <td>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


    </div>
  );
}
