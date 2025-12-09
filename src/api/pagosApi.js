// src/api/pagosApi.js
import axiosClient from "./axiosClient"; // ya lo tenías: baseURL configurada

// Crea preference en backend y devuelve el init_point (redirect URL)
export const iniciarPagoMercadoPago = (seccion_id, alumno) =>
  axiosClient.post("/pagos/mercadopago", {
    seccion_id,
    alumno,
  });

// Simulación Yape (solo para pruebas)
export const pagoYapeSimulado = (seccion_id, alumno) =>
  axiosClient.post("/pagos/yape-simulado", {
    seccion_id,
    alumno,
  });
