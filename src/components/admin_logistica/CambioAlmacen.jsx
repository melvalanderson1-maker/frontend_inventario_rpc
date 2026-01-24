import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../../api/api";
import SelectOrInput from "../admin_compras/SelectOrInput";
import Toast from "../ui/Toast";
import { resolveImageUrl } from "../../utils/imageUrl";
import "./CambioAlmacen.css";

export default function CambioAlmacen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { productoId } = useParams();

  const stockOrigen = location.state?.stockOrigen;

  const [producto, setProducto] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);

  const [form, setForm] = useState({
    empresa_id: "",
    almacen_origen_id: "",
    fabricante_id: "",
    cantidad_disponible: 0,

    empresa_destino_id: "",
    empresa_destino_nuevo: "",
    almacen_destino_id: "",
    almacen_destino_nuevo: "",
    fabricante_destino_id: "",
    fabricante_destino_nuevo: "",

    cantidad: "",
    observaciones: "",
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // CARGA INICIAL
  // =========================
  useEffect(() => {
    if (!productoId || !stockOrigen) return;

    const cargar = async () => {
      try {
        const [prodRes, empRes, almRes, fabRes] = await Promise.all([
          api.get(`/api/logistica/productos/${productoId}`),
          api.get("/api/logistica/empresas"),
          api.get("/api/logistica/almacenes"),
          api.get("/api/logistica/fabricantes"),
        ]);

        setProducto(prodRes.data.producto);
        setEmpresas(empRes.data || []);
        setAlmacenes(almRes.data || []);
        setFabricantes(fabRes.data || []);
      } catch (e) {
        console.error("❌ Error cargando cambio almacén:", e);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [productoId, stockOrigen]);

  // =========================
  // PRECARGAR ORIGEN
  // =========================
  useEffect(() => {
    if (!stockOrigen || !productoId) return;

    setForm((f) => ({
      ...f,
      empresa_id: String(stockOrigen.empresa_id),
      almacen_origen_id: String(stockOrigen.almacen_id),
      fabricante_id: stockOrigen.fabricante_id
        ? String(stockOrigen.fabricante_id)
        : "",
      cantidad_disponible: Number(stockOrigen.cantidad),
      cantidad: String(stockOrigen.cantidad),
    }));
  }, [stockOrigen, productoId]);

  // =========================
  // HANDLER UNIVERSAL 🔥
  // =========================
  const handleChange = (e) => {
    if (!e?.target?.name) return;
    const { name, value } = e.target;

    setForm((prev) => {
      const f = { ...prev, [name]: value };

      // Si escribe nuevo → limpia id
      if (name.endsWith("_nuevo")) {
        const base = name.replace("_nuevo", "");
        f[`${base}_id`] = "";
      }

      // Si selecciona id → limpia nuevo
      if (name.endsWith("_id")) {
        const base = name.replace("_id", "");
        f[`${base}_nuevo`] = "";
      }

      return f;
    });
  };

  // =========================
  // VALIDACIÓN 🔥
  // =========================
  const formValido = useMemo(() => {
    // SOLO ES OBLIGATORIO EL ALMACÉN DESTINO
    if (!form.almacen_destino_id && !form.almacen_destino_nuevo?.trim())
      return false;

    const cant = Number(form.cantidad);
    if (!Number.isInteger(cant) || cant <= 0) return false;
    if (cant > form.cantidad_disponible) return false;

    return true;
  }, [form]);

  // =========================
  // GUARDAR 🔥
  // =========================
  const guardar = async () => {
    if (!formValido) {
      setToast({ type: "error", message: "Formulario incompleto" });
      return;
    }

    const payload = {
      producto_id: Number(productoId),

      // 🔒 ORIGEN
      empresa_id: Number(form.empresa_id),
      almacen_origen_id: Number(form.almacen_origen_id),
      fabricante_id: form.fabricante_id ? Number(form.fabricante_id) : null,

      // 🔁 DESTINO (solo almacén es obligatorio)
      empresa_destino_id: form.empresa_destino_id
        ? Number(form.empresa_destino_id)
        : null,
      empresa_destino_nuevo: form.empresa_destino_nuevo || null,

      almacen_destino_id: form.almacen_destino_id
        ? Number(form.almacen_destino_id)
        : null,
      almacen_destino_nuevo: form.almacen_destino_nuevo || null,

      fabricante_destino_id: form.fabricante_destino_id
        ? Number(form.fabricante_destino_id)
        : null,
      fabricante_destino_nuevo: form.fabricante_destino_nuevo || null,

      cantidad: Number(form.cantidad),
      observaciones: form.observaciones || null,
    };

    console.log("📤 PAYLOAD FINAL REAL:", payload);

    try {
      const res = await api.post("/api/logistica/cambios-almacen", payload);
      console.log("✅ RESPUESTA BACKEND:", res.data);
      setToast({ type: "success", message: "✅ Cambio de almacén creado" });
      setTimeout(() => navigate(-1), 1200);
    } catch (error) {
      console.error("❌ ERROR BACKEND:", error.response?.data || error);
      setToast({
        type: "error",
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error creando cambio",
      });
    }
  };

  if (!stockOrigen)
    return <p style={{ padding: 20 }}>⚠️ Ingresa desde la tabla de stock</p>;
  if (loading || !producto) return <p style={{ padding: 20 }}>Cargando...</p>;

  return (
    <div className="mov-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* PRODUCTO */}
      <div className="product-card">
        <img src={resolveImageUrl(producto.imagen)} alt="" />
        <div>
          <h3>{producto.descripcion}</h3>
          <p>{producto.codigo_modelo || producto.codigo}</p>
          <p>Categoría: {producto.categoria_nombre}</p>
          <p>Stock total: {producto.stock_total}</p>
        </div>
      </div>

      {/* ORIGEN */}
      <div className="mov-card" style={{ marginBottom: 16 }}>
        <h3>📦 Stock origen</h3>

        <div className="mov-grid">
          <div>
            <label>Empresa</label>
            <input value={stockOrigen.empresa} disabled />
          </div>

          <div>
            <label>Almacén</label>
            <input value={stockOrigen.almacen} disabled />
          </div>

          <div>
            <label>Fabricante</label>
            <input value={stockOrigen.fabricante || "—"} disabled />
          </div>

          <div>
            <label>Disponible</label>
            <input value={form.cantidad_disponible} disabled />
          </div>
        </div>
      </div>

      {/* DESTINO */}
      <div className="mov-card">
        <h2>🔁 Cambio de almacén</h2>

        <div className="mov-grid">
          <SelectOrInput
            label="Empresa destino (opcional)"
            nameId="empresa_destino_id"
            nameNuevo="empresa_destino_nuevo"
            options={empresas}
            optionLabel="nombre"
            optionValue="id"
            value={form.empresa_destino_id}
            valueNuevo={form.empresa_destino_nuevo}
            onChange={handleChange}
          />

          <SelectOrInput
            label="Almacén destino *"
            nameId="almacen_destino_id"
            nameNuevo="almacen_destino_nuevo"
            options={almacenes}
            optionLabel="nombre"
            optionValue="id"
            value={form.almacen_destino_id}
            valueNuevo={form.almacen_destino_nuevo}
            onChange={handleChange}
          />

          <SelectOrInput
            label="Fabricante destino (opcional)"
            nameId="fabricante_destino_id"
            nameNuevo="fabricante_destino_nuevo"
            options={fabricantes}
            optionLabel="nombre"
            optionValue="id"
            value={form.fabricante_destino_id}
            valueNuevo={form.fabricante_destino_nuevo}
            onChange={handleChange}
          />

          <div>
            <label>Cantidad a mover</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="cantidad"
              value={form.cantidad}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                if (Number(v) > form.cantidad_disponible) return;
                setForm({ ...form, cantidad: v });
              }}
            />
            <small>Disponible: {form.cantidad_disponible}</small>
          </div>

          <div>
            <label>Motivo / Observaciones</label>
            <textarea
              name="observaciones"
              rows="3"
              value={form.observaciones}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mov-actions">
          <button className="btn-cancel" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button
            className="btn-save"
            onClick={guardar}
            disabled={!formValido}
          >
            Crear cambio
          </button>
        </div>
      </div>
    </div>
  );
}
