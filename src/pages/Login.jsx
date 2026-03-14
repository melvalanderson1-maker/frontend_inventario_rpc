import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import "./Login.css";

export default function Login() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    correo: "",
    password: ""
  });

  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");

    try {

      const user = await login({
        email: form.correo,
        password: form.password
      });

      setStatus("success");

      setTimeout(() => {

        switch (user.rol) {

          case "ADMIN_MAX":
            navigate("/dashboard/admin");
            break;

          case "ADMIN_COMPRAS":
            navigate("/compras");
            break;

          case "ADMIN_LOGISTICA":
            navigate("/logistica");
            break;

          case "ADMIN_CONTABILIDAD":
            navigate("/contabilidad");
            break;

          case "ADMIN_VENTAS":
            navigate("/ventas");
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

      }, 900);

    } catch {

      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
      }, 2000);

    }

  };

  return (

    <div className="login-page">

      <PublicHeader />

      <main className="login-main">

        <div className="login-container">


          {/* PANEL IZQUIERDO */}

          <div className="login-left">

            <div className="platform-badge">
              Plataforma empresarial activa
            </div>

            <h1 className="login-title">
              Sistema de Inventarios
            </h1>

            <p className="login-description">
              Plataforma empresarial para la gestión inteligente de inventarios,
              control operativo y análisis estratégico en tiempo real.
            </p>


          </div>



          {/* LOGIN */}

          <div className="login-right">

            <form className="login-panel" onSubmit={handleSubmit}>

              <h2>Acceso al sistema</h2>

              <p className="login-subtitle">
                Ingrese sus credenciales para continuar
              </p>


              <div className="input-group">

                <label>Correo corporativo</label>

                <input
                  type="email"
                  placeholder="usuario@empresa.com"
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
                  placeholder="Ingrese su contraseña"
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

                {status === "loading"
                  ? <span className="spinner"></span>
                  : "Ingresar al sistema"}

              </button>


              {status === "error" && (

                <div className="error-msg">
                  No fue posible iniciar sesión
                </div>

              )}

              <div className="login-terms">
                Uso exclusivo para personal autorizado
              </div>

            </form>

          </div>

        </div>

      </main>

      <PublicFooter />

    </div>

  );

}