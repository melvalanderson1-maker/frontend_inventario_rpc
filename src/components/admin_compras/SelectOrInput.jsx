import { useState, useEffect } from "react";
import "./SelectOrInput.css"; // o la ruta correcta


export default function SelectOrInput({
  label,
  nameId,
  nameNuevo,
  options = [],
  onChange,
  value = "",        // 🔥 ahora usamos value (no valueId)
  valueNuevo = "",
  optionValue = "id",
  optionLabel = "nombre",
  error
}) {
  const [modoInput, setModoInput] = useState(false);

  /* =====================================================
     Si hay texto en nuevo → forzar modo input
  ===================================================== */
  useEffect(() => {
    if (valueNuevo) setModoInput(true);
  }, [valueNuevo]);

  /* =====================================================
     Cambiar a input manual
  ===================================================== */
  const cambiarAInput = () => {
    setModoInput(true);

    // limpiar select
    onChange({
      target: {
        name: nameId,
        value: ""
      }
    });
  };

  /* =====================================================
     Volver al select
  ===================================================== */
  const cambiarASelect = () => {
    setModoInput(false);

    // limpiar input nuevo
    onChange({
      target: {
        name: nameNuevo,
        value: ""
      }
    });
  };

  return (
    <div className={`field ${error ? "error" : ""}`}>
      <label>{label}</label>

      {!modoInput ? (
        <div className="select-container">
          <select name={nameId} value={value || ""} onChange={onChange}>
            <option value="">Seleccionar</option>
            {options.map((o, i) => (
              <option key={o[optionValue] ?? i} value={o[optionValue]}>
                {o[optionLabel]}
              </option>
            ))}
          </select>

          <small
            className="crear-nuevo"
            onClick={cambiarAInput}
          >
            + Crear nuevo
          </small>
        </div>
      ) : (
        <div className="select-container">
          <input
            name={nameNuevo}
            value={valueNuevo || ""}
            placeholder={`Nuevo ${label.toLowerCase()}`}
            onChange={onChange}
          />

          <small
            className="volver-select"
            onClick={cambiarASelect}
          >
            ← Volver a lista
          </small>
        </div>
      )}


      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
