import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import SelectOrInput from "../admin_compras/SelectOrInput";
import Toast from "../ui/Toast";
import "./TablaCambiosAlmacenPendientes.css";

export default function ModalValidarCambioAlmacen({ cambio, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    empresa_origen_id: "",
    almacen_origen_id: "",
    fabricante_origen_id: "",
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

  const [origenNombres, setOrigenNombres] = useState({ empresa: "", almacen: "", fabricante: "" });
  const [destinoNombres, setDestinoNombres] = useState({ empresa: "", almacen: "", fabricante: "" });

  // ==========================
  // Cargar datos logística
  // ==========================
  useEffect(() => {
    const cargar = async () => {
      try {
        const [empRes, almRes, fabRes] = await Promise.all([
          api.get("/api/logistica/empresas"),
          api.get("/api/logistica/almacenes"),
          api.get("/api/logistica/fabricantes"),
        ]);
        setEmpresas(empRes.data || []);
        setAlmacenes(almRes.data || []);
        setFabricantes(fabRes.data || []);
      } catch (e) {
        console.error("❌ Error cargando datos logística:", e);
        setToast({ type: "error", message: "Error cargando datos de logística" });
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // ==========================
  // Precargar cambio y nombres
  // ==========================
  useEffect(() => {
    if (!cambio?.id || !empresas.length || !almacenes.length || !fabricantes.length) return;

    const empresaOrigen = empresas.find(e => e.id === cambio.empresa_origen_id);
    const almacenOrigen = almacenes.find(a => a.id === cambio.almacen_origen_id);
    const fabricanteOrigen = fabricantes.find(f => f.id === cambio.fabricante_origen_id);

    const empresaDestino = empresas.find(e => e.id === cambio.empresa_destino_id);
    const almacenDestino = almacenes.find(a => a.id === cambio.almacen_destino_id);
    const fabricanteDestino = fabricantes.find(f => f.id === cambio.fabricante_destino_id);

    setForm({
    empresa_origen_id: String(cambio.empresa_origen_id || ""),
    almacen_origen_id: String(cambio.almacen_origen_id || ""),
    fabricante_origen_id: String(cambio.fabricante_origen_id || ""),
    cantidad_disponible: cambio.cantidad_disponible || 0,
    cantidad: String(cambio.cantidad || ""),

    // ✅ IDs de destino correctos según tu backend
    empresa_destino_id: cambio.empresa_id ? String(cambio.empresa_id) : "",
    almacen_destino_id: String(cambio.almacen_destino_id || ""),
    fabricante_destino_id: cambio.fabricante_id ? String(cambio.fabricante_id) : "",

    empresa_destino_nuevo: "",
    almacen_destino_nuevo: "",
    fabricante_destino_nuevo: "",
    observaciones: cambio.observaciones || "",
    });

    setOrigenNombres({
      empresa: empresaOrigen?.nombre || "",
      almacen: almacenOrigen?.nombre || "",
      fabricante: fabricanteOrigen?.nombre || "—",
    });

    setDestinoNombres({
    empresa: cambio.empresa_destino || "", // nombre traído desde ed.nombre
    almacen: cambio.almacen_destino || "",
    fabricante: cambio.fabricante_destino || "—", // nombre traído desde fd.nombre
    });
  }, [cambio, empresas, almacenes, fabricantes]);

  // ==========================
  // Handler universal
  // ==========================
  const handleChange = (e) => {
    if (!e?.target?.name) return;
    const { name, value } = e.target;
    setForm(prev => {
      const f = { ...prev, [name]: value };
      if (name.endsWith("_nuevo")) f[name.replace("_nuevo", "_id")] = "";
      if (name.endsWith("_id")) f[name.replace("_id", "_nuevo")] = "";
      return f;
    });
  };

  // ==========================
  // Validación formulario
  // ==========================
  const formValido = useMemo(() => {
    if (!form.almacen_destino_id && !form.almacen_destino_nuevo?.trim()) return false;
    const cant = Number(form.cantidad);
    if (!Number.isInteger(cant) || cant <= 0) return false;
    if (cant > form.cantidad_disponible) return false;
    return true;
  }, [form]);

  // ==========================
  // Guardar cambio
  // ==========================
const guardar = async () => {
  if (!formValido) {
    setToast({ type: "error", message: "Formulario incompleto o cantidad inválida" });
    return;
  }

  const empresaDestinoFinal = form.empresa_destino_id || form.empresa_origen_id;
  const fabricanteDestinoFinal = form.fabricante_destino_id || form.fabricante_origen_id;
  const almacenDestinoFinal = form.almacen_destino_id || form.almacen_destino_nuevo;

  const payload = {
    producto_id: cambio.producto_id,
    empresa_origen_id: Number(form.empresa_origen_id),
    almacen_origen_id: Number(form.almacen_origen_id),
    fabricante_origen_id: form.fabricante_origen_id ? Number(form.fabricante_origen_id) : null,
    empresa_destino_id: Number(empresaDestinoFinal),
    empresa_destino_nuevo: form.empresa_destino_nuevo || null,
    almacen_destino_id: Number(almacenDestinoFinal),
    almacen_destino_nuevo: form.almacen_destino_nuevo || null,
    fabricante_destino_id: fabricanteDestinoFinal ? Number(fabricanteDestinoFinal) : null,
    fabricante_destino_nuevo: form.fabricante_destino_nuevo || null,
    cantidad: Number(form.cantidad),
    observaciones: form.observaciones || null,
  };

  try {
    await api.post(
      `/api/logistica/cambios-almacen/${cambio.id}/validar-con-edicion`,
      payload
    );

    // ✅ Mostrar toast de éxito antes de cerrar
    setToast({ type: "success", message: "✅ Cambio validado correctamente" });

    // Opcional: esperar 1.2s para que el usuario vea el toast antes de cerrar
    setTimeout(() => {
      onSuccess?.();
      onClose?.();
    }, 1200);

  } catch (error) {
    console.error("❌ ERROR BACKEND:", error.response?.data || error);
    setToast({
      type: "error",
      message: error.response?.data?.error || "Error validando cambio",
    });
  }
};


  if (!cambio || loading) return <div style={{ padding: 20 }}>Cargando...</div>;

  return (
    <div className="modal-backdrop">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="modal-card modal-lg">
        <h3>✅ Validar cambio de almacén</h3>

        <div className="form-grid">
          <label>Empresa origen</label>
          <input value={origenNombres.empresa} disabled />
          <label>Almacén origen</label>
          <input value={origenNombres.almacen} disabled />
          <label>Fabricante origen</label>
          <input value={origenNombres.fabricante || "—"} disabled />
          <label>Cantidad disponible</label>
          <input value={form.cantidad_disponible} disabled />
        </div>

        <h4 style={{ marginTop: 20 }}>🔁 Datos de destino</h4>
        <div className="form-grid">
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
              type="number"
              min="1"
              max={form.cantidad_disponible}
              value={form.cantidad}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                if (Number(v) > form.cantidad_disponible) return;
                setForm({ ...form, cantidad: v });
              }}
            />
          </div>

          <div>
            <label>Observaciones</label>
            <textarea
              rows="3"
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn success" onClick={guardar} disabled={!formValido}>
            Validar y mover stock
          </button>
        </div>
      </div>
    </div>
  );
}
