import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import "./DeleteProducto.css";

export default function DeleteProducto({
  producto,
  abierto,
  onCerrar,
  onEliminado
}) {
  const [tipo, setTipo] = useState("inactivar"); // inactivar | logico | fisico
  const [otp, setOtp] = useState("");
  const [paso, setPaso] = useState(1); // 1 = elegir acción | 2 = confirmar OTP
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [expiraEn, setExpiraEn] = useState(null);
  const [reenviarEn, setReenviarEn] = useState(null);
  const [segundosOTP, setSegundosOTP] = useState(0);
  const [segundosReenvio, setSegundosReenvio] = useState(0);
  const [exitoMsg, setExitoMsg] = useState(""); // Mensaje de éxito para toast


    // 🔹 Reiniciar estados cuando se abre un nuevo producto
    useEffect(() => {
    if (!producto) return;

    setTipo("inactivar");
    setOtp("");
    setPaso(1);
    setCargando(false);
    setError("");
    setExpiraEn(null);
    setReenviarEn(null);
    setSegundosOTP(0);
    setSegundosReenvio(0);
    setExitoMsg("");
    }, [producto]);

    // 🔹 Reiniciar estados al cerrar el modal
    useEffect(() => {
    if (!abierto) {
        setTipo("inactivar");
        setOtp("");
        setPaso(1);
        setCargando(false);
        setError("");
        setExpiraEn(null);
        setReenviarEn(null);
        setSegundosOTP(0);
        setSegundosReenvio(0);
        setExitoMsg("");
    }
    }, [abierto]);

  // 1️⃣ pedir OTP
  const solicitarOTP = async () => {
    setError("");
    setCargando(true);

    try {
      const res = await api.post(
        `/api/compras/productos/${producto.id}/solicitar-eliminacion`
      );

      setOtp(""); // 🔥 IMPORTANTE
      setExpiraEn(new Date(res.data.expiraEn));
      setReenviarEn(new Date(res.data.reenviarDisponibleEn));
      setPaso(2);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "No se pudo enviar el código de confirmación"
      );
    } finally {
      setCargando(false);
    }
  };

  // 2️⃣ confirmar acción
  const confirmarAccion = async () => {
    if (segundosOTP <= 0) {
      setError("El código expiró. Solicita uno nuevo.");
      return;
    }

    if (!otp.trim()) {
      setError("Debes ingresar el código recibido");
      return;
    }

    setError("");
    setCargando(true);

    try {
      await api.post(
        `/api/compras/productos/${producto.id}/confirmar-eliminacion`,
        {
          token: otp,
          tipo
        }
      );

      // Acción exitosa, mostrar mensaje toast
      const mensaje = tipo === "inactivar"
        ? "Producto inactivado correctamente"
        : tipo === "logico"
        ? "Producto eliminado lógicamente"
        : "Producto eliminado definitivamente";

      setExitoMsg(mensaje);

      // Limpiar después de 3 segundos
      setTimeout(() => setExitoMsg(""), 3000);

      onEliminado();
      onCerrar();
    } catch (err) {
    console.log("ERROR COMPLETO:", err.response?.data);

    setError(
      err.response?.data?.detalle ||
      err.response?.data?.error ||
      "No se pudo completar la acción"
    );
  } finally {
      setCargando(false);
    }
  };

  // Contador OTP
  useEffect(() => {
    if (!expiraEn) return;

    const timer = setInterval(() => {
      const diff = Math.floor((expiraEn - new Date()) / 1000);

      if (diff <= 0) {
        clearInterval(timer);
        setSegundosOTP(0);
        setError("⛔ El código expiró. Solicita uno nuevo.");
      } else {
        setSegundosOTP(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiraEn]);

  // Contador reenvío
  useEffect(() => {
    if (!reenviarEn) return;

    const timer = setInterval(() => {
      const diff = Math.floor((reenviarEn - new Date()) / 1000);

      if (diff <= 0) {
        clearInterval(timer);
        setSegundosReenvio(0);
      } else {
        setSegundosReenvio(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reenviarEn]);

  // ======= RENDER =======
  if (!abierto || !producto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-eliminar">
        <h3>⚠️ Gestión de producto</h3>
        <p><strong>{producto.descripcion}</strong></p>

        {paso === 1 && (
          <>
            <p>Selecciona la acción a realizar:</p>

            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
            >
              <option value="inactivar">🔕 Inactivar producto</option>
              <option value="logico">🧹 Eliminar (lógico)</option>
              <option value="fisico">💣 Eliminar definitivamente</option>
            </select>

            {tipo === "fisico" && (
              <p className="texto-rojo">
                ⚠️ Esta acción elimina imágenes, atributos y registros asociados.
              </p>
            )}

            {error && <div className="error">{error}</div>}

            <div className="modal-acciones">
              <button
                className="btn-eliminar"
                disabled={cargando}
                onClick={solicitarOTP}
              >
                {cargando ? "Enviando código..." : "Continuar"}
              </button>

              <button className="btn-cancelar" onClick={onCerrar}>
                Cancelar
              </button>
            </div>
          </>
        )}

        {paso === 2 && (
          <>
            <p>Se envió un <strong>código de confirmación</strong> a tu correo.</p>
            <p>
              ⏳ Código válido por:{" "}
              <strong>
                {Math.floor(segundosOTP / 60)}:
                {String(segundosOTP % 60).padStart(2, "0")}
              </strong>{" "}min
            </p>

            <input
              placeholder="Código de confirmación"
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />

            <button
              className="btn-reenviar"
              disabled={segundosReenvio > 0 || cargando}
              onClick={solicitarOTP}
            >
              {segundosReenvio > 0
                ? `Reenviar en ${segundosReenvio}s`
                : "Reenviar código"}
            </button>

            {error && <div className="error">{error}</div>}

            <div className="modal-acciones">
              <button
                className="btn-eliminar"
                disabled={cargando || segundosOTP <= 0}
                onClick={confirmarAccion}
              >
                {cargando ? (
                  <span className="spinner"></span> // Puedes poner un spinner CSS
                ) : (
                  "Confirmar acción"
                )}
              </button>

              <button
                className="btn-cancelar"
                onClick={() => setPaso(1)}
              >
                Volver
              </button>
            </div>
          </>
        )}

        {/* Toast de éxito */}
        {exitoMsg && (
          <div className="toast-exito">
            {exitoMsg}
          </div>
        )}
      </div>
    </div>
  );
}