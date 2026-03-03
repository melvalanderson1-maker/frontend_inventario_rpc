import React, { useEffect, useState, useRef } from "react"; // ✅ correcto
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


  const [nuevaImagen, setNuevaImagen] = useState(null);
  const inputFileRef = useRef(null); // ref para el input
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState("");

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




  useEffect(() => {
    if (!abierto) return;

    // 🔥 reset visual de imagen
    setNuevaImagen(null);

    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  }, [abierto, producto]);

  const modalRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (!guardando) onCerrar();
      }
    };

    window.addEventListener("keydown", onKey);

    const timer = setTimeout(() => {
      const focusable = modalRef.current?.querySelector("button, [tabindex]:not([tabindex='-1']), input, textarea, select");
      if (focusable) focusable.focus();
      else modalRef.current?.focus();
    }, 60);

    // bloquear scroll de la página mientras el modal está abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
    };
  }, [abierto, guardando, onCerrar]);

  if (!abierto || !producto) return null;
  // calcular número de columnas para la cuadrícula de atributos:
  // por defecto 2 columnas; si hay más de 3 atributos usamos 3 columnas
  const attrCols = (Array.isArray(atributosCategoria) && atributosCategoria.length > 3) ? 3 : 2;

const guardarCambios = async () => {
  if (!codigoValido || guardando) return;

  setGuardando(true);
  setToast("");

  try {
    const formData = new FormData();
    formData.append("codigo", form.codigo.trim());
    formData.append("modelo", form.modelo.trim());
    formData.append("marca", form.marca.trim());
    formData.append("descripcion", form.descripcion.trim());
    formData.append("atributos", JSON.stringify(form.atributos));

    if (nuevaImagen) {
      formData.append("imagen_producto", nuevaImagen);
    }

    await api.put(`/api/compras/productos/${producto.id}`, formData);

    setToast("✅ Producto actualizado correctamente");
    onActualizado();

    setTimeout(() => {
      setNuevaImagen(null);
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      onCerrar();
      setToast("");
    }, 1500);

  } catch (err) {
    setToast("❌ Error al actualizar producto");
  } finally {
    setGuardando(false);
  }
};


  const onChangeImagen = e => {
    if (e.target.files && e.target.files[0]) {
      setNuevaImagen(e.target.files[0]);
    }
  };

  const anularCambioImagen = () => {
    setNuevaImagen(null); // limpia la imagen nueva
    if (inputFileRef.current) {
      inputFileRef.current.value = ""; // borra el nombre del archivo en el input
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => { if (!guardando) onCerrar(); }}
    >
        {/* 🔔 TOAST DE ÉXITO / ERROR */}
        {toast && (
          <div className="toast-exito">
            {toast}
          </div>
        )}

        {guardando && (
          <div className="modal-loading">
            <div className="spinner-grande"></div>
            <p>Guardando cambios...</p>
          </div>
        )}
      <div
        className={`modal ${guardando ? "modal-guardando" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-title"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button
          className="modal-close"
          onClick={() => { if (!guardando) onCerrar(); }}
          aria-label="Cerrar diálogo"
          title="Cerrar (Esc)"
        >
          ✕
        </button>

        <h3 id="edit-product-title">Detalles del producto</h3>

        {/* IMAGEN + STOCK + CODIGO */}
        <div className="imagen-detalle-grid">
        <div className="producto-imagen-modal">
          {nuevaImagen ? (
            <img
              src={URL.createObjectURL(nuevaImagen)}
              alt="Preview"
              className="imagen-producto"
            />
          ) : producto.imagen ? (
            <img
              src={resolveImageUrl(producto.imagen)}
              alt={producto?.codigo || "producto"}
              className="imagen-producto"
            />
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

          {/* (file input eliminado por solicitud) */}
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
        <div className={`atributos-grid cols-${attrCols}`} style={{ gridTemplateColumns: `repeat(${attrCols}, 1fr)` }}>
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


        </div>
      </div>
    </div>
  );
}