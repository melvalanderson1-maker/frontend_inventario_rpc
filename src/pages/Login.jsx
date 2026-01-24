// src/pages/Login.jsx
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ correo:"", password:"" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email: form.correo, password: form.password });

      // REDIRECCIÓN SEGÚN ROL
      // REDIRECCIÓN SEGÚN ROL REAL
      switch (user.rol) {
        case "ADMIN_MAX":
          navigate("/dashboard/admin");
          break;

        case "ADMIN_COMPRAS":
          navigate("/compras"); // <--- CORREGIDO
          break;

        case "ADMIN_LOGISTICA":
          navigate("/logistica");
          break;

        case "ADMIN_CONTABILIDAD":
          navigate("/contabilidad");
          break;


        case "ADMIN_VENTAS":
          navigate("/dashboard/admin/ventas");
          break;

        case "DOCENTE":
          navigate("/dashboard/docente");
          break;

        case "SECRETARIA":
          navigate("/dashboard/secretaria");
          break;

        case "ESTUDIANTE":
          navigate("/dashboard/estudiante");
          break;

        default:
          navigate("/");
      }

    } catch (err) {
      alert("Credenciales inválidas");
    }
  };


  return (
    <>
      <PublicHeader />
      <main className="login container">
        <form onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          <input placeholder="Correo" value={form.correo} onChange={e=>setForm({...form, correo:e.target.value})} />
          <input type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
          <button type="submit">Iniciar</button>
        </form>
      </main>
      <PublicFooter />
    </>
  );
}
