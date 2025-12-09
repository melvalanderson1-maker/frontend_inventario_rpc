import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./UsuariosAdmin.css";
import Swal from "sweetalert2";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // form state (create / edit)
  const [form, setForm] = useState({
    correo: "",
    contraseña: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    numero_documento: "",
    telefono: "",
    rol: "ESTUDIANTE",
    estado: "ACTIVO",
  });
  const [editingId, setEditingId] = useState(null);

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
      rol: "ESTUDIANTE",
      estado: "ACTIVO",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!form.correo || !form.nombre || !form.apellido_paterno || (!editingId && !form.contraseña)) {
      Swal.fire("Error", "Faltan datos obligatorios", "warning");
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
      Swal.fire("Error", err.response?.data?.msg || "Error guardando usuario", "error");
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setForm({
      correo: u.correo || "",
      contraseña: "",
      nombre: u.nombre || "",
      apellido_paterno: u.apellido_paterno || "",
      apellido_materno: u.apellido_materno || "",
      numero_documento: u.numero_documento || "",
      telefono: u.telefono || "",
      rol: u.rol || "ESTUDIANTE",
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
    const { value: nueva } = await Swal.fire({
      title: `Resetear contraseña para ${usuario.correo}`,
      input: "password",
      inputLabel: "Nueva contraseña",
      inputPlaceholder: "Ingrese nueva contraseña",
      showCancelButton: true,
    });

    if (nueva) {
      try {
        await adminApi.actualizarUsuario(usuario.id, { contraseña: nueva });
        Swal.fire("Éxito", "Contraseña reseteada correctamente", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo resetear la contraseña", "error");
      }
    }
  };

  return (
    <div className="usuarios-admin">
      <h2>Gestión de Usuarios</h2>

      <form className="usuario-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Editar usuario" : "Crear usuario"}</h3>

        <div className="row">
          <input name="correo" placeholder="Correo" value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })} required/>
          <input name="nombre" placeholder="Nombre" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} required/>
        </div>

        <div className="row">
          <input
            type={showPassword ? "text" : "password"}
            name="contraseña"
            placeholder="Contraseña"
            value={form.contraseña || ""}
            onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
            required={!editingId}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="row">
          <input name="apellido_paterno" placeholder="Apellido paterno" value={form.apellido_paterno}
            onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })} required/>
          <input name="apellido_materno" placeholder="Apellido materno" value={form.apellido_materno}
            onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })} />
        </div>

        <div className="row">
          <input name="numero_documento" placeholder="Número documento" value={form.numero_documento}
            onChange={(e) => setForm({ ...form, numero_documento: e.target.value })} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </div>

        <div className="row">
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            <option value="ADMIN">ADMIN</option>
            <option value="SECRETARIA">SECRETARIA</option>
            <option value="DOCENTE">DOCENTE</option>
            <option value="ESTUDIANTE">ESTUDIANTE</option>
            <option value="INVITADO">INVITADO</option>
          </select>

          <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="SUSPENDIDO">SUSPENDIDO</option>
          </select>
        </div>

        <div className="row actions">
          <button type="submit" className="btn primary">{editingId ? "Guardar cambios" : "Crear usuario"}</button>
          <button type="button" className="btn" onClick={resetForm}>Limpiar</button>
        </div>
      </form>

      <hr />

      <h3>Usuarios</h3>
      {loading ? <p>Cargando...</p> : (
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
      )}
    </div>
  );
}
