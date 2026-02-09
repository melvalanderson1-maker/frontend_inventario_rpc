import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import "./TablaAprobados.css";

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

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d)) return "-";

    // Formato dd/mm/yyyy hh:mm:ss
    const pad = (n) => n.toString().padStart(2, "0");

    const dia = pad(d.getDate());
    const mes = pad(d.getMonth() + 1); // Mes empieza en 0
    const año = d.getFullYear();
    const horas = pad(d.getHours());
    const minutos = pad(d.getMinutes());
    const segundos = pad(d.getSeconds());

    return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
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
        r.codigo_producto,
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
        r.observaciones_compras,
        r.observaciones_logistica,
      ]
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

  // Zoom centrado en cursor
  const manejarZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prevZoom) => {
      const newZoom = Math.min(Math.max(prevZoom + delta, 1), 5);

      // Ajustar offset para que el zoom sea relativo al cursor
      setOffset((prev) => ({
        x: prev.x - (cursorX - rect.width / 2) * (newZoom / prevZoom - 1),
        y: prev.y - (cursorY - rect.height / 2) * (newZoom / prevZoom - 1),
      }));

      return newZoom;
    });
  };

  // Drag para mover la imagen
  const iniciarDrag = (e) => {
    e.preventDefault();
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const moverDrag = (e) => {
    if (!dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const terminarDrag = () => setDragStart(null);


  return (
    <>
      {/* SCROLL SOLO AQUÍ */}
      <div className="tabla-aprobados-scroll">

      {modalAbierto && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          overflow: "hidden",
          cursor: dragStart ? "grabbing" : "grab",
        }}
        onClick={cerrarModalEvidencia}
        onMouseMove={moverDrag}
        onMouseUp={terminarDrag}
        onMouseLeave={terminarDrag}
      >
        <div
          style={{
            position: "relative",
            maxWidth: "80%",
            maxHeight: "80%",
          }}
          onClick={(e) => e.stopPropagation()} // prevenir cierre al clickear imagen
          onWheel={manejarZoom} // zoom solo en la imagen
        >
          {/* Botón de cerrar dentro de la imagen */}
          <button
            onClick={cerrarModalEvidencia}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              background: "rgba(255, 0, 0, 0.9)",
              color: "#ffffffce",
              border: "none",
              borderRadius: "50%",
              width: 35,
              height: 35,
              fontSize: 20,
              fontWeight: "bold",
              cursor: "pointer",
              zIndex: 1010,
              boxShadow: "0 0 5px rgba(212, 16, 16, 0.5)",
            }}
          >
            ×
          </button>

          <img
            src={modalImagen}
            alt="Evidencia"
            onMouseDown={iniciarDrag}
            style={{
              width: "100%",
              height: "520px",
              objectFit: "contain",
              borderRadius: 10,
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: dragStart ? "none" : "transform 0.1s",
              cursor: dragStart ? "grabbing" : "grab",
              display: "block",
            }}
          />
        </div>
      </div>
    )}
        <table className="tabla-aprobados">
          <colgroup>
            <col style={{ width: "90px" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "85px" }} />
            <col style={{ width: "85px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "125px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "170px" }} />
          </colgroup>

          <thead>
            <tr>
              <th>Tipo</th>
              <th>OP</th>
              <th>Fabricante</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Empresa</th>
              <th>F Registro</th>
              <th>Almacén</th>
              <th>Imagen Evidencia</th>
              <th>F Validación</th>
              <th>Obs Compras</th>
              <th>Obs Logística</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {rowsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={12} className="tabla-vacia">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              rowsFiltrados.map((r) => (
                <tr
                  key={r.id}
                  className={getRowClass(r.tipo_movimiento)}
                >
                  <td>{r.tipo_movimiento}</td>
                  <td>{r.op_vinculada || "-"}</td>

                  {/* ✅ FABRICANTE CLICKABLE */}
                  <td
                    className="td-click"
                    onClick={() => abrirModal(r.fabricante)}
                  >
                    {cortar(r.fabricante)}
                  </td>

                  <td className="td-num">{formatPrecio(r.precio)}</td>
                  <td className="td-num">{r.cantidad}</td>

                  {/* ✅ EMPRESA CLICKABLE */}
                  <td
                    className="td-click"
                    onClick={() => abrirModal(r.empresa)}
                  >
                    {cortar(r.empresa)}
                  </td>

                  <td>{formatFecha(r.fecha_creacion)}</td>

                  {/* ✅ ALMACÉN CLICKABLE */}
                  <td
                    className="td-click"
                    onClick={() => abrirModal(r.almacen)}
                  >
                    {cortar(r.almacen)}
                  </td>


                  <td>
                    {r.evidencia_url ? (
                      <img
                        src={r.evidencia_url}
                        alt="Evidencia"
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          cursor: "pointer",
                          borderRadius: 6,
                        }}
                        onClick={() => abrirModalEvidencia(r.evidencia_url)}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{formatFecha(r.fecha_validacion_logistica)}</td>

                  <td
                    className="td-obs"
                    onClick={() =>
                      abrirModal(r.observaciones_compras)
                    }
                  >
                    {cortar(r.observaciones_compras)}
                  </td>

                  <td
                    className="td-obs"
                    onClick={() =>
                      abrirModal(r.observaciones_logistica)
                    }
                  >
                    {cortar(r.observaciones_logistica)}
                  </td>

                  <td>
                    <span className={`estado estado-${r.estado}`}>
                      {r.estado?.replaceAll("_", " ")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalTexto && (
        <div
          className="modal-overlay"
          onClick={() => setModalTexto(null)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="modal-content">{modalTexto}</div>
            <button onClick={() => setModalTexto(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
