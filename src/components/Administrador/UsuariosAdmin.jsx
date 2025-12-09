// src/components/Administrador/UsuariosAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./UsuariosAdmin.css";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state (create / edit)
  const [form, setForm] = useState({
    correo: "",
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
      setUsuarios(res.data.usuarios || res.data); // según backend
    } catch (err) {
      console.error(err);
      alert("Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      correo: "",
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
    try {
      if (editingId) {
        await adminApi.actualizarUsuario(editingId, form);
        alert("Usuario actualizado");
      } else {
        await adminApi.crearUsuario(form);
        alert("Usuario creado");
      }
      resetForm();
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error guardando usuario");
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setForm({
      correo: u.correo || "",
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
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await adminApi.eliminarUsuario(id);
      alert("Usuario eliminado");
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error eliminando usuario");
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
              <th>ID</th><th>Correo</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.correo}</td>
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
