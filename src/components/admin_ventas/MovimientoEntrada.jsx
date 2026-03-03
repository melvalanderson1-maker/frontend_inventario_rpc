import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { resolveImageUrl } from "../../utils/imageUrl";
import SelectOrInput from "./SelectOrInput";
import Toast from "../ui/Toast.jsx";
import "./Movimiento.css";

export default function MovimientoEntrada({
  modoEmbedded = false,
  tipo: tipoProp,
  onGuardarFinal,
  onCancelar
}) {
  const params = useParams();
  const navigate = useNavigate();

  const productoIdParam = params.productoId;
  const tipo = modoEmbedded ? tipoProp : "entrada";

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [varianteActiva, setVarianteActiva] = useState(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errores, setErrores] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  

  const emptyForm = {
    empresa_id: "",
    empresa_nueva: "",
    almacen_id: "",
    almacen_nuevo: "",
    fabricante_id: "",
    fabricante_nuevo: "",
    motivo_id: "",
    motivo_nuevo: "",
    op_vinculada: "",
    op_vinculada_nueva: "",
    precio: "",
    cantidad: "",
    observaciones: ""
  };

  /**
   * formsPorVariante = {
   *   [varianteId]: {
   *     data: {...},
   *     listo: boolean,
   *     dirty: boolean
   *   }
   * }
   */
  const [formsPorVariante, setFormsPorVariante] = useState({});
  const [form, setForm] = useState(emptyForm);

  const [empresas, setEmpresas] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [ops, setOps] = useState([]);
  const [preciosHistoricos, setPreciosHistoricos] = useState([]);

  const isHydratingRef = useRef(false);

  /* =====================================================
     CARGA INICIAL
  ===================================================== */
  useEffect(() => {
    Promise.all([
      !modoEmbedded && axios.get(`/api/compras/productos/${productoIdParam}`),
      axios.get("/api/empresas"),
      axios.get("/api/almacenes"),
      axios.get("/api/fabricantes"),
      axios.get(`/api/motivos-movimiento?tipo=entrada`),
      axios.get("/api/compras/ops-existentes")
    ]).then(([p, e, a, f, m, op]) => {
      if (!modoEmbedded && p) {
        const prod = p.data.producto;
        setProducto(prod);
        setVariantes(prod.variantes || []);

        if (prod.variantes?.length > 0) {
          const primera = prod.variantes[0];
          setVarianteActiva(primera);

          setFormsPorVariante({
            [primera.id]: {
              data: { ...emptyForm },
              listo: false,
              dirty: false
            }
          });

          setForm({ ...emptyForm });
        }
      }

      setEmpresas(e.data);
      setAlmacenes(a.data);
      setFabricantes(f.data);
      setMotivos(m.data);
      setOps(op.data || []);
    });
  }, [productoIdParam, tipo, modoEmbedded]);

  /* =====================================================
     HELPERS
  ===================================================== */
  const showToast = (msg, type = "error", ms = 2400) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), ms);
  };

  const productoEnUso = varianteActiva || producto;

  /* =====================================================
     VALIDACIÓN PROFESIONAL
  ===================================================== */
  const validarData = data => {
    const errs = {};

    if (!data.empresa_id && !data.empresa_nueva)
      errs.empresa = "Empresa obligatoria";

    if (!data.almacen_id && !data.almacen_nuevo)
      errs.almacen = "Almacén obligatorio";

    if (!data.motivo_id && !data.motivo_nuevo)
      errs.motivo = "Motivo obligatorio";

    if (!data.cantidad || Number(data.cantidad) <= 0)
      errs.cantidad = "Cantidad debe ser mayor a 0";

    if (data.precio === "" || Number(data.precio) < 0)
      errs.precio = "Precio inválido";

    return errs;
  };

  const esFormValido = data => Object.keys(validarData(data)).length === 0;

  const validarActual = () => {
    const errs = validarData(form);
    setErrores(errs);

    if (Object.keys(errs).length > 0) {
      showToast("⚠️ Completa todos los campos obligatorios");
      return false;
    }

    return true;
  };

  /* =====================================================
     CORE DE PERSISTENCIA
  ===================================================== */
  const persistirVariante = (varianteId, updater) => {
    setFormsPorVariante(prev => {
      const actual = prev[varianteId] || {
        data: { ...emptyForm },
        listo: false,
        dirty: false
      };

      const nuevo =
        typeof updater === "function" ? updater(actual) : updater;

      return {
        ...prev,
        [varianteId]: nuevo
      };
    });
  };

  const persistirActual = updater => {
    if (!productoEnUso) return;
    persistirVariante(productoEnUso.id, updater);
  };

  /* =====================================================
     CUANDO CAMBIAS DE VARIANTE
  ===================================================== */
  const obtenerFormDeVariante = variante => {
    const existente = formsPorVariante[variante.id];
    if (existente) return existente.data;

    const primera = variantes[0];
    const base =
      primera && formsPorVariante[primera.id]
        ? formsPorVariante[primera.id].data
        : emptyForm;

    persistirVariante(variante.id, {
      data: { ...base },
      listo: false,
      dirty: false
    });

    return { ...base };
  };

  /* =====================================================
     INPUT CHANGE
  ===================================================== */
  const handleChange = e => {
    const { name, value } = e.target;

    setForm(prev => {
      const nuevo = { ...prev, [name]: value };

      if (!isHydratingRef.current) {
        persistirActual(curr => ({
          ...curr,
          data: nuevo,
          dirty: true,
          listo: false
        }));
      }

      return nuevo;
    });

    setErrores(prev => ({ ...prev, [name]: null }));
  };

  /* =====================================================
     PRECIO AUTOMÁTICO POR VARIANTE
  ===================================================== */
  useEffect(() => {
    const cargarPrecios = async () => {
      if (!productoEnUso || !form.empresa_id || !form.almacen_id) {
        setPreciosHistoricos([]);
        return;
      }

      const estado = formsPorVariante[productoEnUso.id];
      if (estado?.dirty) return; // 🔒 si el usuario ya tocó algo, NO pisar

      try {
        const { data } = await axios.get("/api/compras/precio-stock", {
          params: {
            productoId: productoEnUso.id,
            empresa_id: form.empresa_id,
            almacen_id: form.almacen_id,
            fabricante_id: form.fabricante_id || null
          }
        });

        setPreciosHistoricos(data.historicos || []);

        if (data.precio_actual !== null && data.precio_actual !== undefined) {
          isHydratingRef.current = true;
          setForm(f => ({ ...f, precio: String(data.precio_actual) }));
          isHydratingRef.current = false;

          persistirActual(curr => ({
            ...curr,
            data: { ...curr.data, precio: String(data.precio_actual) }
          }));
        }
      } catch (e) {
        console.error("❌ Error cargando precios:", e);
        setPreciosHistoricos([]);
      }
    };

    cargarPrecios();
  }, [
    productoEnUso?.id,
    form.empresa_id,
    form.almacen_id,
    form.fabricante_id
  ]);

  useEffect(() => {
    if (!form.op_vinculada || !preciosHistoricos.length) return;

    const estado = formsPorVariante[productoEnUso?.id];
    if (estado?.dirty) return; // 🔒 no pisar si el usuario ya tocó algo

    const match = preciosHistoricos.find(
      p => p.op_vinculada === form.op_vinculada
    );

    if (match) {
      isHydratingRef.current = true;
      setForm(f => ({ ...f, precio: String(match.precio) }));
      isHydratingRef.current = false;

      persistirActual(curr => ({
        ...curr,
        data: { ...curr.data, precio: String(match.precio) }
      }));
    }
  }, [form.op_vinculada, preciosHistoricos, productoEnUso?.id]);


  /* =====================================================
     MÉTRICAS
  ===================================================== */
  const totalVariantes = variantes.length || 1;

  const variantesListas = useMemo(() => {
    return Object.values(formsPorVariante).filter(v => v.listo).length;
  }, [formsPorVariante]);

  const esProductoSimple = variantes.length === 0;
  const esUnaSolaVariante = variantes.length === 1;

  const formActualValido = useMemo(() => esFormValido(form), [form]);

  const totalListas =
    esProductoSimple || esUnaSolaVariante
      ? formActualValido
        ? 1
        : 0
      : variantesListas;

  const totalEsperadas =
    esProductoSimple || esUnaSolaVariante ? 1 : totalVariantes;

  /* =====================================================
     UX
  ===================================================== */
  const copiarDesdePrimera = () => {
    if (!variantes.length) return;

    const base = formsPorVariante[variantes[0].id]?.data || emptyForm;

    isHydratingRef.current = true;
    setForm({ ...base });
    isHydratingRef.current = false;

    persistirActual({
      data: { ...base },
      listo: false,
      dirty: false
    });

    showToast("📋 Datos copiados desde variante 1", "success", 1400);
  };

  const marcarComoListo = () => {
    if (!validarActual()) return;

    persistirActual(curr => ({
      ...curr,
      listo: true,
      dirty: false
    }));

    showToast("✅ Variante marcada como lista", "success", 1200);
  };

  const desmarcarListo = () => {
    persistirActual(curr => ({
      ...curr,
      listo: false
    }));

    showToast("↩ Variante marcada como pendiente", "success", 1200);
  };

  /* =====================================================
     GUARDAR
  ===================================================== */
  const confirmarGuardar = () => {
    if (totalListas === 0) {
      showToast("⚠️ No hay variantes listas para guardar");
      return;
    }
    setShowConfirm(true);
  };

  const ejecutarGuardado = async () => {
    try {
      setLoading(true);

      const url = "/api/compras/movimientos/entrada";

      if (esProductoSimple || variantes.length === 1) {
        if (!esFormValido(form)) {
          showToast("⚠️ Completa todos los campos obligatorios");
          return;
        }

        const productoId =
          esProductoSimple ? producto.id : variantes[0].id;

        await axios.post(url, {
          productoId,
          ...form
        });
      } else {
        for (const [varianteId, obj] of Object.entries(formsPorVariante)) {
          if (!obj.listo) continue;

          await axios.post(url, {
            productoId: Number(varianteId), // 🔥 CADA VARIANTE
            ...obj.data
          });
        }
      }

      showToast("✅ Movimientos de entrada creados correctamente", "success", 2000);

      setTimeout(() => {
        if (onGuardarFinal) onGuardarFinal();
        else navigate(`/compras/producto/${productoIdParam}`);
      }, 1200);
    } catch (e) {
      showToast(e.response?.data?.error || "Error al guardar movimientos");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  /* =====================================================
     CAMBIO DE VARIANTE
  ===================================================== */
  const cambiarVariante = v => {
    if (!v) return;

    persistirActual(curr => ({
      ...curr,
      data: form
    }));

    const nuevoForm = obtenerFormDeVariante(v);

    setVarianteActiva(v);

    isHydratingRef.current = true;
    setForm({ ...nuevoForm });
    isHydratingRef.current = false;
  };

  /* =====================================================
     ESTADOS UI
  ===================================================== */
  const estadoActual = formsPorVariante[varianteActiva?.id];
  const actualListo = estadoActual?.listo;
  const actualDirty = estadoActual?.dirty;

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="mov-container">
      {toast && <div className={`mov-toast ${toast.type}`}>{toast.msg}</div>}

      {showConfirm && (
        <div className="mov-modal-backdrop">
          <div className="mov-modal">
            <h3>Confirmar movimientos</h3>

            <p>
              Se crearán <strong>{totalListas}</strong> movimientos de{" "}
              <strong>{totalEsperadas}</strong> productos.
            </p>

            <ul className="modal-list">
              {variantes.map(v => {
                const estado = formsPorVariante[v.id]?.listo;
                return (
                  <li key={v.id}>
                    {v.codigo_modelo}{" "}
                    {estado ? (
                      <span className="badge-ok">✔</span>
                    ) : (
                      <span className="badge-pending">Pendiente</span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="modal-actions">
              <button onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button
                className="btn-save"
                onClick={ejecutarGuardado}
                disabled={loading || totalListas === 0}
              >
                {loading ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!modoEmbedded && productoEnUso && (
        <div className="product-card">
          <img src={resolveImageUrl(productoEnUso.imagen)} alt="" />

          <div className="product-info">
            <h3>{producto.descripcion}</h3>
            <p>{productoEnUso.codigo_modelo || producto.codigo}</p>
            <p>Categoría: {producto.categoria_nombre}</p>
            <p>Stock actual: {productoEnUso.stock_total}</p>

            {variantes.length > 0 && (
              <div className="variante-row">
                <div
                  className={`variante-select ${
                    errores.variante ? "error" : ""
                  }`}
                >
                  <label>Variante *</label>
                  <select
                    value={productoEnUso.id}
                    onChange={e => {
                      const v = variantes.find(
                        x => x.id === Number(e.target.value)
                      );
                      cambiarVariante(v);
                    }}
                  >
                    {variantes.map(v => {
                      const ok = formsPorVariante[v.id]?.listo;
                      const dirty = formsPorVariante[v.id]?.dirty;
                      return (
                        <option key={v.id} value={v.id}>
                          {v.codigo_modelo}{" "}
                          {ok ? "✔" : dirty ? "✏️" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="variante-stats">
                  {variantesListas} / {totalVariantes} listas
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mov-card">
        <h2>Movimiento de Entrada</h2>

        {variantes.length > 1 && (
          <div className="form-toolbar">
            <button
              type="button"
              className="btn-secondary"
              onClick={copiarDesdePrimera}
            >
              📋 Copiar desde variante 1
            </button>

            <span className="toolbar-indicator">
              Variante actual:{" "}
              <strong>{varianteActiva?.codigo_modelo}</strong>
            </span>

            {actualListo ? (
              <button
                type="button"
                className="btn-warning"
                onClick={desmarcarListo}
              >
                ↩ Marcar como pendiente
              </button>
            ) : (
              <button
                type="button"
                className="btn-success"
                onClick={marcarComoListo}
              >
                ✔ Marcar como lista
              </button>
            )}
          </div>
        )}

        <div className="mov-grid">
          <SelectOrInput
            label="Empresa *"
            nameId="empresa_id"
            nameNuevo="empresa_nueva"
            options={empresas}
            onChange={handleChange}
            value={form.empresa_id}
            valueNuevo={form.empresa_nueva}
            error={errores.empresa}
          />

          <SelectOrInput
            label="OP Vinculada"
            nameId="op_vinculada"
            nameNuevo="op_vinculada_nueva"
            options={ops}
            optionLabel="codigo"
            optionValue="codigo"
            onChange={handleChange}
            value={form.op_vinculada}
            valueNuevo={form.op_vinculada_nueva}
          />

          <SelectOrInput
            label="Almacén *"
            nameId="almacen_id"
            nameNuevo="almacen_nuevo"
            options={almacenes}
            onChange={handleChange}
            value={form.almacen_id}
            valueNuevo={form.almacen_nuevo}
            error={errores.almacen}
          />

          <SelectOrInput
            label="Fabricante"
            nameId="fabricante_id"
            nameNuevo="fabricante_nuevo"
            options={fabricantes}
            onChange={handleChange}
            value={form.fabricante_id}
            valueNuevo={form.fabricante_nuevo}
          />

          <SelectOrInput
            label="Motivo *"
            nameId="motivo_id"
            nameNuevo="motivo_nuevo"
            options={motivos}
            onChange={handleChange}
            value={form.motivo_id}
            valueNuevo={form.motivo_nuevo}
            error={errores.motivo}
          />

          <div className={errores.cantidad ? "field error" : "field"}>
            <label>Cantidad *</label>
            <input
              type="number"
              name="cantidad"
              min="1"
              value={form.cantidad}
              onChange={handleChange}
            />
            {errores.cantidad && (
              <span className="error-text">{errores.cantidad}</span>
            )}
          </div>

          <div className={errores.precio ? "field error" : "field"}>
            <label>Precio unitario *</label>

            {preciosHistoricos.length > 1 && (
                <select
                  value={form.precio}
                  onChange={e =>
                    handleChange({
                      target: { name: "precio", value: e.target.value }
                    })
                  }
                >

                <option value="">Seleccionar precio histórico</option>
                {preciosHistoricos.map((p, i) => (
                  <option key={i} value={p.precio}>
                    {Number(p.precio).toFixed(2)} — {p.tipo_movimiento} —{" "}
                    {new Date(p.created_at).toLocaleDateString()}
                    {p.op_vinculada ? ` — OP ${p.op_vinculada}` : ""}
                  </option>
                ))}
              </select>
            )}

            <input
              type="number"
              step="0.01"
              min="0"
              name="precio"
              value={form.precio}
              onChange={handleChange}
            />

            {errores.precio && (
              <span className="error-text">{errores.precio}</span>
            )}
          </div>

          <div className="full">
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mov-actions">
          <button
            onClick={() => {
              if (modoEmbedded && onCancelar) onCancelar();
              else navigate(-1);
            }}
          >
            Cancelar
          </button>
          <button
            className="btn-save"
            onClick={confirmarGuardar}
            disabled={loading || totalListas === 0}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
