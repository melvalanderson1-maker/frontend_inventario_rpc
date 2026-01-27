import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { resolveImageUrl } from "../../utils/imageUrl";
import SelectOrInput from "./SelectOrInput";
import Toast from "../ui/Toast";

import "./Movimiento.css";

export default function MovimientoSalida() {
  const { productoId } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [motivos, setMotivos] = useState([]);
  const [ops, setOps] = useState([]);
  const [stockRows, setStockRows] = useState([]);
  const [preciosHistoricos, setPreciosHistoricos] = useState([]);

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

  const [toast, setToast] = useState(null);

  const empresaEsNueva = !!form.empresa_nueva;
  const almacenEsNuevo = !!form.almacen_nuevo;

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [prodRes, stockRes, motivosRes, opsRes] = await Promise.all([
          axios.get(`/api/compras/productos/${productoId}`),
          axios.get(`/api/compras/stock-por-producto/${productoId}`),
          axios.get(`/api/compras/motivos-movimiento?tipo=salida`),
          axios.get(`/api/compras/ops-existentes`)
        ]);

        setProducto(prodRes.data.producto);
        setStockRows(stockRes.data);
        setMotivos(motivosRes.data);
        setOps(opsRes.data);
      } catch (error) {
        console.error("❌ Error cargando datos salida:", error);
      }
    };

    cargarTodo();
  }, [productoId]);

  /* =========================
     DERIVADOS DE STOCK
  ========================= */
  const empresasDisponibles = [...new Map(
    stockRows.map(r => [r.empresa_id, r])
  ).values()];

  const almacenesDisponibles = form.empresa_id
    ? stockRows.filter(r => String(r.empresa_id) === String(form.empresa_id))
    : [];

  const fabricantesDisponibles =
    form.empresa_id && form.almacen_id
      ? stockRows.filter(
          r =>
            String(r.empresa_id) === String(form.empresa_id) &&
            String(r.almacen_id) === String(form.almacen_id)
        )
      : [];

  const stockSeleccionado =
    form.empresa_id && form.almacen_id
      ? stockRows.find(
          r =>
            String(r.empresa_id) === String(form.empresa_id) &&
            String(r.almacen_id) === String(form.almacen_id) &&
            (
              (!r.fabricante_id && !form.fabricante_id) ||
              String(r.fabricante_id) === String(form.fabricante_id)
            )
        )
      : null;

  /* =========================
     PRECIO AUTOMÁTICO
  ========================= */
  useEffect(() => {
    const cargarPrecios = async () => {
      if (!form.empresa_id || !form.almacen_id) {
        setForm(f => ({ ...f, precio: "" }));
        setPreciosHistoricos([]);
        return;
      }

      try {
        const { data } = await axios.get("/api/compras/precio-stock", {
          params: {
            productoId,
            empresa_id: form.empresa_id,
            almacen_id: form.almacen_id,
            fabricante_id: form.fabricante_id || null
          }
        });

        setPreciosHistoricos(data.historicos || []);

        if (data.precio_actual !== null && data.precio_actual !== undefined) {
          setForm(f => ({ ...f, precio: String(data.precio_actual) }));
        } else {
          setForm(f => ({ ...f, precio: "" }));
        }
      } catch (e) {
        console.error("❌ Error cargando precios:", e);
        setPreciosHistoricos([]);
        setForm(f => ({ ...f, precio: "" }));
      }
    };

    cargarPrecios();
  }, [productoId, form.empresa_id, form.almacen_id, form.fabricante_id]);

  useEffect(() => {
    if (!form.op_vinculada || !preciosHistoricos.length) return;

    const match = preciosHistoricos.find(p => p.op_vinculada === form.op_vinculada);
    if (match) {
      setForm(f => ({ ...f, precio: String(match.precio) }));
    }
  }, [form.op_vinculada, preciosHistoricos]);

  /* =========================
     VALIDACIÓN
  ========================= */
  const tieneValor = (id, nuevo) =>
    Boolean(id) || (nuevo && nuevo.trim().length > 0);

  const validarForm = (form, stockSeleccionado) => {
    if (!tieneValor(form.empresa_id, form.empresa_nueva)) return false;
    if (!tieneValor(form.almacen_id, form.almacen_nuevo)) return false;

    const cant = Number(form.cantidad);
    if (!Number.isInteger(cant) || cant <= 0) return false;

    if (stockSeleccionado && cant > stockSeleccionado.cantidad) return false;

    if (form.precio !== "" && Number(form.precio) < 0) return false;
    if (form.observaciones && form.observaciones.length > 500) return false;

    return true;
  };

  const formValido = validarForm(form, stockSeleccionado);

  /* =========================
     HANDLERS (🔥 FIX REAL)
  ========================= */
  const handleChange = e => {
    const { name, value } = e.target;

    setForm(prev => {
      let f = { ...prev, [name]: value };

      // Si selecciona ID → limpia NUEVO
      if (name.endsWith("_id")) {
        const base = name.replace("_id", "");
        f[`${base}_nuevo`] = "";
      }

      // Si escribe NUEVO → limpia ID
      if (name.endsWith("_nuevo")) {
        const base = name.replace("_nuevo", "");
        f[`${base}_id`] = "";
      }

      // Jerarquía salida
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

      return f;
    });
  };

  /* =========================
     GUARDAR
  ========================= */
  const guardar = async () => {
    if (!formValido) {
      setToast({ type: "error", message: "Completa todos los campos obligatorios correctamente" });
      return;
    }

    try {
      const payload = {
        productoId,
        empresa_id: form.empresa_id,
        empresa_nueva: form.empresa_nueva,
        almacen_id: form.almacen_id,
        almacen_nuevo: form.almacen_nuevo,
        fabricante_id: form.fabricante_id,
        fabricante_nuevo: form.fabricante_nuevo,
        motivo_id: form.motivo_id,
        motivo_nuevo: form.motivo_nuevo,
        op_vinculada: form.op_vinculada,
        op_vinculada_nueva: form.op_vinculada_nueva,
        cantidad: form.cantidad,
        precio: form.precio,
        observaciones: form.observaciones
      };

      await axios.post("/api/compras/movimientos/salida", payload);

      setToast({ type: "success", message: "Movimiento de salida registrado correctamente" });

      setTimeout(() => {
        navigate(`/compras/producto/${productoId}`);
      }, 2000);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Ocurrió un error al registrar la salida"
      });
    }
  };

  if (!producto) return <p>Cargando...</p>;

  return (
    <div className="mov-container">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* PRODUCTO */}
      <div className="product-card">
        <img src={resolveImageUrl(producto.imagen)} alt={producto.descripcion} />
        <div className="product-info">
          <h3>{producto.descripcion}</h3>
          <p>{producto.codigo_modelo || producto.codigo}</p>
          <p>Categoría: <strong>{producto.categoria_nombre}</strong></p>
          <p>Stock actual: <strong>{producto.stock_total}</strong></p>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="mov-card">
        <h2>Movimiento de Salida</h2>

        <div className="mov-grid">
          <SelectOrInput
            label="Empresa"
            nameId="empresa_id"
            nameNuevo="empresa_nueva"
            options={empresasDisponibles}
            optionLabel="empresa"
            optionValue="empresa_id"
            value={form.empresa_id}
            valueNuevo={form.empresa_nueva}
            onChange={handleChange}
          />

          <SelectOrInput
            label="OP Vinculada (referencia)"
            nameId="op_vinculada"
            nameNuevo="op_vinculada_nueva"
            options={ops}
            optionLabel="codigo"
            optionValue="codigo"
            value={form.op_vinculada}
            valueNuevo={form.op_vinculada_nueva}
            onChange={handleChange}
          />

          <SelectOrInput
            label="Almacén"
            nameId="almacen_id"
            nameNuevo="almacen_nuevo"
            options={almacenesDisponibles}
            optionLabel="almacen"
            optionValue="almacen_id"
            value={form.almacen_id}
            valueNuevo={form.almacen_nuevo}
            onChange={handleChange}
            disabled={empresaEsNueva || !form.empresa_id}
          />

          <SelectOrInput
            label="Fabricante"
            nameId="fabricante_id"
            nameNuevo="fabricante_nuevo"
            options={fabricantesDisponibles.map(f => ({
              ...f,
              label: `${f.fabricante || "Sin fabricante"} (${f.cantidad})`
            }))}
            optionLabel="label"
            optionValue="fabricante_id"
            value={form.fabricante_id}
            valueNuevo={form.fabricante_nuevo}
            onChange={handleChange}
            disabled={almacenEsNuevo || !form.almacen_id}
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
            <label>Cantidad</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="cantidad"
              value={form.cantidad}
              disabled={!stockSeleccionado}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "");
                if (!stockSeleccionado) return;
                if (Number(v) > stockSeleccionado.cantidad) return;
                setForm({ ...form, cantidad: v });
              }}
            />
          </div>

          <div>
            <label>Precio unitario</label>

            {preciosHistoricos.length > 1 && (
              <select
                value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })}
                style={{ marginBottom: 6 }}
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
              disabled={!stockSeleccionado}
              placeholder={
                preciosHistoricos.length
                  ? "Precio sugerido cargado automáticamente"
                  : "Ingrese precio manual"
              }
              onChange={e =>
                setForm({ ...form, precio: e.target.value })
              }
            />
          </div>

          <div>
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              maxLength={500}
              rows="3"
              value={form.observaciones}
              onChange={handleChange}
            />
            <small style={{ display: "block", textAlign: "right", fontSize: 12 }}>
              {form.observaciones.length}/500
            </small>
          </div>
        </div>

        <div className="mov-actions">
          <button
            className="btn-cancel"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>

          <button
            className="btn-save"
            onClick={guardar}
            disabled={!formValido}
          >
            Registrar Salida
          </button>
        </div>
      </div>
    </div>
  );
}
