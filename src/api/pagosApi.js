import axiosClient from "./axiosClient"; // cliente axios configurado con baseURL y auth si aplica

export const iniciarPagoMercadoPago = (seccion_id, alumno) =>
  axiosClient.post("/pagos/mercadopago", {
    seccion_id,
    alumno,
  });


// =========================
// YAPE SIMULADO
// =========================
export const pagarConYapeSimulado = (payload) =>
  axiosClient.post("/pagos/yape-simulado", payload);
