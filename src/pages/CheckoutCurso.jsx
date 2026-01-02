import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import ModalMensaje from "../components/UI/ModalMensaje";

import { iniciarPagoMercadoPago, pagoYapeSimulado } from "../api/pagosApi";
import { obtenerSeccionesPorCurso } from "../api/seccionesApi";

import "./CheckoutCurso.css";

export default function CheckoutCurso() {
  const { cursoId } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMensaje, setModalMensaje] = useState("");
  const [tipoModal, setTipoModal] = useState("error");

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
      if (!cursoId) return;
      setLoading(true);
      try {
        const res = await obtenerSeccionesPorCurso(cursoId);
        setCurso(res.data);
        setSecciones(res.data.secciones || []);
      } catch (error) {
        console.error("Error al cargar curso:", error);
        mostrarModal("Error al cargar curso.", "error");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [cursoId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const mostrarModal = (msg, tipo = "error") => {
    setModalMensaje(msg);
    setTipoModal(tipo);
    setModalVisible(true);
  };

  const validarFormulario = () => {
    if (!form.nombre || !form.apellido_paterno || !form.correo || !form.dni || !form.seccion_id) {
      mostrarModal("Complete los campos obligatorios.", "error");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) {
      mostrarModal("Ingrese un correo válido.", "error");
      return false;
    }
    if (!/^\d{6,12}$/.test(form.dni)) {
      mostrarModal("DNI inválido.", "error");
      return false;
    }
    return true;
  };

  const handlePagar = async () => {
    if (!validarFormulario()) return;
    setProcesando(true);

    try {
      const payloadAlumno = {
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        correo: form.correo,
        numero_documento: form.dni,
        telefono: form.telefono,
      };

      const res = await iniciarPagoMercadoPago(form.seccion_id, payloadAlumno);

      if (res?.data?.init_point) {
        window.location.href = res.data.init_point;
      } else {
        mostrarModal("No se pudo iniciar el pago.", "error");
      }
    } catch (err) {
      console.error("Error iniciando pago MP:", err);
      mostrarModal("Error iniciando pago.", "error");
    } finally {
      setProcesando(false);
    }
  };

  const handleYapeSimulado = async () => {
    if (!validarFormulario()) return;
    setProcesando(true);
    try {
      const payloadAlumno = {
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        correo: form.correo,
        numero_documento: form.dni,
        telefono: form.telefono,
      };

      const res = await pagoYapeSimulado(form.seccion_id, payloadAlumno);

      if (res.data.ok) {
        mostrarModal("Pago Yape simulado exitoso.", "success");
        setTimeout(() => navigate(`/mi-curso/${form.seccion_id}`), 1200);
      } else {
        mostrarModal("Error en pago Yape.", "error");
      }
    } catch (err) {
      mostrarModal("Error con Yape simulado.", "error");
    } finally {
      setProcesando(false);
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
           {/*<h3>1. Datos del alumno</h3>

          <select name="seccion_id" disabled value={form.seccion_id} onChange={handleChange}>
            <option value="">Seleccione una sección</option>
            {secciones.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigo} — {s.modalidad} — {s.periodo}
              </option>
            ))}
          </select>

          <input name="nombre" disabled placeholder="Nombre" value={form.nombre} onChange={handleChange} />
          <input name="apellido_paterno" disabled placeholder="Apellido paterno" value={form.apellido_paterno} onChange={handleChange} />
          <input name="apellido_materno" disabled placeholder="Apellido materno" value={form.apellido_materno} onChange={handleChange} />
          <input name="correo" disabled placeholder="Correo" value={form.correo} onChange={handleChange} />
          <input name="dni" disabled placeholder="DNI" value={form.dni} onChange={handleChange} />
          <input name="telefono" disabled placeholder="Teléfono" value={form.telefono} onChange={handleChange} />

          <h3>2. Confirmar pago</h3>*/}

          <div className="whatsapp-button">
            <a
              href="https://wa.me/51971168000?text=Hola,%20deseo%20información%20sobre%20el%20curso"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Consultar por WhatsApp
            </a>
          </div>


          <button className="btn btn-primary" onClick={handlePagar} disabled={procesando}>
            {procesando ? "Procesando..." : "Pagar"}
          </button>

          <button className="btn btn-secondary" onClick={handleYapeSimulado} disabled={procesando}>
            {procesando ? "Procesando..." : "Simular Yape (test)"}
          </button>
        </div>

        <div className="secciones">
          <h3>Secciones disponibles:</h3>
          {secciones.length > 0 ? (
            secciones.map((s) => (
              <div key={s.id} className="card seccion-card">
                <p><strong>Código:</strong> {s.codigo}</p>
                <p><strong>Modalidad:</strong> {s.modalidad}</p>
                <p><strong>Periodo:</strong> {s.periodo}</p>
                <p><strong>Capacidad:</strong> {s.capacidad}</p>
              </div>
            ))
          ) : (
            <p>No hay secciones disponibles.</p>
          )}
        </div>
      </main>

      <PublicFooter />

      <ModalMensaje
        visible={modalVisible}
        mensaje={modalMensaje}
        tipo={tipoModal}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
