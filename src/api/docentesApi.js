// src/api/docentesApi.js
import axiosClient from "./axiosClient";

const docentesApi = {
  listarDocentes: () => axiosClient.get("/docentes"),
  listarSeccionesDocente: (docenteId) => axiosClient.get(`/docentes/${docenteId}/secciones`),
  listarSesionesDocente: (docenteId) => axiosClient.get(`/docentes/${docenteId}/sesiones`),
  listarAlumnosSesion: (sesionId) => axios.get(`/docente/sesiones/${sesionId}/alumnos`),
  
  registrarAsistencia: (sesionId, data) =>axios.post(`/docente/sesiones/${sesionId}/asistencias`, data),
  registrarNotas: (seccionId, payload) => axiosClient.post(`/docentes/secciones/${seccionId}/notas`, payload),
};

export default docentesApi;
