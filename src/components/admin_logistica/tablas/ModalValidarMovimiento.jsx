import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/api";
import { resolveImageUrl } from "../../../utils/imageUrl";
import SelectOrInput from "../../admin_compras/SelectOrInput";
import "./ModalMovimiento.css";

export default function ModalValidarMovimiento({
  movimiento,
  onClose,
  onSuccess,
}) {
  const [producto, setProducto] = useState(null);
  const [almacenes, setAlmacenes] = useState([]);

  const [cantidadReal, setCantidadReal] = useState(
    movimiento.cantidad_real ??
      movimiento.cantidad_solicitada ??
      movimiento.cantidad ??
      1
  );

  const [almacenId, setAlmacenId] = useState("");
  const [almacenNuevo, setAlmacenNuevo] = useState("");

  const [fechaLogistica, setFechaLogistica] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [numeroOrden, setNumeroOrden] = useState(movimiento.numero_orden || "");
  const [opVinculada, setOpVinculada] = useState(movimiento.op_vinculada || "");
  const [observaciones, setObservaciones] = useState("");
  const [imagen, setImagen] = useState(null);



  const [evidenciaImagen, setEvidenciaImagen] = useState(null); // 🖼️ para la evidencia
  const evidenciaInputRef = useRef(null); // ref para limpiar input

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tipo = (movimiento.tipo_movimiento || "").toUpperCase();
  const esSalida = tipo === "SALIDA";
  const esEntrada =
    tipo === "ENTRADA" || tipo === "SALDO_INICIAL" || tipo === "AJUSTE";

  // --------------------------------------------------
  // 📦 Cargar producto + almacenes válidos
  // --------------------------------------------------
  useEffect(() => {
    if (!movimiento?.id) return;

    console.log("🟢 MODAL ABIERTO → movimiento COMPLETO:", movimiento);

    if (!movimiento.producto_id) {
      console.error("❌ Falta producto_id:", movimiento);
      setError("Movimiento inválido: falta producto interno");
      return;
    }

    if (!movimiento.empresa_id) {
      console.error("❌ Falta empresa_id:", movimiento);
      setError("Movimiento inválido: falta empresa interna");
      return;
    }

    // 🔹 Producto
    api
      .get(`/api/logistica/productos/${movimiento.producto_id}`)
      .then((res) => setProducto(res.data.producto))
      .catch(() => setProducto(null));

    // 🔹 Almacenes válidos
    api
      .get("/api/logistica/almacenes-para-movimiento", {
        params: {
          productoId: movimiento.producto_id,
          empresaId: movimiento.empresa_id,
          fabricanteId: movimiento.fabricante_id || null,
          tipoMovimiento: tipo,
          almacenSolicitadoId: movimiento.almacen_id || null,
        },
      })
      .then((res) => {
        const lista = res.data.almacenes || [];
        setAlmacenes(lista);

        if (res.data.preseleccion) {
          setAlmacenId(String(res.data.preseleccion));
        } else if (res.data.almacenes?.length === 1) {
          setAlmacenId(String(res.data.almacenes[0].id));
        }
      })
      .catch((err) => {
        console.error("❌ ERROR cargando almacenes:", err);
        setAlmacenes([]);
      });
  }, [movimiento]);

  // --------------------------------------------------
  // 📤 Validar stock si es salida
  // --------------------------------------------------
  useEffect(() => {
    if (!esSalida || !almacenId || !cantidadReal) return;

    api
      .get("/api/logistica/validar-stock-disponible", {
        params: {
          productoId: movimiento.producto_id,
          empresaId: movimiento.empresa_id,
          almacenId,
          fabricanteId: movimiento.fabricante_id || null,
        },
      })
      .then((res) => {
        if (!res.data.cantidad) {
          setError(
            "❌ No existe stock para este producto en este almacén, empresa y fabricante."
          );
        } else if (res.data.cantidad < cantidadReal) {
          setError(`❌ Stock insuficiente. Disponible: ${res.data.cantidad}.`);
        } else {
          setError(null);
        }
      })
      .catch(() => setError("Error validando stock"));
  }, [cantidadReal, almacenId, movimiento, esSalida]);

  useEffect(() => {
    setError(null);
  }, [cantidadReal, almacenId, almacenNuevo, observaciones, fechaLogistica]);

  // --------------------------------------------------
  // ✅ Confirmar validación
  // --------------------------------------------------
  const confirmar = async () => {
    if (!cantidadReal || cantidadReal <= 0) {
      setError("Debe ingresar una cantidad válida");
      return;
    }

    if (!esSalida && !almacenId && !almacenNuevo) {
      setError("Debe seleccionar o crear un almacén");
      return;
    }

    if (esSalida && !almacenId) {
      setError("Movimiento inválido: sin almacén origen");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("cantidad_real", cantidadReal);
      if (!esSalida && almacenId) formData.append("almacen_id", almacenId);
      if (almacenNuevo) formData.append("almacen_nuevo", almacenNuevo);

      //FECHAA
      formData.append("fecha_validacion_logistica", fechaLogistica);


      if (numeroOrden) formData.append("numero_orden", numeroOrden);
      if (opVinculada) formData.append("op_vinculada", opVinculada);
      if (observaciones) formData.append("observaciones", observaciones);
      if (evidenciaImagen) formData.append("imagen", evidenciaImagen);

      await api.post(
        `/api/logistica/movimientos/${movimiento.id}/validar`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || "Error validando movimiento");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "almacen_id") {
      setAlmacenId(value);
      setAlmacenNuevo("");
    }
    if (name === "almacen_nuevo") {
      setAlmacenNuevo(value);
      setAlmacenId("");
    }
  };

  const p = producto || {};

  const isFormValid = () => {
    if (!cantidadReal || cantidadReal <= 0) return false;
    if (!esSalida && !almacenId && !almacenNuevo) return false;
    if (esSalida && (!almacenId || error)) return false; // bloquear si hay error
    return true;
  };


  // cuando seleccionan una nueva imagen de evidencia
  const handleEvidenciaChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenciaImagen(e.target.files[0]);
    }
  };

  // anular imagen de evidencia
  const anularEvidencia = () => {
    setEvidenciaImagen(null);
    if (evidenciaInputRef.current) evidenciaInputRef.current.value = "";
  };


  return (
    <div className="mov-modal-backdrop">
      <div className="mov-modal large">
        <h2>Validación logística</h2>

        <div className="mov-modal-body">
          {/* ---------------- HEADER PRODUCTO ---------------- */}
          <div className="mov-product-card">
            <img
              src={resolveImageUrl(p.imagen)}
              alt=""
              onError={(e) => (e.target.style.display = "none")}
            />
            <div>
              <h3>{p.descripcion || movimiento.producto}</h3>
              <p>{movimiento.codigo_modelo || movimiento.codigo_producto}</p>
              <p>
                {tipo} ·{" "}
                {movimiento.cantidad_solicitada ?? movimiento.cantidad} unidades
                solicitadas
              </p>
              <p>
                Empresa: <strong>{movimiento.empresa}</strong>
              </p>
              <p>
                Almacén solicitado: <strong>{movimiento.almacen || "—"}</strong>
              </p>
              {movimiento.fabricante && (
                <p>
                  Fabricante: <strong>{movimiento.fabricante}</strong>
                </p>
              )}
              {movimiento.precio != null && (
                <p>
                  Precio unitario:{" "}
                  <strong>S/ {Number(movimiento.precio).toFixed(2)}</strong>
                </p>
              )}
            </div>
          </div>

          {/* ---------------- OBSERVACIONES COMPRAS ---------------- */}
          {movimiento.observaciones_compras && (
            <div className="mov-info-box compras">
              <strong>🧾 Observaciones de compras</strong>
              <div>{movimiento.observaciones_compras}</div>
            </div>
          )}

          {/* ---------------- FORMULARIO LOGÍSTICA ---------------- */}
          <div className="mov-info-grid">
            <div>
              <label>Cantidad real *</label>
              <input
                type="number"
                min={1}
                value={cantidadReal}
                onChange={(e) => setCantidadReal(Number(e.target.value))}
              />
            </div>

            {/* 🔥 CAMPO ALMACÉN */}
            {esSalida ? (
              <div>
                <label>Almacén origen *</label>
                <input
                  value={almacenes[0]?.nombre || movimiento.almacen || ""}
                  disabled
                />
              </div>
            ) : (
              <SelectOrInput
                label="Almacén destino *"
                nameId="almacen_id"
                nameNuevo="almacen_nuevo"
                options={almacenes}
                value={almacenId}
                valueNuevo={almacenNuevo}
                onChange={handleChange}
                placeholder="Seleccione almacén existente"
                placeholderNuevo="O escriba uno nuevo"
              />
            )}

            <div>
              <label>
                {esSalida ? "Fecha real de salida *" : "Fecha real de ingreso *"}
              </label>
              <input
                type="date"
                value={fechaLogistica}
                onChange={(e) => setFechaLogistica(e.target.value)}
              />
            </div>

            <div>
              <label>Número de orden</label>
              <input
                value={numeroOrden}
                onChange={(e) => setNumeroOrden(e.target.value)}
                placeholder="Ej: OC-2026-00045"
              />
            </div>

            <div>
              <label>OP / Documento relacionado</label>
              <input
                value={opVinculada}
                onChange={(e) => setOpVinculada(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <div className="full">
              <label>Observaciones de logística *</label>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Se recibieron 95 unidades, 5 dañadas por transporte."
              />
            </div>

            <div className="full">
              <label>Imagen evidencia</label>

              {/* PREVIEW DE LA IMAGEN */}
              {evidenciaImagen && (
                <div className="preview-evidencia">
                  <img 
                    src={URL.createObjectURL(evidenciaImagen)} 
                    alt="Evidencia" 
                    style={{ maxWidth: "150px", maxHeight: "150px", marginBottom: "8px" }}
                  />
                  <br />
                  <button type="button" onClick={anularEvidencia}>
                    X Anular imagen de evidencia
                  </button>
                </div>
              )}

              {/* INPUT DE ARCHIVO */}
              <input
                type="file"
                accept="image/*"
                onChange={handleEvidenciaChange}
                ref={evidenciaInputRef}
              />
            </div>
          </div>

          {error && <div className="mov-error">{error}</div>}
        </div>

        <div className="mov-modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={confirmar} disabled={loading || !isFormValid()}>
            {loading ? "Procesando..." : "Confirmar validación"}
          </button>
        </div>
      </div>
    </div>
  );
}
