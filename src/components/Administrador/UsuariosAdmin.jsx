import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./UsuariosAdmin.css";
import Swal from "sweetalert2";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);




  // 🔐 evaluar seguridad de contraseña
  const evaluarPassword = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { nivel: "Débil", color: "red", valor: 30 };
    if (score === 3 || score === 4) return { nivel: "Media", color: "orange", valor: 65 };
    return { nivel: "Fuerte", color: "green", valor: 100 };
  };


  // form state (create / edit)
  const [form, setForm] = useState({
    correo: "",
    contraseña: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    numero_documento: "",
    telefono: "",
    rol: "ADMIN_MAX",
    estado: "ACTIVO",
  });
  const [editingId, setEditingId] = useState(null);

  // 👇 AGREGA AQUÍ
  const correoExiste =
    form.correo &&
    usuarios.some(
      (u) =>
        u.correo.toLowerCase() === form.correo.toLowerCase() &&
        u.id !== editingId // 👈 clave
    );


  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarUsuarios();
      setUsuarios(res.data.usuarios || res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      correo: "",
      contraseña: "",
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      numero_documento: "",
      telefono: "",
      rol: "ADMIN_MAX",
      estado: "ACTIVO",
    });
    setEditingId(null);
    setPasswordStrength(null);
    setShowPassword(false);
  };

const handleSubmit = async (e) => {
e.preventDefault();

// Validaciones básicas
if (!form.correo || !form.nombre || !form.apellido_paterno || (!editingId && !form.contraseña)) {
    Swal.fire("Error", "Faltan datos obligatorios", "warning");
    return;
}

// Validación DNI (8 dígitos)
// Validación número de documento (DNI Perú = 8 dígitos)
if (form.numero_documento && !/^\d{8}$/.test(form.numero_documento)) {
  Swal.fire("Error", "El número de documento debe tener 8 dígitos", "warning");
  return;
}


// Teléfono / celular (9 dígitos)
if (form.telefono && !/^\d{9}$/.test(form.telefono)) {
    Swal.fire("Error", "El teléfono debe tener 9 dígitos", "warning");
    return;
}

// Validación de correo
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(form.correo)) {
    Swal.fire("Error", "Correo inválido", "warning");
    return;
}


// 🔐 validar seguridad de contraseña
if (!editingId && passwordStrength?.nivel === "Débil") {
  Swal.fire(
    "Contraseña insegura",
    "La contraseña debe ser al menos MEDIA o FUERTE",
    "warning"
  );
  return;
}


try {
    if (editingId) {
    const payload = { ...form };
    // no enviar contraseña vacía al editar
    if (!payload.contraseña) delete payload.contraseña;
    await adminApi.actualizarUsuario(editingId, payload);
    Swal.fire("Éxito", "Usuario actualizado", "success");
    } else {
    await adminApi.crearUsuario(form);
    Swal.fire("Éxito", "Usuario creado", "success");
    }
    resetForm();
    fetchUsuarios();
} catch (err) {
  console.error(err);

  const data = err.response?.data;

  // 🎯 errores de duplicado
  if (data?.code === "DUPLICADO") {
    Swal.fire({
      title: "No se pudo crear el usuario",
      html: `
        <ul style="text-align:left">
          ${data.errores.map(e => `<li>⚠️ ${e}</li>`).join("")}
        </ul>
      `,
      icon: "warning"
    });
    return;
  }

  Swal.fire(
    "Error",
    data?.msg || "Error guardando usuario",
    "error"
  );
}

};


  const handleEdit = (u) => {
    setEditingId(u.id);

    // 👇 LIMPIAR ESTADOS DE CONTRASEÑA
    setPasswordStrength(null);
    setShowPassword(false);

    setForm({
      correo: u.correo || "",
      contraseña: "", // 👈 vacío
      nombre: u.nombre || "",
      apellido_paterno: u.apellido_paterno || "",
      apellido_materno: u.apellido_materno || "",
      numero_documento: u.numero_documento || "",
      telefono: u.telefono || "",
      rol: u.rol || "ADMIN_MAX",
      estado: u.estado || "ACTIVO",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Eliminar usuario",
      text: "¿Desea eliminar este usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });
    if (result.isConfirmed) {
      try {
        await adminApi.eliminarUsuario(id);
        Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
        fetchUsuarios();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo eliminar el usuario", "error");
      }
    }
  };

 const handleResetPassword = async (usuario) => {
  let nuevaPassword = "";
  let fuerza = null;
  let mostrar = false;

  const { isConfirmed } = await Swal.fire({
    title: "Resetear contraseña",
    html: `
      <div style="position:relative">
        <input
          type="password"
          id="swal-password"
          class="swal2-input"
          placeholder="Nueva contraseña"
          style="padding-right:40px"
        />

        <!-- 👁️ OJITO -->
        <button
          id="toggle-password"
          style="
            position:absolute;
            right:14px;
            top:12px;
            background:none;
            border:none;
            cursor:pointer;
            font-size:18px;
          "
        >👁️</button>
      </div>

      <!-- 🐵 BARRA -->
      <div
        id="password-bar"
        style="height:6px;border-radius:4px;margin-top:8px;"
      ></div>

      <!-- TEXTO -->
      <small id="password-text"></small>
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    focusConfirm: false,

    preConfirm: () => {
      if (!nuevaPassword) {
        Swal.showValidationMessage("Ingrese una contraseña");
        return false;
      }
      if (fuerza?.nivel === "Débil") {
        Swal.showValidationMessage("Contraseña débil (mínimo MEDIA)");
        return false;
      }
      return true;
    },

    didOpen: () => {
      const input = document.getElementById("swal-password");
      const bar = document.getElementById("password-bar");
      const text = document.getElementById("password-text");
      const toggle = document.getElementById("toggle-password");

      // 👁️ MOSTRAR / OCULTAR
      toggle.addEventListener("click", () => {
        mostrar = !mostrar;
        input.type = mostrar ? "text" : "password";
        toggle.innerText = mostrar ? "🙈" : "👁️";
      });

      // 🐵 FUERZA DE CONTRASEÑA
      input.addEventListener("input", (e) => {
        nuevaPassword = e.target.value;

        if (!nuevaPassword) {
          bar.style.width = "0";
          text.innerText = "";
          return;
        }

        fuerza = evaluarPassword(nuevaPassword);

        bar.style.width = fuerza.valor + "%";
        bar.style.backgroundColor = fuerza.color;

        text.innerText = `Seguridad: ${fuerza.nivel}`;
        text.style.color = fuerza.color;
      });
    }
  });

  if (isConfirmed) {
    try {
      await adminApi.actualizarUsuario(usuario.id, {
        contraseña: nuevaPassword
      });

      Swal.fire("Éxito", "Contraseña actualizada correctamente", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg || "No se pudo cambiar la contraseña",
        "error"
      );
    }
  }
};



    const DOMINIOS_PERMITIDOS = [
      "gmail.com",
      "outlook.com",
      "hotmail.com",
      "yahoo.com",
      "icloud.com",
      "multilimpsac.com"
    ];



  return (
    <div className="usuarios-admin">
      <h2>Gestión de Usuarios</h2>

      <form className="usuario-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Editar usuario" : "Crear usuario"}</h3>

      {/* Correo + Contraseña */}
      <div className="row">
        <div className="field" style={{ flex: 1 }}>
        <input
          name="correo"
          placeholder="Correo"
          value={form.correo}
          onChange={(e) => {
            const value = e.target.value.toLowerCase();

            // formato básico de correo
            if (!/^[^\s@]*@?[^\s@]*\.?[^\s@]*$/.test(value)) return;

            setForm({ ...form, correo: value });
          }}
          onBlur={() => {
            if (!form.correo) return;

            const [, dominio] = form.correo.split("@");

            if (!dominio || !DOMINIOS_PERMITIDOS.includes(dominio)) {
              Swal.fire(
                "Correo no permitido",
                `Dominios aceptados: ${DOMINIOS_PERMITIDOS.map(d => `@${d}`).join(", ")}`,
                "warning"
              );
              setForm({ ...form, correo: "" });
            }
          }}
          required
        />

        {form.correo && (() => {
          const dominio = form.correo.split("@")[1];
          return dominio && !DOMINIOS_PERMITIDOS.includes(dominio) ? (
            <small className="error-text">
              Dominios permitidos (gmail, outlook, hotmail, yahoo, icloud)
            </small>
          ) : null;
        })()}


          {correoExiste && (
            <small className="error-text">⚠️ Este correo ya existe</small>
          )}
        </div>

        <div className="field password-field">


          {passwordStrength && (
            <div style={{ marginTop: "5px" }}>
              <div
                style={{
                  height: "6px",
                  width: `${passwordStrength.valor}%`,
                  backgroundColor: passwordStrength.color,
                  borderRadius: "4px",
                  transition: "width 0.3s",
                }}
              />
              <small style={{ color: passwordStrength.color }}>
                Seguridad: {passwordStrength.nivel}
              </small>
            </div>
          )}

          <input
            type={showPassword ? "text" : "password"}
            name="contraseña"
            placeholder="Contraseña"
            value={form.contraseña || ""}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, contraseña: value });

              if (value) {
                setPasswordStrength(evaluarPassword(value));
              } else {
                setPasswordStrength(null);
              }
            }}

            required={!editingId}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            title="Mostrar / Ocultar contraseña"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

      </div>


        <div className="row">
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </div>




        <div className="row">
          <input name="apellido_paterno" placeholder="Apellido paterno" value={form.apellido_paterno}
            onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })} required/>
          <input name="apellido_materno" placeholder="Apellido materno" value={form.apellido_materno}
            onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })} />
        </div>

        <div className="row">
            <input
              name="numero_documento"
              placeholder="DNI (8 dígitos)"
              value={form.numero_documento}
              maxLength={8}
              onChange={(e) =>
                setForm({
                  ...form,
                  numero_documento: e.target.value.replace(/\D/g, "")
                })
              }
            />
            <input
              name="telefono"
              placeholder="Teléfono (9 dígitos, empieza con 9)"
              value={form.telefono}
              maxLength={9}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // solo números

                // obligar a que empiece con 9
                if (value.length > 0 && value[0] !== "9") {
                  return;
                }

                setForm({ ...form, telefono: value });
              }}
            />

        </div>

        <div className="row">
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            <option value="ADMIN_MAX">ADMIN_MAX</option>
            <option value="ADMIN_COMPRAS">ADMIN_COMPRAS</option>
            <option value="ADMIN_LOGISTICA">ADMIN_LOGISTICA</option>
            <option value="ADMIN_CONTABILIDAD">ADMIN_CONTABILIDAD</option>
            <option value="ADMIN_VENTAS">ADMIN_VENTAS</option>
          </select>


          <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="SUSPENDIDO">SUSPENDIDO</option>
          </select>
        </div>

        <div className="row actions">
          <button
            type="submit"
            className="btn primary"
            disabled={correoExiste}
          >
            {editingId ? "Guardar cambios" : "Crear usuario"}
          </button>

          <button type="button" className="btn" onClick={resetForm}>Limpiar</button>
        </div>
      </form>

      <hr />

      <h3>Usuarios</h3>
      {loading ? <p>Cargando...</p> : (
        <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Correo</th><th>Contraseña</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.correo}</td>
                <td>
                  {u.contraseña_hash ? "*****" : ""}
                  <button onClick={() => handleResetPassword(u)} className="btn small">🔑</button>
                </td>
                <td>{u.nombre} {u.apellido_paterno}</td>
                <td>{u.rol}</td>
                <td>{u.estado}</td>
                <td>
                  <button onClick={() => handleEdit(u)} className="btn small">Editar</button>
                  <button onClick={() => handleDelete(u.id)} className="btn small danger">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
