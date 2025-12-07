// src/pages/CheckoutCurso.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import ModalMensaje from "../components/UI/ModalMensaje";

import { iniciarPagoMercadoPago } from "../api/pagosApi";
import { obtenerSeccionesPorCurso } from "../api/seccionesApi";

import "./CheckoutCurso.css";

export default function CheckoutCurso() {
  const { cursoId } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMensaje, setModalMensaje] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    dni: "",
    telefono: "",
    seccion_id: "",
  });

  useEffect(() => {
    const cargar = async () => {
      if (!cursoId) return console.error("cursoId es undefined");
      setLoading(true);
      try {
        const res = await obtenerSeccionesPorCurso(cursoId);
        const cursoData = res.data;
        setCurso(cursoData);
        setSecciones(cursoData.secciones || []);
      } catch (error) {
        console.error("Error al cargar curso:", error);
        mostrarModal("Error al cargar curso. Revisa la consola.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [cursoId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const mostrarModal = (msg) => {
    setModalMensaje(msg);
    setModalVisible(true);
  };

  // Validación básica y segura en cliente
  const validarFormulario = () => {
    if (!form.nombre || !form.apellido_paterno || !form.correo || !form.dni || !form.seccion_id) {
      mostrarModal("Complete los campos obligatorios: nombre, apellido paterno, correo, DNI y sección.");
      return false;
    }
    // validación de email sencilla
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) {
      mostrarModal("Ingrese un correo válido.");
      return false;
    }
    // DNI numérico tentativo
    if (!/^\d{6,12}$/.test(form.dni)) {
      mostrarModal("DNI inválido. Use solo números (6-12 dígitos).");
      return false;
    }
    return true;
  };

  // ================================
  // MERCADO PAGO (solo botón)
  // ================================
  const handlePayMercadoPago = async () => {
    if (!validarFormulario()) return;
    setLoading(true);

    try {
      // Enviamos solo seccion_id + alumno (no mandes precio desde el cliente)
      const payloadAlumno = {
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        correo: form.correo,
        numero_documento: form.dni,
        telefono: form.telefono,
      };

      const res = await iniciarPagoMercadoPago(form.seccion_id, payloadAlumno);

      // Respuesta: { init_point, preference_id }
      if (res?.data?.init_point) {
        // Redirige al init_point de MercadoPago para que el usuario pague
        window.location.href = res.data.init_point;
      } else {
        mostrarModal("No se pudo iniciar el pago. Intente nuevamente.");
        console.error("MP respuesta inesperada:", res);
      }
    } catch (err) {
      console.error("Error iniciando pago MP:", err);
      mostrarModal("Error iniciando pago. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Cargando...</p>;

  return (
    <>
      <PublicHeader />

      <main className="container checkout">
        <h2>Matrícula — {curso?.titulo}</h2>

        <div className="card">
          <h3>{curso?.titulo}</h3>
          <p className="descripcion">{curso?.descripcion}</p>
          <p className="precio">S/ {curso?.precio}</p>
        </div>

        <div className="form">
          <select
            name="seccion_id"
            value={form.seccion_id}
            onChange={handleChange}
          >
            <option value="">Seleccione una sección</option>
            {secciones.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigo || `Sección ${s.id}`} — {s.modalidad} — {s.periodo}
              </option>
            ))}
          </select>

          <input name="nombre" placeholder="Nombre" onChange={handleChange} value={form.nombre} />
          <input name="apellido_paterno" placeholder="Apellido paterno" onChange={handleChange} value={form.apellido_paterno} />
          <input name="apellido_materno" placeholder="Apellido materno" onChange={handleChange} value={form.apellido_materno} />
          <input name="correo" placeholder="Correo" onChange={handleChange} value={form.correo} />
          <input name="dni" placeholder="DNI" onChange={handleChange} value={form.dni} />
          <input name="telefono" placeholder="Teléfono" onChange={handleChange} value={form.telefono} />

          <button
            className="btn mp"
            onClick={handlePayMercadoPago}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Procesando..." : "Pagar con Tarjeta (Mercado Pago)"}
          </button>
        </div>

        <div className="secciones">
          <h3>Secciones disponibles:</h3>
          {secciones.length > 0 ? (
            secciones.map((s) => (
              <div key={s.id} className="card seccion-card">
                <p><strong>Código:</strong> {s.codigo || s.id}</p>
                <p><strong>Modalidad:</strong> {s.modalidad}</p>
                <p><strong>Periodo:</strong> {s.periodo}</p>
                <p><strong>Capacidad:</strong> {s.capacidad}</p>
              </div>
            ))
          ) : (
            <p>No hay secciones disponibles</p>
          )}
        </div>

      </main>

      <PublicFooter />

      <ModalMensaje
        visible={modalVisible}
        mensaje={modalMensaje}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
