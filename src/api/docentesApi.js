import axiosClient from "./axiosClient";

const docentesApi = {
  listarDocentes: () => axiosClient.get("/docentes"),
  listarSeccionesDocente: (docenteId) => axiosClient.get(`/docentes/${docenteId}/secciones`),
  listarSesionesDocente: (docenteId) => axiosClient.get(`/docentes/${docenteId}/sesiones`),
  listarSesionesSeccion: (seccionId) => axiosClient.get(`/docentes/secciones/${seccionId}/sesiones`),
  listarAlumnosSesion: (sesionId) => axiosClient.get(`/docentes/sesiones/${sesionId}/alumnos`),
  registrarAsistencia: (sesionId, data) => axiosClient.post(`/docentes/sesiones/${sesionId}/asistencia`, data),
  registrarNotas: (seccionId, payload) => axiosClient.post(`/docentes/secciones/${seccionId}/notas`, payload),
};
export default docentesApi;

