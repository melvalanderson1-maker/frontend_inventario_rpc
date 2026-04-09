import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/api";
import ModalMovimientoDetalle from "../modales/ModalMovimientoDetalle";
import "./MovimientosTablas.css";

export default function TablaAprobadosContabilidad({ productoId, varianteId, filtro = "" }) {
  const [rows, setRows] = useState([]);
  const [modalMovimiento, setModalMovimiento] = useState(null);
  
  const [modalImagen, setModalImagen] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);



  const [modalRechazo, setModalRechazo] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [toast, setToast] = useState(null);

  const fetchMovimientos = () => {
    api
      .get("/api/contabilidad/movimientos", {
        params: { productoId: varianteId || productoId, estados: "VALIDADO_LOGISTICA" },
      })
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]));
  };

  useEffect(() => {
    fetchMovimientos();
  }, [productoId, varianteId]);

  const formatPrecio = (precio) => (precio == null ? "-" : `S/ ${Number(precio).toFixed(2)}`);
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d)) return "-";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
      ]
        .filter(Boolean)
        .some((campo) => campo.toString().toLowerCase().includes(texto))
    );
  }, [rows, filtro]);

  const handleValidar = async (id) => {
    try {
      await api.post(`/api/contabilidad/movimientos/${id}/validar`);
      fetchMovimientos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al validar");
    }
  };




  const handleRechazar = async (id) => {
    const observaciones = prompt("Ingrese el motivo del rechazo:");
    if (!observaciones) return;
    await api.post(`/api/contabilidad/movimientos/${id}/rechazar`, { observaciones });
    fetchMovimientos();
  };





   const abrirModal = (url) => {
    setModalImagen(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
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



  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      setToast({ tipo: "error", mensaje: "Debe ingresar el motivo del rechazo" });
      return;
    }

    try {
      await api.post(
        `/api/contabilidad/movimientos/${modalRechazo}/rechazar`,
        { observaciones: motivoRechazo }
      );

      setToast({ tipo: "success", mensaje: "Movimiento rechazado correctamente" });
      setModalRechazo(null);
      setMotivoRechazo("");
      fetchMovimientos();
    } catch (err) {
      setToast({
        tipo: "error",
        mensaje: err.response?.data?.error || "Error al rechazar",
      });
    }

    setTimeout(() => setToast(null), 3000);
  };


  return (
    <div className="table-wrapper">
      {toast && (
          <div className={`toast toast-${toast.tipo}`}>
            {toast.mensaje}
          </div>
        )}

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
        onClick={cerrarModal}
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
            onClick={cerrarModal}
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

    {modalRechazo && (
      <div className="modal-overlay">
        <div className="modal-rechazo">
          <h3>Motivo del Rechazo</h3>

          <textarea
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
            placeholder="Escriba el motivo..."
          />

          <div className="modal-buttons">
            <button
              className="btn-modal-cancelar"
              onClick={() => setModalRechazo(null)}
            >
              Cancelar
            </button>

            <button
              onClick={confirmarRechazo}
              className="btn-danger"
            >
              Confirmar Rechazo
            </button>
          </div>
        </div>
      </div>
    )}
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>OP vinc</th>
            <th>Fabricante</th>
            <th>COSTO</th>
            <th>Cantidad</th>
            <th>Empresa</th>
            <th>F Registro</th>
            <th>Lug Almac</th>
            <th>Imagen Evidencia</th>
            <th>F Validación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rowsFiltrados.length === 0 ? (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: 16 }}>No se encontraron resultados</td>
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
                <td>{r.almacen}</td>
                <td>
                  {r.imagenes ? (
                    (() => {
                      let imagenes = [];

                      try {
                        imagenes =
                          typeof r.imagenes === "string"
                            ? JSON.parse(r.imagenes)
                            : r.imagenes;
                      } catch {
                        imagenes = [];
                      }

                      if (!imagenes || imagenes.length === 0) return "-";

                      return (
                        <div style={{ display: "flex", gap: 6 }}>
                          {imagenes.map((img, index) => (
                            <img
                              key={index}
                              src={img.url}
                              alt="Evidencia"
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                                cursor: "pointer",
                                borderRadius: 6,
                              }}
                              onClick={() => abrirModal(img.url)}
                            />
                          ))}
                        </div>
                      );
                    })()
                  ) : (
                    "-"
                  )}
                </td>

                <td>{formatFecha(r.fecha_validacion_logistica)}</td>
                <td><span className={`estado estado-${r.estado}`}>{r.estado.replaceAll("_", " ")}</span></td>
                <td>
            
                <div className="acciones">
                  <button
                    className="btn-accion btn-detalle"
                    onClick={() => setModalMovimiento(r.id)}
                  >
                    🔍 Detalles
                  </button>

                  <button
                    className="btn-accion btn-validar"
                    onClick={() => handleValidar(r.id)}
                  >
                    ✔ Validar
                  </button>

                  <button
                    className="btn-accion btn-rechazar"
                    onClick={() => setModalRechazo(r.id)}
                  >
                    ✖ Rechazar
                  </button>
                </div>
              
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
