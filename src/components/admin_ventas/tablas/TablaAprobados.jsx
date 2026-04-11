import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import "./Historial.css";

export default function TablaAprobados({
  productoId,
  varianteId,
  filtro = "",
}) {
  const [rows, setRows] = useState([]);
  const [modalTexto, setModalTexto] = useState(null);

  const [modalImagen, setModalImagen] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    api
      .get("/api/compras/movimientos", {
        params: {
          productoId: varianteId || productoId,
          estados: "VALIDADO_LOGISTICA",
        },
      })
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]));
  }, [productoId, varianteId]);

  const formatPrecio = (precio) =>
    precio == null ? "-" : `S/ ${Number(precio).toFixed(2)}`;

  const formatPrecio4 = (precio) =>
    precio == null ? "-" : Number(precio).toFixed(4);

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
      Object.values(r)
        .filter(Boolean)
        .some((campo) =>
          campo.toString().toLowerCase().includes(texto)
        )
    );
  }, [rows, filtro]);

  const cortar = (text, n = 36) => {
    if (!text) return "-";
    return text.length > n ? text.slice(0, n) + "…" : text;
  };

  const abrirModal = (texto) => {
    if (!texto) return;
    setModalTexto(texto);
  };

  const abrirModalEvidencia = (url) => {
    setModalImagen(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setModalAbierto(true);
  };

  const cerrarModalEvidencia = () => {
    setModalImagen(null);
    setModalAbierto(false);
  };

  const manejarZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((z) => Math.min(Math.max(z + delta, 1), 5));
  };

  const iniciarDrag = (e) => {
    e.preventDefault();
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const moverDrag = (e) => {
    if (!dragStart) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const terminarDrag = () => setDragStart(null);

  return (
    <>
      {/* MODAL IMAGEN */}
      {modalAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={cerrarModalEvidencia}
          onMouseMove={moverDrag}
          onMouseUp={terminarDrag}
        >
          <img
            src={modalImagen}
            alt=""
            onClick={(e) => e.stopPropagation()}
            onWheel={manejarZoom}
            onMouseDown={iniciarDrag}
            style={{
              maxWidth: "80%",
              maxHeight: "80%",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              borderRadius: 10,
              cursor: "grab",
            }}
          />
        </div>
      )}

      {/* TABLA */}
      <div className="historial-container">
        <div className="tabla tabla-aprobados-grid">

          {/* HEADER */}
          <div className="fila header">
            <div>Tipo</div>
            <div>OP</div>
            <div>Fabricante</div>

            <div className="num">C/U</div>
            <div className="num">Q</div>
            <div className="num">Total</div>

            <div className="num">C. Prom</div>
            <div className="num">Stock</div>
            <div className="num">Valorizado</div>

            <div>Empresa</div>

            <div>F Registro</div>

            {/* 🔥 AQUÍ VA TU CAMBIO */}
            <div>Obs Compras</div>
            <div>Obs Logística</div>
            

            <div>Almacén</div>
            <div>Evidencia</div>
            <div>F Validación</div>

            <div>Estado</div>
          </div>

          {/* BODY */}
          {rowsFiltrados.length === 0 ? (
            <div className="empty">No hay datos</div>
          ) : (
            rowsFiltrados.map((r) => (
              <div
                key={r.id}
                className={`fila ${getRowClass(r.tipo_movimiento)}`}
              >
                <div>{r.tipo_movimiento}</div>
                <div>{r.op_vinculada || "-"}</div>

                <div onClick={() => abrirModal(r.fabricante)}>
                  {cortar(r.fabricante)}
                </div>

                <div className="num">
                  {r.tipo_movimiento === "salida"
                    ? formatPrecio(r.costo_anterior)
                    : formatPrecio(r.precio)}
                </div>

                <div className="num">{r.cantidad}</div>

                <div className="num">
                  {formatPrecio(
                    (r.precio || 0) * r.cantidad
                  )}
                </div>

                <div className="num">
                  {formatPrecio(r.costo_promedio_resultante)}
                  <div className="mini">
                    ({formatPrecio4(r.costo_promedio_resultante)})
                  </div>
                </div>

                <div className="num">{r.stock_resultante}</div>

                <div className="num strong">
                  {formatPrecio(
                    r.stock_resultante *
                      r.costo_promedio_resultante
                  )}
                </div>

                <div>{r.empresa}</div>

                <div>{formatFecha(r.fecha_creacion)}</div>

                {/* 🔥 NUEVO ORDEN */}
                <div onClick={() => abrirModal(r.observaciones_compras)}>
                  {cortar(r.observaciones_compras)}
                </div>

                <div onClick={() => abrirModal(r.observaciones_logistica)}>
                  {cortar(r.observaciones_logistica)}
                </div>



                <div onClick={() => abrirModal(r.almacen)}>
                  {cortar(r.almacen)}
                </div>

                <div>
                  {r.imagenes ? (
                    (() => {
                      let imgs = [];
                      try {
                        imgs =
                          typeof r.imagenes === "string"
                            ? JSON.parse(r.imagenes)
                            : r.imagenes;
                      } catch {}

                      if (!imgs.length) return "-";

                      return (
                        <div style={{ display: "flex", gap: 6 }}>
                          {imgs.map((img, i) => (
                            <img
                              key={i}
                              src={img.url}
                              alt=""
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 6,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                abrirModalEvidencia(img.url)
                              }
                            />
                          ))}
                        </div>
                      );
                    })()
                  ) : (
                    "-"
                  )}
                </div>

                <div>
                  {formatFecha(r.fecha_validacion_logistica)}
                </div>

                <div>
                  <span className={`estado estado-${r.estado}`}>
                    {r.estado?.replaceAll("_", " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL TEXTO */}
      {modalTexto && (
        <div className="modal-overlay" onClick={() => setModalTexto(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">{modalTexto}</div>
            <button onClick={() => setModalTexto(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}