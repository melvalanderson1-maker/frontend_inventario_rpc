import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/api";
import "./ModalMovimientoDetalle.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaWhatsapp, FaDownload } from "react-icons/fa";

export default function ModalMovimientoDetalle({ movimientoId, onClose }) {
  const [movimiento, setMovimiento] = useState(null);
  const [formato, setFormato] = useState("pdf"); // pdf | imagen
  const contentRef = useRef();

  useEffect(() => {
    if (!movimientoId) return;

    api
      .get(`/api/logistica/movimientos/${movimientoId}/detalle`)
      .then((res) => setMovimiento(res.data))
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
  // 🖼️ GENERAR IMAGEN
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
  // 📄 GENERAR PDF (UNA SOLA HOJA SIEMPRE)
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

    // Le dejamos el archivo listo descargado
    await descargar();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ================= HEADER ================= */}
        <div className="modal-header">
          <div className="modal-logo">
            {/* ⚠️ Coloca tu logo real aquí */}
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
              <tr>
                <td>Cantidad Logística</td>
                <td>{movimiento.cantidad}</td>
              </tr>
              <tr>
                <td>Cantidad Real</td>
                <td>{movimiento.cantidad_real ?? "-"}</td>
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
              <tr>
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
