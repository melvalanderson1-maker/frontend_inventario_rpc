import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import { resolveImageUrl } from "../../../utils/imageUrl";
import "./EditAndDelete.css";

export default function EditAndDelete({ producto, categorias, abierto, onCerrar, onActualizado }) {
  const [form, setForm] = useState({
    codigo: "",
    modelo: "",
    marca: "",
    descripcion: "",
    categoria_id: "",
    atributos: {}
  });
  const [atributosCategoria, setAtributosCategoria] = useState([]);
  const [codigoValido, setCodigoValido] = useState(true);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);

  const categoriaActual = categorias?.find(cat => cat.id === form.categoria_id)?.nombre || "";

  useEffect(() => {
    if (!producto) return;
    setForm({
      codigo: producto.codigo || "",
      modelo: producto.modelo || "",
      marca: producto.marca || "",
      descripcion: producto.descripcion || "",
      categoria_id: producto.categoria_id || "",
      atributos: {}
    });
    setCodigoValido(true);
  }, [producto]);

  useEffect(() => {
    if (!producto?.categoria_id) return;

    api.get(`/api/compras/productos/${producto.id}/atributos`)
      .then(res => {
        let atributosProd = res.data.atributos || [];
        if (atributosProd.length > 0) {
          const valores = {};
          atributosProd.forEach(attr => valores[attr.atributo_id] = attr.valor || "");
          setAtributosCategoria(atributosProd);
          setForm(f => ({ ...f, atributos: valores }));
        } else {
          api.get(`/api/atributos?categoria=${producto.categoria_id}`)
            .then(res => {
              const atributosCat = res.data || [];
              const valores = {};
              atributosCat.forEach(attr => valores[attr.id] = "");
              setAtributosCategoria(atributosCat);
              setForm(f => ({ ...f, atributos: valores }));
            });
        }
      }).catch(() => {});
  }, [producto]);

  useEffect(() => {
    if (!producto) return;
    const timer = setTimeout(() => {
      const codigoTrim = form.codigo.trim();
      if (!codigoTrim) { setCodigoValido(true); return; }
      setVerificandoCodigo(true);
      api.get(`/api/compras/productos/existe-codigoparaEditar/${encodeURIComponent(codigoTrim)}`)
        .then(res => {
          const existente = res.data.producto;
          setCodigoValido(!existente || existente.id === producto.id);
        })
        .catch(() => setCodigoValido(false))
        .finally(() => setVerificandoCodigo(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [form.codigo, producto]);

  if (!abierto || !producto) return null;

  const guardarCambios = async () => {
    if (!codigoValido) { alert("El código ya existe."); return; }
    if (form.descripcion && form.descripcion.length > 1000) {
      alert("La descripción no puede superar 1000 caracteres"); return;
    }
    try {
      const formData = new FormData();
      formData.append("codigo", form.codigo.trim());
      formData.append("modelo", form.modelo.trim());
      formData.append("marca", form.marca.trim());
      formData.append("descripcion", form.descripcion.trim());
      formData.append("categoria_id", form.categoria_id);
      Object.keys(form.atributos).forEach(attrId => {
        const valor = form.atributos[attrId]?.trim().slice(0,255) || "";
        formData.append(`atributos[${attrId}]`, valor);
      });
      await api.put(`/api/compras/productos/${producto.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Producto actualizado correctamente");
      onCerrar();
      onActualizado();
    } catch (error) {
      console.error("❌ Error actualizar producto:", error);
      alert("Error al actualizar");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar producto</h3>

        {/* IMAGEN + STOCK + CODIGO */}
        <div className="imagen-detalle-grid">
          <div className="producto-imagen-modal">
            {producto.imagen ? (
              <img src={resolveImageUrl(producto.imagen)} alt={producto?.codigo || "producto"} />
            ) : (
              <div className="sin-imagen">Sin imagen</div>
            )}
          </div>

          <div className="producto-detalle-lado">
            <div className="producto-stock-modal">
              Stock total: <strong>{producto.stock_total}</strong>
            </div>
            <div className="campo-input">
              <label>Código</label>
              <input
                placeholder="Código"
                value={form.codigo}
                onChange={e => setForm({ ...form, codigo: e.target.value })}
                style={{ borderColor: codigoValido ? "" : "red" }}
              />
              {!codigoValido && <small style={{ color: "red" }}>¡Código ya existe!</small>}
              {verificandoCodigo && <small>Verificando código...</small>}
              {codigoValido && !verificandoCodigo && form.codigo.trim() && (
                <small style={{ color: "green" }}>✅ Código correcto</small>
              )}
            </div>
          </div>
        </div>

        {/* FILA 1x3: Categoria | Modelo | Marca */}
        <div className="fila-1x3-grid">
          <div className="campo-input">
            <label>Categoría</label>
            <input type="text" value={categoriaActual} disabled />
          </div>
          <div className="campo-input">
            <label>Modelo</label>
            <input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} />
          </div>
          <div className="campo-input">
            <label>Marca</label>
            <input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} />
          </div>
        </div>

        {/* DESCRIPCION (1x1 ancho completo) */}
        <div className="campo-input descripcion-modal">
          <label>Descripción</label>
          <textarea
            placeholder="Descripción (máx 1000 caracteres)"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        {/* ATRIBUTOS n x 4 */}
        <div className="atributos-grid">
          {atributosCategoria.map((attr, index) => {
            const id = attr.atributo_id || attr.id;
            const nombre = attr.atributo_nombre || attr.nombre;
            const unidad = attr.unidad || "";
            return (
              <div key={`attr-${id}-${index}`} className="atributo-input">
                <label>{unidad ? `${nombre} (${unidad})` : nombre}</label>
                <input
                  type="text"
                  value={form.atributos[id] || ""}
                  onChange={e => setForm({
                    ...form,
                    atributos: { ...form.atributos, [id]: e.target.value }
                  })}
                />
              </div>
            );
          })}
        </div>

        {/* BOTONES */}
        <div className="modal-acciones">
          <button className="btn-guardar" onClick={guardarCambios} disabled={!codigoValido}>
            💾 Guardar
          </button>
          <button className="btn-cancelar" onClick={onCerrar}>
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}