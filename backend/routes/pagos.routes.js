// routes/pagos.routes.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { initDB } = require("../config/db");

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const FRONT_URL = (process.env.FRONT_URL || "").trim().replace(/\/$/, "");
const IS_DEV = FRONT_URL.includes("localhost") || FRONT_URL.includes("127.0.0.1");

// ================================================================
// Helper: obtener datos de curso y sección
// ================================================================
async function obtenerCursoYSeccion(db, seccion_id) {
  const [rows] = await db.query(
    `SELECT s.id as seccion_id, s.precio as precio_seccion, s.codigo, s.modalidad, s.periodo,
            c.id as curso_id, c.titulo, c.precio as precio_curso
     FROM secciones s
     JOIN cursos c ON s.curso_id = c.id
     WHERE s.id = ? LIMIT 1`,
    [seccion_id]
  );
  return rows[0];
}

// ====================================================================
// POST /pagos/mercadopago
// ====================================================================
router.post("/mercadopago", express.json(), async (req, res) => {
  try {
    const { seccion_id, alumno } = req.body;

    if (!seccion_id || !alumno) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const db = await initDB();
    const info = await obtenerCursoYSeccion(db, seccion_id);

    if (!info) {
      return res.status(404).json({ error: "Sección no encontrada" });
    }

    const unit_price = Number(info.precio_seccion || info.precio_curso);
    if (!unit_price || unit_price <= 0) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    // ============================================================
    // Construcción de la preferencia de Mercado Pago
    // ============================================================
    const preferenceBody = {
      items: [
        {
          title: info.titulo,
          quantity: 1,
          unit_price,
          currency_id: "PEN",
        },
      ],
      payer: {
        email: alumno.correo,
        first_name: alumno.nombre,
        last_name:
          alumno.apellido_paterno +
          (alumno.apellido_materno ? " " + alumno.apellido_materno : ""),
        identification: alumno.numero_documento
          ? { type: "DNI", number: String(alumno.numero_documento) }
          : undefined,
        phone: alumno.telefono
          ? { area_code: "51", number: String(alumno.telefono) }
          : undefined,
      },

      // 🔥 EVITA QUE MERCADO LIBRE OBLIGUE A INICIAR SESIÓN
      marketplace: "UQUANTUM",
      payment_methods: {
        default_payment_method_id: null,
        installments: 1,
        excluded_payment_types: [],
        excluded_payment_methods: [],
      },

      back_urls: {
        success: `${FRONT_URL}/mp-redirect?status=success`,
        failure: `${FRONT_URL}/mp-redirect?status=failure`,
        pending: `${FRONT_URL}/mp-redirect?status=pending`,
      },

      auto_return: IS_DEV ? undefined : "approved",
      binary_mode: false,
    };


    // ============================================================
    // Consumir API de Mercado Pago
    // ============================================================
    const mpRes = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      preferenceBody,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const preference = mpRes.data;

    // ============================================================
    // Guardar la preferencia en base de datos
    // ============================================================
    await db.query(
      `INSERT INTO preferencias 
      (preference_id, correo, nombre, apellido_paterno, apellido_materno,
       numero_documento, telefono, seccion_id, monto, estado, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        preference.id,
        alumno.correo,
        alumno.nombre,
        alumno.apellido_paterno,
        alumno.apellido_materno || "",
        alumno.numero_documento || "",
        alumno.telefono || "",
        seccion_id,
        unit_price,
        "PENDING",
      ]
    );

    return res.json({
      init_point: preference.init_point,
      preference_id: preference.id,
    });
  } catch (err) {
    console.error("💥 ERROR MERCADO PAGO:", err?.response?.data || err.message);
    return res.status(500).json({
      error: "Error Mercado Pago",
      detalle: err?.response?.data || err.message,
    });
  }
});

// ====================================================================
// POST /pagos/yape-simulado
// ====================================================================
router.post("/yape-simulado", express.json(), async (req, res) => {
  try {
    const { seccion_id, alumno } = req.body;

    if (!seccion_id || !alumno) {
      return res.status(400).json({ ok: false, message: "Faltan datos" });
    }

    const db = await initDB();

    await db.query(
      `INSERT INTO preferencias 
      (preference_id, correo, nombre, apellido_paterno, apellido_materno,
       numero_documento, telefono, seccion_id, monto, estado, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        `YAPE-SIM-${Date.now()}`,
        alumno.correo,
        alumno.nombre,
        alumno.apellido_paterno,
        alumno.apellido_materno || "",
        alumno.numero_documento || "",
        alumno.telefono || "",
        seccion_id,
        0,
        "APPROVED",
      ]
    );

    return res.json({
      ok: true,
      message: "Pago Yape simulado registrado correctamente",
    });
  } catch (err) {
    console.error("💥 ERROR YAPE SIM:", err.message);
    return res.status(500).json({
      ok: false,
      message: "Error simulando pago Yape",
      detalle: err.message,
    });
  }
});

module.exports = router;
