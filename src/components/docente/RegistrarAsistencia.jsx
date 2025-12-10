// src/pages/docente/RegistrarAsistencia.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import docentesApi from "../../api/docentesApi";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";
import "./RegistrarAsistencia.css";

const ESTADOS = ["PRESENTE", "TARDANZA", "AUSENTE", "JUSTIFICADO", "REMOTO"];

export default function RegistrarAsistencia() {
  // --- Obtener sesion desde la URL (?sesion=15)
  const [searchParams] = useSearchParams();
  const sesionIdFromQuery = searchParams.get("sesion");
  const [sesionId, setSesionId] = useState(sesionIdFromQuery || "");

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [infoMsg, setInfoMsg] = useState(""); // mensajes legibles para el usuario
  const [errorMsg, setErrorMsg] = useState(""); // mensajes de error legibles

  // --- Cargar alumnos cuando cambie la sesión (o query param)
  useEffect(() => {
    if (sesionId) fetchAlumnos(sesionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionId]);

  // --- Helper: validar ID
  const esIdValido = (id) => {
    if (!id) return false;
    // aceptar números o strings numéricos
    return /^\d+$/.test(String(id));
  };

  // --- API: Cargar alumnos de la sección (se usa "seccionId")
  const fetchAlumnos = async (id) => {
    setInfoMsg("");
    setErrorMsg("");
    if (!esIdValido(id)) {
      setAlumnos([]);
      setInfoMsg("El ID ingresado no parece válido. Debe ser un número (ej: 15).");
      console.warn("fetchAlumnos: ID inválido ->", id);
      return;
    }

    setLoading(true);
    console.groupCollapsed(`[Asistencia] fetchAlumnos -> seccionId=${id}`);
    try {
      const res = await docentesApi.listarAlumnosSesion(id);
      console.log("Respuesta listarAlumnosSesion:", res);

      const lista = (res.data?.alumnos || []);
      if (!Array.isArray(lista) || lista.length === 0) {
        setAlumnos([]);
        setInfoMsg(
          "No se encontraron estudiantes para esta sección. Posibles razones:\n" +
            "- La sección no tiene alumnos matriculados.\n" +
            "- Se ingresó un ID de sección equivocado.\n" +
            "- La base de datos aún no registró matrículas para esta sección."
        );
        console.info("No hay alumnos para la sección:", id);
      } else {
        setAlumnos(
          lista.map((a) => ({
            ...a,
            estado: "PRESENTE", // estado inicial por defecto
          }))
        );
        setInfoMsg("");
      }
    } catch (err) {
      console.error("Error cargando alumnos:", err);
      // mostrar mensaje más descriptivo al usuario
      const serverMsg = err?.response?.data?.msg || err?.message || String(err);
      setErrorMsg(
        "Error al cargar los estudiantes. Revisa la conexión o el ID de la sección.\n" +
          `Detalle: ${serverMsg}`
      );
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  };

  // --- Cambiar estado de un alumno
  const cambiarEstado = (idx, nuevoEstado) => {
    setAlumnos((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], estado: nuevoEstado };
      return copy;
    });
  };

  // --- Guardar asistencia
  const guardar = async () => {
    setInfoMsg("");
    setErrorMsg("");

    if (!sesionId) {
      alert("Debes ingresar un ID de sesión/ sección antes de guardar.");
      return;
    }
    if (!esIdValido(sesionId)) {
      alert("El ID de sesión ingresado no es válido. Debe ser un número.");
      return;
    }
    if (alumnos.length === 0) {
      const confirmar = window.confirm(
        "No hay alumnos cargados. ¿Quieres intentar guardar de todos modos (esto borrará asistencias previas para la sección)?"
      );
      if (!confirmar) return;
    }

    setGuardando(true);
    try {
      // construir payload con la estructura esperada por el backend
      const payload = {
        asistencias: alumnos.map((a) => ({
          usuario_id: a.id,
          estado: a.estado,
        })),
      };

      console.groupCollapsed(`[Asistencia] guardar -> seccionId=${sesionId}`);
      console.log("Payload enviar:", payload);

      const res = await docentesApi.registrarAsistencia(sesionId, payload);
      console.log("Respuesta registrarAsistencia:", res);
      setInfoMsg("Asistencias registradas correctamente.");
      alert("Asistencias registradas correctamente.");
    } catch (err) {
      console.error("Error guardando asistencias:", err);
      const serverMsg = err?.response?.data?.msg || err?.message || String(err);
      setErrorMsg(
        "No pudimos registrar la asistencia. Posibles causas:\n" +
          "- La sección no existe.\n" +
          "- Problema en el servidor.\n" +
          `Detalle: ${serverMsg}`
      );
      alert("Error guardando asistencias. Revisa la consola para más detalle.");
    } finally {
      console.groupEnd();
      setGuardando(false);
    }
  };

  return (
    <>
      <DashboardHeader />

      <div className="asistencia-container">
        <header>
          <h2>Registrar Asistencia</h2>
          <p className="muted">
            Selecciona el estado para cada estudiante. Puedes cargar alumnos ingresando el
            <strong> ID de sección</strong> (ej: <code>15</code>) o usando el parámetro
            <code>?sesion=15</code> en la URL.
          </p>
        </header>

        {/* Selección de sesión / sección */}
        <div className="form-row">
          <label>ID de Sección</label>
          <input
            value={sesionId}
            onChange={(e) => setSesionId(e.target.value)}
            placeholder="Ejemplo: 15"
            aria-label="ID de Sección"
          />
          <button
            className="btn"
            onClick={() => sesionId && fetchAlumnos(sesionId)}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Cargar alumnos"}
          </button>
        </div>

        {/* Mensajes informativos / errores */}
        <div className="messages-row">
          {infoMsg && (
            <div className="info-box" style={{ whiteSpace: "pre-line" }}>
              <strong>Info:</strong> {infoMsg}
            </div>
          )}
          {errorMsg && (
            <div className="error-box" style={{ whiteSpace: "pre-line" }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}
        </div>

        {/* Lista de alumnos */}
        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
          <div className="alumnos-list">
            {alumnos.length === 0 ? (
              <div className="empty">
                <p>No hay alumnos para esta sección.</p>
                <p className="muted small">
                  Si esperabas alumnos: verifica el ID de sección y que existan matrículas activas.
                </p>
              </div>
            ) : (
              alumnos.map((a, i) => (
                <div className="alumno-card" key={a.id}>
                  <div className="alumno-info">
                    <div className="alumno-name">
                      {a.nombre} {a.apellido_paterno} {a.apellido_materno}
                    </div>
                    <div className="alumno-doc">
                      {a.numero_documento} • {a.correo}
                    </div>
                  </div>

                  <div className="estado-selector" role="group" aria-label="selector estados">
                    {ESTADOS.map((e) => (
                      <button
                        key={e}
                        className={`estado-pill ${a.estado === e ? "active" : ""}`}
                        onClick={() => cambiarEstado(i, e)}
                        type="button"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Botón guardar */}
        <div className="save-section">
          <button className="btn primary" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar asistencia"}
          </button>
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
