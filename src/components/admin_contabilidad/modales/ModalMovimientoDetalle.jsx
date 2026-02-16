import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/api";
import "./ModalMovimientoDetalle.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaWhatsapp, FaDownload } from "react-icons/fa";

export default function ModalMovimientoDetalle({ movimientoId, onClose }) {
  const [movimiento, setMovimiento] = useState(null);
  const [cantidadReal, setCantidadReal] = useState(0);
  const [formato, setFormato] = useState("pdf");
  const contentRef = useRef();

  const [modalImagen, setModalImagen] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);

  const [observacionesConta, setObservacionesConta] = useState("");
  const [toast, setToast] = useState(null);
  const [guardadoGeneral, setGuardadoGeneral] = useState(false);



  const [imagenesGuardadas, setImagenesGuardadas] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);


  useEffect(() => {
    if (!movimientoId) return;

    api
      .get(`/api/contabilidad/movimientos/${movimientoId}/detalle`)
      .then((res) => {
        setMovimiento(res.data);

        const imagenesConta =
          typeof res.data.imagenes_contabilidad === "string"
            ? JSON.parse(res.data.imagenes_contabilidad)
            : res.data.imagenes_contabilidad || [];

        setImagenesGuardadas(imagenesConta);

        setCantidadReal(res.data.cantidad_real || res.data.cantidad || 0);
        setObservacionesConta(res.data.observaciones_contabilidad || "");
        setGuardadoGeneral(
          !!res.data.cantidad_real && !!res.data.observaciones_contabilidad
        );
      })
      .catch(() => {
        alert("No se pudo cargar el detalle.");
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
    return d.toLocaleString();
  };

  const abrirModal = (url) => {
    setModalImagen(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleGuardarGeneral = async () => {
    if (!cantidadReal) return setToast("Ingrese cantidad real");
    if (!observacionesConta.trim())
      return setToast("Ingrese observaciones");

    try {
      const formData = new FormData();
      formData.append("cantidad_real", cantidadReal);
      formData.append("observaciones_contabilidad", observacionesConta);

      imagenesNuevas.forEach((img) =>
        formData.append("imagenes", img.file)
      );


      const res = await api.post(
        `/api/contabilidad/movimientos/${movimiento.id}/guardar-general`,
        formData
      );

      // 🔥 ACTUALIZAR LAS GUARDADAS CON LO QUE DEVUELVE EL BACKEND
      setImagenesGuardadas(res.data.imagenes || []);

      // 🔥 ACTUALIZAR MOVIMIENTO SIN RECARGAR
      setMovimiento(prev => ({
        ...prev,
        usuario_contabilidad: res.data.usuario_contabilidad,
        fecha_validacion_contabilidad: res.data.fecha_validacion_contabilidad,
        cantidad_real: cantidadReal,
        observaciones_contabilidad: observacionesConta
      }));



          // 🔥 AQUI VA
      setImagenesNuevas([]);


      setGuardadoGeneral(true);
      setToast("Guardado con éxito ✅");
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast("Error guardando");
    }
  };

  const renderEvidencias = (imagenes) => {
    if (!imagenes || imagenes.length === 0) return "-";

    return (
      <div className="imagenes-grid">
        {imagenes.map((img, index) => (
          <img
            key={index}
            src={img.url}
            alt="evidencia"
            onClick={() => abrirModal(img.url)}
          />
        ))}
      </div>
    );
  };

  const imagenesCompras =
    typeof movimiento.imagenes === "string"
      ? JSON.parse(movimiento.imagenes || "[]")
      : movimiento.imagenes || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      {toast && <div className="toast-success">{toast}</div>}

      {modalAbierto && (
        <div className="modal-img-viewer" onClick={cerrarModal}>
          <img src={modalImagen} alt="zoom" />
        </div>
      )}

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalle del Movimiento</h2>
        </div>

        <div ref={contentRef} className="modal-body">

          {/* ======= MATRIZ 2x3 ======= */}
          <div className="matrix-2x3">
            <div>
              <label>Tipo</label>
              <span>{movimiento.tipo_movimiento}</span>
            </div>
            <div>
              <label>OP Vinculada</label>
              <span>{movimiento.op_vinculada || "-"}</span>
            </div>
            <div>
              <label>Empresa</label>
              <span>{movimiento.empresa}</span>
            </div>
            <div>
              <label>Fabricante</label>
              <span>{movimiento.fabricante || "-"}</span>
            </div>
            <div>
              <label>Almacén</label>
              <span>{movimiento.almacen || "-"}</span>
            </div>
            <div>
              <label>Precio</label>
              <span>{formatPrecio(movimiento.precio)}</span>
            </div>

            <div>
              <label>N° Orden</label>
              <span>{movimiento.numero_orden || "-"}</span>
            </div>
            <div>
              <label>Estado</label>
              <span>{movimiento.estado.replaceAll("_", " ")}</span>
            </div>


          </div>

          {/* ======= MATRIZ PROCESO 3 COLUMNAS ======= */}
          <div className="matrix-3cols">

            {/* COMPRAS */}
            <div className="col">
              <h4>Compras</h4>
              <p><strong>Usuario:</strong> {movimiento.usuario_compras || "-"}</p>
              <p><strong>Fecha Registro:</strong> {formatFecha(movimiento.fecha_creacion)}</p>
              <p>
                <strong>Cantidad Solicitada:</strong>{" "}
                {movimiento.cantidad_solicitada ?? "-"}
              </p>
              <p><strong>Observaciones:</strong> {movimiento.observaciones || "-"}</p>

              <p><strong>Evidencias:</strong></p>
              {renderEvidencias(imagenesCompras)}
            </div>

            {/* LOGISTICA */}
            <div className="col">
              <h4>Logística</h4>
              <p><strong>Usuario:</strong> {movimiento.usuario_logistica || "-"}</p>
              <p><strong>Fecha Validación:</strong> {formatFecha(movimiento.fecha_validacion_logistica)}</p>
              <p>
                <strong>Cantidad Validada:</strong>{" "}
                {movimiento.cantidad ?? "-"}
              </p>
              <p><strong>Observaciones:</strong> {movimiento.observacion_logistica || "-"}</p>
              <p><strong>Evidencias:</strong></p>
              {renderEvidencias(imagenesCompras)}
            </div>

            {/* CONTABILIDAD */}
            <div className="col">
              <h4>Contabilidad</h4>
              <p><strong>Usuario:</strong> {movimiento.usuario_contabilidad || "-"}</p>
              <p><strong>Fecha Validación:</strong> {formatFecha(movimiento.fecha_validacion_contabilidad)}</p>

              <textarea
                value={observacionesConta}
                onChange={(e) => setObservacionesConta(e.target.value)}
                placeholder="Observaciones contabilidad..."
              />

              <p><strong>Evidencias:</strong></p>
              {renderEvidencias(imagenesGuardadas)}


              {/* PREVIEW NUEVAS */}
              {imagenesNuevas.length > 0 && (
                <div className="imagenes-grid">
                  {imagenesNuevas.map((img) => (
                    <div key={img.id} className="preview-wrapper">
                      <img src={img.url} alt="preview" />

                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => {
                          setImagenesNuevas(prev =>
                            prev.filter(i => i.id !== img.id)
                          );
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}


              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  const nuevas = files.map(file => ({
                    id: crypto.randomUUID(),
                    file,
                    url: URL.createObjectURL(file)
                  }));

                  setImagenesNuevas(prev => [...prev, ...nuevas]);
                }}

              />

              <div className="conta-actions">
                <input
                  type="number"
                  value={cantidadReal}
                  onChange={(e) => setCantidadReal(e.target.value)}
                />
              <button
                onClick={handleGuardarGeneral}
                className={guardadoGeneral ? "btn-guardado" : "btn-guardar"}
              >
                {guardadoGeneral ? "✓ Guardado" : "Guardar"}
              </button>
              </div>
            </div>
          </div>
        </div>

        <button className="modal-close-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
