import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/api";
import "./ModalMovimientoDetalle.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaWhatsapp, FaDownload } from "react-icons/fa";

export default function ModalMovimientoDetalle({ movimientoId, onClose }) {
  const [movimiento, setMovimiento] = useState(null);
  const [cantidadReal, setCantidadReal] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [formato, setFormato] = useState("pdf"); // pdf | imagen
  const contentRef = useRef();


  const [modalImagen, setModalImagen] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    if (!movimientoId) return;

    api
      .get(`/api/contabilidad/movimientos/${movimientoId}/detalle`)
      .then((res) => {
        setMovimiento(res.data);
        setCantidadReal(res.data.cantidad_real || res.data.cantidad || 0);
      })
      .catch((err) => {
        console.error("Error cargando detalle:", err.response?.data || err);
        alert("No se pudo cargar el detalle del movimiento.");
        onClose();
      });
  }, [movimientoId]);

  if (!movimiento) return null;

  const formatPrecio = (precio) =>
    precio == null ? "-" : `S/ ${Number(precio).toFixed(2)}`;

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d)) return "-";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  // =============================
  // 🖼️ IMAGEN
  // =============================
  const generarImagen = async () => {
    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    return canvas.toDataURL("image/png");
  };

  // =============================
  // 📄 PDF (UNA SOLA HOJA)
  // =============================
  const generarPDF = async () => {
    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;

    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
    pdf.save(`movimiento-${movimiento.id}.pdf`);
  };

  // =============================
  // 📥 DESCARGAR
  // =============================
  const descargar = async () => {
    if (formato === "imagen") {
      const img = await generarImagen();
      const link = document.createElement("a");
      link.href = img;
      link.download = `movimiento-${movimiento.id}.png`;
      link.click();
    } else {
      await generarPDF();
    }
  };

  // =============================
  // 📲 WHATSAPP
  // =============================
  const compartirWhatsapp = async () => {
    const mensaje = `📄 Detalle del movimiento\n\nTipo: ${movimiento.tipo_movimiento}\nEmpresa: ${movimiento.empresa}\nEstado: ${movimiento.estado.replaceAll(
      "_",
      " "
    )}\nOP: ${movimiento.op_vinculada || "-"}`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    await descargar();
  };

  // =============================
  // 💾 GUARDAR CANTIDAD REAL
  // =============================
  const handleGuardarCantidadReal = async () => {
    if (cantidadReal <= 0) return alert("La cantidad real debe ser mayor que 0");

    setGuardando(true);
    try {
      const res = await api.post(
        `/api/contabilidad/movimientos/${movimiento.id}/guardar-cantidad-real`,
        { cantidad_real: cantidadReal }
      );

      alert(res.data.msg || "Cantidad real guardada ✅");
    } catch (error) {
      console.error(
        "Error guardando cantidad real:",
        error.response?.data || error
      );
      alert(error.response?.data?.msg || "No se pudo guardar. Verifica tu sesión");
    } finally {
      setGuardando(false);
    }
  };






  
  const handleValidar = async (id) => {
    await api.post(`/api/contabilidad/movimientos/${id}/validar`, {});
    fetchMovimientos();
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

  return (
    <div className="modal-overlay" onClick={onClose}>
                {modalAbierto && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.000001)",
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ================= HEADER ================= */}
        <div className="modal-header">
          <div className="modal-logo">
            <img src="/images/logi.png" alt="Logo Empresa" />
          </div>

          <div className="modal-actions">
            <select
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              className="formato-select"
            >
              <option value="pdf">PDF</option>
              <option value="imagen">Imagen</option>
            </select>

            <button onClick={descargar} title="Descargar">
              <FaDownload />
            </button>

            <button
              className="btn-whatsapp"
              onClick={compartirWhatsapp}
              title="Compartir por WhatsApp"
            >
              <FaWhatsapp />
            </button>
          </div>
        </div>

        {/* ================= CONTENIDO CAPTURABLE ================= */}
        <div ref={contentRef} className="modal-print-area">
          <div className="doc-header">
            <img src="/images/logi.png" alt="Logo" className="doc-logo" />
            <div>
              <h2>Detalle del Movimiento</h2>
              <p className="doc-subtitle">
                Documento generado automáticamente
              </p>
            </div>
          </div>

          <table className="detalle-table">
            <tbody>
              <tr>
                <td>Tipo</td>
                <td>{movimiento.tipo_movimiento}</td>
              </tr>
              <tr>
                <td>OP Vinculada</td>
                <td>{movimiento.op_vinculada || "-"}</td>
              </tr>
              <tr>
                <td>Fabricante</td>
                <td>{movimiento.fabricante || "-"}</td>
              </tr>
              <tr>
                <td>Precio</td>
                <td>{formatPrecio(movimiento.precio)}</td>
              </tr>
              <tr>
                <td>Cantidad Compras</td>
                <td>{movimiento.cantidad_solicitada}</td>
              </tr>

              <tr className="fila-logistica">
                <td>Cantidad Logística</td>
                <td>{movimiento.cantidad}</td>
              </tr>
              



              {/* 👇 EDITABLE + GUARDAR */}
              <tr  className="fila-conta">
                <td>Cantidad Real</td>
                <td className="cantidad-real-cell">
                  <input
                    type="number"
                    value={cantidadReal}
                    onChange={(e) => setCantidadReal(Number(e.target.value))}
                    min={0}
                    className="cantidad-input"
                  />
                  <button
                    onClick={handleGuardarCantidadReal}
                    disabled={guardando}
                    className="btn-guardar"
                  >
                    {guardando ? "Guardando..." : "Guardar"}
                  </button>
                </td>
              </tr>

              <tr>
                <td>Empresa</td>
                <td>{movimiento.empresa || "-"}</td>
              </tr>
              <tr>
                <td>Almacén</td>
                <td>{movimiento.almacen || "-"}</td>
              </tr>
              <tr>
              <td>Evidencia</td>
              <td>
                {movimiento.evidencia_url ? (
                  <img
                    src={movimiento.evidencia_url}
                    alt="Evidencia"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      cursor: "pointer",
                      borderRadius: 6,
                    }}
                    onClick={() => abrirModal(movimiento.evidencia_url)}
                  />
                ) : (
                  "-"
                )}
              </td>
            </tr>
              <tr> 
                <td>Fecha Registro</td>
                <td>{formatFecha(movimiento.fecha_creacion)}</td>
              </tr>
              <tr>
                <td>Fecha Validación Logística</td>
                <td>{formatFecha(movimiento.fecha_validacion_logistica)}</td>
              </tr>
              <tr>
                <td>Usuario Logística</td>
                <td>{movimiento.usuario_logistica || "-"}</td>
              </tr>
              <tr>
                <td>Usuario Contabilidad</td>
                <td>{movimiento.usuario_contabilidad || "-"}</td>
              </tr>
              <tr>
                <td>Estado</td>
                <td
                  className={`estado-chip ${
                    movimiento.estado === "APROBADO_FINAL"
                      ? "estado-aprobado"
                      : movimiento.estado === "RECHAZADO_CONTABILIDAD"
                      ? "estado-rechazado"
                      : ""
                  }`}
                >
                  {movimiento.estado.replaceAll("_", " ")}
                </td>
              </tr>
              <tr>
                <td>Número de Orden</td>
                <td>{movimiento.numero_orden || "-"}</td>
              </tr>
              <tr>
                <td>Observaciones Compras</td>
                <td>{movimiento.observaciones || "-"}</td>
              </tr>
              <tr className="fila-logistica">
                <td>Observaciones Logística</td>
                <td>{movimiento.observacion_logistica || "-"}</td>
              </tr>
              <tr>
                <td>Observaciones Contabilidad</td>
                <td>{movimiento.observacion_contabilidad || "-"}</td>
              </tr>
              <tr>
                <td>Motivo de Rechazo</td>
                <td>{movimiento.motivo_contabilidad || "-"}</td>
              </tr>
            </tbody>
          </table>

          <div className="doc-footer">
            <span>Generado el {formatFecha(new Date())}</span>
            <span>ID Movimiento #{movimiento.id}</span>
          </div>
        </div>

        <button className="modal-close-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
