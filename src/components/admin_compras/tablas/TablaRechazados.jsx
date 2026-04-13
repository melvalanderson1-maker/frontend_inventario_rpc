import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import ModalEditarRechazado from "../modales/ModalEditarRechazado";
import "./Historial.css";

export default function TablaRechazados({
  productoId,
  varianteId,
  filtro = "",
}) {
  const [rows, setRows] = useState([]);
  const [movSeleccionado, setMovSeleccionado] = useState(null);

  const cargar = () => {
    api
      .get("/api/compras/movimientos", {
        params: {
          productoId: varianteId || productoId,
          estados: "RECHAZADO_LOGISTICA",
        },
      })
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]));
  };

  useEffect(() => {
    cargar();
  }, [productoId, varianteId]);

  // 🔥 MISMO FORMATO QUE HISTORIAL
  const formatPrecio = (precio) =>
    precio == null ? "-" : `S/ ${Number(precio).toFixed(2)}`;

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

  const cortar = (text, n = 40) => {
    if (!text) return "-";
    return text.length > n ? text.slice(0, n) + "…" : text;
  };

  // 🔥 ESTA ES LA CLAVE (MISMA LOGICA QUE HISTORIAL)
  const obtenerCosto = (r) => {
    if (r.tipo_movimiento === "salida") {
      return r.costo_anterior;
    }
    return r.precio;
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
        <div className="tabla tabla-rechazados-grid">

          {/* HEADER */}
          <div className="fila header">
            <div>Tipo</div>
            <div>OP</div>
            <div>Fabricante</div>

            <div className="num">Costo</div>
            <div className="num">Cantidad</div>

            <div>Empresa</div>

            <div>F Registro</div>
            <div>Rechazado por</div>

            <div>Estado</div>

            <div>Motivo</div>

            <div>Acción</div>
          </div>

          {/* BODY */}
          {rowsFiltrados.length === 0 ? (
            <div className="empty">No hay datos</div>
          ) : (
            rowsFiltrados.map((r) => {
              const costo = obtenerCosto(r); // 🔥 AQUI USAS LA LOGICA

              return (
                <div
                  key={r.id}
                  className={`fila fila-rechazada ${getRowClass(
                    r.tipo_movimiento
                  )}`}
                >
                  <div>{r.tipo_movimiento}</div>

                  <div>{r.op_vinculada || "-"}</div>

                  <div>{cortar(r.fabricante)}</div>

                  {/* 🔥 COSTO CORRECTO */}
                  <div className="num">
                    {formatPrecio(costo)}
                  </div>

                  <div className="num">{r.cantidad}</div>

                  <div>{r.empresa}</div>

                  <div>{formatFecha(r.fecha_creacion)}</div>

                  <div>{r.usuario_logistica || "-"}</div>

                  <div>
                    <span className={`estado estado-${r.estado}`}>
                      {r.estado?.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div
                    className="texto-error"
                    onClick={() => alert(r.motivo_rechazo)}
                  >
                    {cortar(r.motivo_rechazo)}
                  </div>

                  <div>
                    <button
                      className="btn-warning"
                      onClick={() => setMovSeleccionado(r)}
                    >
                      Corregir
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL */}
      {movSeleccionado && (
        <ModalEditarRechazado
          movimientoId={movSeleccionado.id}
          onClose={() => setMovSeleccionado(null)}
          onSuccess={() => {
            setMovSeleccionado(null);
            cargar();
          }}
        />
      )}
    </>
  );
}