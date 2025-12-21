import axiosClient from "./axiosClient";

const docentesApi = {
  listarDocentes: () => axiosClient.get("/docentes"),
  listarSeccionesDocente: () =>
  axiosClient.get("/docentes/mis-secciones"),

  listarSesionesSeccion: (seccionId) => axiosClient.get(`/docentes/secciones/${seccionId}/sesiones`),
  listarAlumnosSesion: (sesionId) => axiosClient.get(`/docentes/sesiones/${sesionId}/alumnos`),
  registrarAsistencia: (sesionId, data) => axiosClient.post(`/docentes/sesiones/${sesionId}/asistencia`, data),

  obtenerInfoSesion: (sesionId) =>
  axiosClient.get(`/docentes/sesiones/${sesionId}/info`),

  listarAlumnosSeccion: (seccionId) =>
  axiosClient.get(`/docentes/secciones/${seccionId}/alumnos`),

  registrarNotas: (seccionId, data) =>
    axiosClient.post(`/docentes/secciones/${seccionId}/notas`, data),

};
export default docentesApi;
