// src/api/adminApi.js
import axiosClient from "./axiosClient";

const adminApi = {
  listarUsuarios: () => axiosClient.get("/admin/usuarios"),
  obtenerUsuario: (id) => axiosClient.get(`/admin/usuarios/${id}`),
  crearUsuario: (data) => axiosClient.post("/admin/usuarios", data),
  actualizarUsuario: (id, data) => axiosClient.put(`/admin/usuarios/${id}`, data),
  eliminarUsuario: (id) => axiosClient.delete(`/admin/usuarios/${id}`),

  listarDocentes: () => axiosClient.get("/admin/docentes"),
  listarCursosDocente: (id) => axiosClient.get(`/admin/docentes/${id}/cursos`), // <--- AGREGAR ESTO
  // src/api/adminApi.js
  lumnosSeccion: (id) => axiosClient.get(`/admin/secciones/${id}/alumnos`),

  listarSecretarias: () => axiosClient.get("/admin/secretarias"),
  listarAlumnos: () => axiosClient.get("/admin/alumnos"),

  listarCursos: () => axiosClient.get("/admin/cursos"),
  crearCurso: (data) => axiosClient.post("/admin/cursos", data),
  actualizarCurso: (id, data) => axiosClient.put(`/admin/cursos/${id}`, data),
  eliminarCurso: (id) => axiosClient.delete(`/admin/cursos/${id}`),

  listarSecciones: () => axiosClient.get("/admin/secciones"),
  crearSeccion: (data) => axiosClient.post("/admin/secciones", data),
  actualizarSeccion: (id, data) => axiosClient.put(`/admin/secciones/${id}`, data),
  eliminarSeccion: (id) => axiosClient.delete(`/admin/secciones/${id}`),

  listarSesiones: (id) => axiosClient.get(`/admin/secciones/${id}/sesiones`),
  crearSesion: (d) => axiosClient.post(`/admin/sesiones`, d),
  actualizarSesion: (id, d) => axiosClient.put(`/admin/sesiones/${id}`, d),
  eliminarSesion: (id) => axiosClient.delete(`/admin/sesiones/${id}`),

  listarHorarios: (id) => axiosClient.get(`/admin/secciones/${id}/horarios`),
  crearHorario: (d) => axiosClient.post(`/admin/horarios`, d),

  generarSesiones: (id) => axiosClient.post(`/admin/secciones/${id}/generar-sesiones`),


  listarPagos: () => axiosClient.get("/admin/pagos"),
  listarFacturas: () => axiosClient.get("/admin/facturas"),
  listarAuditoria: () => axiosClient.get("/admin/auditoria"),
};

export default adminApi;
