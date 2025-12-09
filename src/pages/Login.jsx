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
      if (user.rol === "ESTUDIANTE") navigate("/dashboard/estudiante");
      else if (user.rol === "DOCENTE") navigate("/dashboard/docente");
      else if (user.rol === "SECRETARIA") navigate("/dashboard/secretaria");
      else if (user.rol === "ADMIN") navigate("/dashboard/admin");

      else navigate("/");

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
