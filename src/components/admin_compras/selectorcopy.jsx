import { useState, useEffect } from "react";

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
        <>
          <select name={nameId} value={value || ""} onChange={onChange}>
            <option value="">Seleccionar</option>
            {options.map((o, i) => (
              <option key={o[optionValue] ?? i} value={o[optionValue]}>
                {o[optionLabel]}
              </option>
            ))}
          </select>

          <small
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={cambiarAInput}
          >
            + Crear nuevo
          </small>
        </>
      ) : (
        <>
          <input
            name={nameNuevo}
            value={valueNuevo || ""}
            placeholder={`Nuevo ${label.toLowerCase()}`}
            onChange={onChange}
          />

          <small
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={cambiarASelect}
          >
            ← Volver a lista
          </small>
        </>
      )}

      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
