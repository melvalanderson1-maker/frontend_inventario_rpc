import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";

import { iniciarPagoMercadoPago, pagarConYapeSimulado } from "../api/pagosApi";
import { obtenerSeccionesPorCurso } from "../api/seccionesApi";

import ModalMensaje from "../components/UI/ModalMensaje";

import "./CheckoutCurso.css";

export default function CheckoutCurso() {
  const { cursoId } = useParams();
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
      console.log("Respuesta API:", res.data);

      // Ahora la ruta devuelve el curso con secciones dentro
      const cursoData = res.data;
      setCurso(cursoData);
      setSecciones(cursoData.secciones || []);
    } catch (error) {
      console.error("Error al cargar curso:", error);
      alert("Error al cargar curso. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  cargar();
}, [cursoId]);



  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================================
  // MERCADO PAGO
  // ================================
  const handlePayMercadoPago = async () => {
    if (!form.seccion_id) return mostrarModal("Seleccione una sección");
    setLoading(true);

    try {
      const res = await iniciarPagoMercadoPago(form.seccion_id, form, curso);

      if (res?.data?.init_point) {
        window.location.href = res.data.init_point;
      } else {
        mostrarModal("No se pudo iniciar el pago");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // YAPE SIMULADO
  // ================================
  const handlePayYape = async () => {
    if (!form.seccion_id) return mostrarModal("Seleccione una sección");

    setLoading(true);
    try {
      const payload = {
        alumno: form,
        curso: {
          id: curso.id,
          titulo: curso.titulo,
          precio: curso.precio,
          seccion_id: form.seccion_id,
        },
      };

      const res = await pagarConYapeSimulado(payload);

      if (res?.data?.authToken) {
        localStorage.setItem("token", res.data.authToken);

        mostrarModal(res.data.matriculaMensaje);

        // Redirección diferida
        setTimeout(() => {
          window.location.href = res.data.redirect;
        }, 1800);
      } else {
        mostrarModal("Error en el pago con Yape");
      }
    } finally {
      setLoading(false);
    }
  };

  // Mostrar modal profesional
  const mostrarModal = (msg) => {
    setModalMensaje(msg);
    setModalVisible(true);
  };

  if (loading) return <p className="loading">Cargando...</p>;

  return (
    <>
      <PublicHeader />

      <main className="container checkout">
        <h2>Matrícula — {curso?.titulo}</h2>

        <div className="card">
          <h3>{curso?.titulo}</h3>
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

          <input name="nombre" placeholder="Nombre" onChange={handleChange} />
          <input
            name="apellido_paterno"
            placeholder="Apellido paterno"
            onChange={handleChange}
          />
          <input
            name="apellido_materno"
            placeholder="Apellido materno"
            onChange={handleChange}
          />
          <input name="correo" placeholder="Correo" onChange={handleChange} />
          <input name="dni" placeholder="DNI" onChange={handleChange} />
          <input
            name="telefono"
            placeholder="Teléfono"
            onChange={handleChange}
          />

          <button className="btn mp" onClick={handlePayMercadoPago}>
            Pagar con Tarjeta (Mercado Pago)
          </button>

          <button className="btn yape" onClick={handlePayYape}>
            Pagar con Yape QR
          </button>
        </div>
      </main>

      <PublicFooter />

      {/* MODAL */}
      <ModalMensaje
        visible={modalVisible}
        mensaje={modalMensaje}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

