// src/api/adminApi.js
import axiosClient from "./axiosClient";

const adminApi = {

  // === USUARIOS ===
  listarUsuarios: () => axiosClient.get("/admin/usuarios"),
  obtenerUsuario: (id) => axiosClient.get(`/admin/usuarios/${id}`),
  crearUsuario: (data) => axiosClient.post("/admin/usuarios", data),
  actualizarUsuario: (id, data) => axiosClient.put(`/admin/usuarios/${id}`, data),
  eliminarUsuario: (id) => axiosClient.delete(`/admin/usuarios/${id}`),

  // === ROLES ===
  listarDocentes: () => axiosClient.get("/admin/docentes"),
  listarSecretarias: () => axiosClient.get("/admin/secretarias"),
  listarAlumnos: () => axiosClient.get("/admin/alumnos"),

  // cursos de un docente
  listarCursosDocente: (id) => axiosClient.get(`/admin/docentes/${id}/cursos`),

  // alumnos de una seccion
  listarAlumnosSeccion: (id) => axiosClient.get(`/admin/secciones/${id}/alumnos`),

  // === CURSOS ===
  listarCursos: () => axiosClient.get("/admin/cursos"),
  crearCurso: (data) => axiosClient.post("/admin/cursos", data),
  actualizarCurso: (id, data) => axiosClient.put(`/admin/cursos/${id}`, data),
  eliminarCurso: (id) => axiosClient.delete(`/admin/cursos/${id}`),

  // === SECCIONES ===
  listarSecciones: () => axiosClient.get("/admin/secciones"),
  crearSeccion: (data) => axiosClient.post("/admin/secciones", data),
  actualizarSeccion: (id, data) => axiosClient.put(`/admin/secciones/${id}`, data),
  eliminarSeccion: (id) => axiosClient.delete(`/admin/secciones/${id}`),

  // === SESIONES ===
  listarSesiones: (id) => axiosClient.get(`/admin/secciones/${id}/sesiones`),
  crearSesion: (data) => axiosClient.post(`/admin/sesiones`, data),
  actualizarSesion: (id, data) => axiosClient.put(`/admin/sesiones/${id}`, data),
  eliminarSesion: (id) => axiosClient.delete(`/admin/sesiones/${id}`),
  generarSesionesAutomaticas: (seccionId) => axios.post(`admin/secciones/${seccionId}/generar-sesiones`),
  generarSesiones: (id) => axiosClient.post(`/admin/secciones/${id}/generar-sesiones`),

  // === HORARIOS ===
  listarHorarios: (id) => axiosClient.get(`/admin/secciones/${id}/horarios`),
  crearHorario: (data) => axiosClient.post(`/admin/horarios`, data),
  eliminarHorario: (id) => axiosClient.delete(`/admin/horarios/${id}`),

  // === REPORTES ===
  listarPagos: () => axiosClient.get("/admin/pagos"),
  listarFacturas: () => axiosClient.get("/admin/facturas"),
  listarAuditoria: () => axiosClient.get("/admin/auditoria"),
};

export default adminApi;
