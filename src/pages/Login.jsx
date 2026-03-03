import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ correo: "", password: "" });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");

    try {
      const user = await login({
        email: form.correo,
        password: form.password,
      });

      setStatus("success");

      setTimeout(() => {
        switch (user.rol) {
          case "ADMIN_MAX": navigate("/dashboard/admin"); break;
          case "ADMIN_COMPRAS": navigate("/compras"); break;
          case "ADMIN_LOGISTICA": navigate("/logistica"); break;
          case "ADMIN_CONTABILIDAD": navigate("/contabilidad"); break;
          case "ADMIN_VENTAS": navigate("/ventas"); break;
          case "DOCENTE": navigate("/dashboard/docente"); break;
          case "SECRETARIA": navigate("/dashboard/secretaria"); break;
          case "ESTUDIANTE": navigate("/dashboard/estudiante"); break;
          default: navigate("/");
        }
      }, 1000);

    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div className="login-page">
      <PublicHeader />

      <main className="login-main">
        <div className="login-container">

          <div className="login-brand">
            <div>
              <h1>Sistema de Inventarios</h1>
              <p>Plataforma empresarial inteligente</p>
            </div>
          </div>

          <div className="login-panel">
            <form onSubmit={handleSubmit} className="login-form">

              <h2>Acceso corporativo</h2>

              <div className="input-group">
                <label>Correo</label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) =>
                    setForm({ ...form, correo: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <span className="spinner"></span>
                ) : (
                  "Ingresar"
                )}
              </button>

              {status === "error" && (
                <div className="error-msg">
                  Credenciales incorrectas
                </div>
              )}

            </form>
          </div>

        </div>

        <div className="dev-badge">
          Desarrollado por <strong>WankoraEP</strong>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}