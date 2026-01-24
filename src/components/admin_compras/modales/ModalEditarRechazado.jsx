import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/api";
import SelectOrInput from "../../admin_compras/SelectOrInput";
import "./ModalMovimiento.css";

export default function ModalEditarRechazado({
  movimientoId,
  onClose,
  onSuccess
}) {
  const [movimiento, setMovimiento] = useState(null);

  const [form, setForm] = useState({
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
    cantidad: "",
    precio: "",
    observaciones: ""
  });

  const [empresas, setEmpresas] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [motivos, setMotivos] = useState([]);

  const [stockRows, setStockRows] = useState([]);

  const [observacionLogistica, setObservacionLogistica] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const empresaEsNueva = !!form.empresa_nueva;
  const almacenEsNuevo = !!form.almacen_nuevo;

  /* =====================================================
     1️⃣ CARGA DEL MOVIMIENTO
  ===================================================== */
  useEffect(() => {
    if (!movimientoId) return;

    api.get(`/api/compras/movimientos/${movimientoId}`).then(r => {
      const mov = r.data;
      setMovimiento(mov);

      setForm({
        empresa_id: mov.empresa_id || "",
        empresa_nueva: "",
        almacen_id: mov.almacen_id || "",
        almacen_nuevo: "",
        fabricante_id: mov.fabricante_id || "",
        fabricante_nuevo: "",
        motivo_id: mov.motivo_id || "",
        motivo_nuevo: "",
        op_vinculada: mov.op_vinculada || "",
        op_vinculada_nueva: "",
        cantidad: mov.cantidad ? String(mov.cantidad) : "",
        precio:
          mov.precio !== null && mov.precio !== undefined
            ? String(mov.precio)
            : "",
        observaciones: mov.observaciones_admin_compras || "" // solo admin compras
      });
    });

    api
      .get(`/api/logistica/movimientos/${movimientoId}/ultima-observacion`)
      .then(r => setObservacionLogistica(r.data?.observaciones || ""))
      .catch(() => setObservacionLogistica(""));
  }, [movimientoId]);

  /* =====================================================
     2️⃣ CARGA DE OPCIONES SEGÚN TIPO
  ===================================================== */
  useEffect(() => {
    if (!movimiento) return;

    if (movimiento.tipo_movimiento === "salida") {
      api
        .get(`/api/compras/stock-por-producto/${movimiento.producto_id}`)
        .then(r => setStockRows(r.data || []));
    } else {
      Promise.all([
        api.get("/api/empresas"),
        api.get("/api/almacenes"),
        api.get("/api/fabricantes"),
        api.get(
          `/api/motivos-movimiento?tipo=${movimiento.tipo_movimiento}`
        )
      ]).then(([e, a, f, m]) => {
        setEmpresas(e.data);
        setAlmacenes(a.data);
        setFabricantes(f.data);
        setMotivos(m.data);
      });
    }

    api
      .get(`/api/motivos-movimiento?tipo=${movimiento.tipo_movimiento}`)
      .then(r => setMotivos(r.data));
  }, [movimiento]);

  /* =====================================================
     3️⃣ DERIVADOS PARA SALIDA
  ===================================================== */
  const empresasDisponibles = useMemo(() => {
    if (movimiento?.tipo_movimiento !== "salida") return empresas;
    return [...new Map(stockRows.map(r => [r.empresa_id, r])).values()];
  }, [stockRows, empresas, movimiento?.tipo_movimiento]);

  const almacenesDisponibles = useMemo(() => {
    if (movimiento?.tipo_movimiento !== "salida") return almacenes;
    return form.empresa_id
      ? stockRows.filter(r => String(r.empresa_id) === String(form.empresa_id))
      : [];
  }, [stockRows, almacenes, form.empresa_id, movimiento?.tipo_movimiento]);

  const fabricantesDisponibles = useMemo(() => {
    if (movimiento?.tipo_movimiento !== "salida") return fabricantes;
    return form.empresa_id && form.almacen_id
      ? stockRows.filter(
          r =>
            String(r.empresa_id) === String(form.empresa_id) &&
            String(r.almacen_id) === String(form.almacen_id)
        )
      : [];
  }, [stockRows, fabricantes, form.empresa_id, form.almacen_id, movimiento?.tipo_movimiento]);

  const stockSeleccionado = useMemo(() => {
    if (movimiento?.tipo_movimiento !== "salida") return null;
    return form.empresa_id && form.almacen_id
      ? stockRows.find(
          r =>
            String(r.empresa_id) === String(form.empresa_id) &&
            String(r.almacen_id) === String(form.almacen_id) &&
            ((!r.fabricante_id && !form.fabricante_id) ||
              String(r.fabricante_id) === String(form.fabricante_id))
        )
      : null;
  }, [stockRows, form.empresa_id, form.almacen_id, form.fabricante_id, movimiento?.tipo_movimiento]);

  /* =====================================================
     4️⃣ HANDLERS
  ===================================================== */
  const handleChange = e => {
    const { name, value } = e.target;

    setForm(prev => {
      let f = { ...prev, [name]: value };

      if (name.endsWith("_id")) {
        const base = name.replace("_id", "");
        f[`${base}_nuevo`] = "";
      }
      if (name.endsWith("_nuevo")) {
        const base = name.replace("_nuevo", "");
        f[`${base}_id`] = "";
      }

      if (movimiento?.tipo_movimiento === "salida") {
        if (name === "empresa_id" || name === "empresa_nueva") {
          f.almacen_id = "";
          f.almacen_nuevo = "";
          f.fabricante_id = "";
          f.fabricante_nuevo = "";
          f.cantidad = "";
        }
        if (name === "almacen_id" || name === "almacen_nuevo") {
          f.fabricante_id = "";
          f.fabricante_nuevo = "";
          f.cantidad = "";
        }
        if (name === "fabricante_id" || name === "fabricante_nuevo") {
          f.cantidad = "";
        }
      }

      return f;
    });
  };

  /* =====================================================
     5️⃣ VALIDACIÓN
  ===================================================== */
  const tieneValor = (id, nuevo) => Boolean(id) || (nuevo && nuevo.trim().length > 0);

  const validarForm = () => {
    if (!tieneValor(form.empresa_id, form.empresa_nueva)) return false;
    if (!tieneValor(form.almacen_id, form.almacen_nuevo)) return false;

    const cant = Number(form.cantidad);
    if (!Number.isInteger(cant) || cant <= 0) return false;

    if (movimiento?.tipo_movimiento === "salida" && stockSeleccionado && cant > stockSeleccionado.cantidad)
      return false;

    if (form.precio !== "" && Number(form.precio) < 0) return false;

    return true;
  };

  const formValido = validarForm();

  /* =====================================================
     6️⃣ GUARDAR Y REENVIAR
  ===================================================== */
  const guardarYReenviar = async () => {
    if (!formValido) {
      setError("Completa todos los campos obligatorios correctamente");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Guardar cambios
      await api.put(`/api/compras/movimientos/${movimientoId}`, form);

      // Reenviar a logística
      await api.post(`/api/compras/movimientos/${movimientoId}/reenviar`);

      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || "Error al guardar y reenviar");
    } finally {
      setLoading(false);
    }
  };

  if (!movimiento) return null;

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="mov-modal-backdrop">
      <div className="mov-modal large">
        <h2>Corregir movimiento de {movimiento.tipo_movimiento.toUpperCase()}</h2>

        <div className="mov-modal-body">
          {/* OBSERVACIÓN LOGÍSTICA */}
          {observacionLogistica && (
            <div className="mov-logistica-box">
              <strong>Observaciones de logística:</strong>
              <p>{observacionLogistica}</p>
            </div>
          )}

          <div className="mov-info-grid">
            <SelectOrInput
              label="Empresa *"
              nameId="empresa_id"
              nameNuevo="empresa_nueva"
              options={empresasDisponibles}
              optionLabel={movimiento.tipo_movimiento === "salida" ? "empresa" : "nombre"}
              optionValue={movimiento.tipo_movimiento === "salida" ? "empresa_id" : "id"}
              value={form.empresa_id}
              valueNuevo={form.empresa_nueva}
              onChange={handleChange}
            />

            <SelectOrInput
              label="OP Vinculada"
              nameId="op_vinculada"
              nameNuevo="op_vinculada_nueva"
              options={[]}
              optionLabel="codigo"
              optionValue="codigo"
              value={form.op_vinculada}
              valueNuevo={form.op_vinculada_nueva}
              onChange={handleChange}
            />

            <SelectOrInput
              label="Almacén *"
              nameId="almacen_id"
              nameNuevo="almacen_nuevo"
              options={almacenesDisponibles}
              optionLabel={movimiento.tipo_movimiento === "salida" ? "almacen" : "nombre"}
              optionValue={movimiento.tipo_movimiento === "salida" ? "almacen_id" : "id"}
              value={form.almacen_id}
              valueNuevo={form.almacen_nuevo}
              onChange={handleChange}
              disabled={empresaEsNueva || (movimiento.tipo_movimiento === "salida" && !form.empresa_id)}
            />

            <SelectOrInput
              label="Fabricante"
              nameId="fabricante_id"
              nameNuevo="fabricante_nuevo"
              options={
                movimiento.tipo_movimiento === "salida"
                  ? fabricantesDisponibles.map(f => ({
                      ...f,
                      label: `${f.fabricante || "Sin fabricante"} (${f.cantidad})`
                    }))
                  : fabricantesDisponibles
              }
              optionLabel={movimiento.tipo_movimiento === "salida" ? "label" : "nombre"}
              optionValue={movimiento.tipo_movimiento === "salida" ? "fabricante_id" : "id"}
              value={form.fabricante_id}
              valueNuevo={form.fabricante_nuevo}
              onChange={handleChange}
              disabled={almacenEsNuevo || (movimiento.tipo_movimiento === "salida" && !form.almacen_id)}
            />

            <SelectOrInput
              label="Motivo"
              nameId="motivo_id"
              nameNuevo="motivo_nuevo"
              options={motivos}
              optionLabel="nombre"
              optionValue="id"
              value={form.motivo_id}
              valueNuevo={form.motivo_nuevo}
              onChange={handleChange}
            />

            <div>
              <label>Cantidad *</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="cantidad"
                value={form.cantidad}
                disabled={movimiento.tipo_movimiento === "salida" && !stockSeleccionado}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, "");
                  if (movimiento.tipo_movimiento === "salida" && stockSeleccionado && Number(v) > stockSeleccionado.cantidad)
                    return;
                  setForm({ ...form, cantidad: v });
                }}
              />
              {movimiento.tipo_movimiento === "salida" && stockSeleccionado && (
                <small>Stock disponible: <strong>{stockSeleccionado.cantidad}</strong></small>
              )}
            </div>

            <div>
              <label>Precio unitario</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precio"
                value={form.precio}
                onChange={handleChange}
              />
            </div>

            <div className="full">
              <label>Observaciones (Admin Compras)</label>
              <textarea
                rows={3}
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="mov-error">{error}</div>}
        </div>

        <div className="mov-modal-actions">
          <button onClick={onClose}>Cancelar</button>

          {/* 🔥 Solo botón combinado */}
          <button
            className="btn-success"
            onClick={guardarYReenviar}
            disabled={loading}
          >
            Reenviar a logística
          </button>
        </div>
      </div>
    </div>
  );
}
