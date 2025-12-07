const express = require("express");
const router = express.Router();
require("dotenv").config();

const { registrarPagoExitoso, pagoYapeSimulado } = require("../controllers/pagos.controller");
const { initDB } = require("../config/db");

const { MercadoPagoConfig, Preference } = require("mercadopago");

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preferenceClient = new Preference(mp);

// FRONTEND URL
const FRONT_URL = process.env.FRONT_URL.trim().replace(/\/$/, "");
const IS_DEV = FRONT_URL.includes("localhost");



// Helper: obtener datos de seccion y curso desde DB (para seguridad)
async function obtenerCursoYSeccion(db, seccion_id) {
  // Ajusta nombres de tablas según tu esquema
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


router.post("/mercadopago", async (req, res) => {
  try {
    const { seccion_id, alumno } = req.body;
    if (!seccion_id || !alumno) return res.status(400).json({ error: "Faltan datos" });

    // Conexión DB
    const db = await initDB();

    // 1) Obtener datos reales de DB
    const info = await obtenerCursoYSeccion(db, seccion_id);
    if (!info) return res.status(404).json({ error: "Sección no encontrada" });

    // Decidir precio: si existe precio en la seccion usarlo, sino usar precio del curso
    const unit_price = Number(info.precio_seccion ?? info.precio_curso ?? 0);
    if (!unit_price || unit_price <= 0) return res.status(400).json({ error: "Precio inválido" });

    // 2) Crear preferencia en Mercado Pago (HTTP request)
    const preferenceBody = {
      items: [
        {
          title: info.titulo,
          quantity: 1,
          unit_price: unit_price,
          currency_id: "PEN",
        },
      ],
      back_urls: {
        success: `${FRONT_URL}/mp-redirect`,
        failure: `${FRONT_URL}/mp-redirect`,
        pending: `${FRONT_URL}/mp-redirect`,
      },
      auto_return: IS_DEV ? undefined : "approved",
      binary_mode: false,
    };

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

    const preference = mpRes.data; // contiene id, init_point, etc.

    // 3) Guardar preferencia en la BD (estado pending)
    await db.query(
      `INSERT INTO preferencias
      (preference_id, correo, nombre, apellido_paterno, apellido_materno,
       numero_documento, telefono, seccion_id, monto, estado, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        preference.id,
        alumno.correo,
        alumno.nombre,
        alumno.apellido_paterno,
        alumno.apellido_materno,
        alumno.numero_documento,
        alumno.telefono,
        seccion_id,
        unit_price,
        "PENDING",
      ]
    );

    return res.json({ init_point: preference.init_point, preference_id: preference.id });
  } catch (err) {
    console.error("💥 ERROR MP:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: "Error Mercado Pago", detalle: err.message });
  }
});




// routes/pagos.routes.js (añadir)
router.post("/webhook", express.json(), async (req, res) => {
  try {
    // Mercado Pago puede enviar distintos topics; aquí manejamos payments/notifications
    const { action, data } = req.body;
    // O según su formato: req.body.type / req.body.id
    // Para seguridad: verificar signature si la entrega de MP lo soporta (webhook signature)
    const db = await initDB();

    // Ejemplo simple: buscar payment por collection_id vía API MP y actualizar preferencia
    // ... implementación según payload y esquema MP ...
    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("ERROR");
  }
});


// routes/pagos.routes.js (añadir)
router.post("/confirm", express.json(), async (req, res) => {
  try {
    const { preference_id, collection_id } = req.body;
    if (!preference_id) return res.status(400).json({ error: "Falta preference_id" });

    // Consultar pagos en MP
    const searchRes = await axios.get(
      `https://api.mercadopago.com/collector/qualifications/search?preference_id=${preference_id}`,
      {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      }
    ).catch(() => null);

    // Alternativa: buscar por pagos (Payments API)
    // const paymentRes = await axios.get(`https://api.mercadopago.com/v1/payments/${collection_id}`, ...)

    // Para simplificar: usar Payments search endpoint
    const payments = (searchRes && searchRes.data && searchRes.data.results) || [];

    // Buscar pago aprobado
    const approved = payments.find(p => p && p.status === "approved") || null;

    if (!approved) {
      // No aprobado aún
      return res.status(400).json({ ok: false, msg: "Pago no confirmado" });
    }

    // Actualizar la preferencia a APPROVED y crear la matrícula (ejemplo)
    const db = await initDB();
    await db.query(`UPDATE preferencias SET estado = 'APPROVED', updated_at = NOW() WHERE preference_id = ?`, [preference_id]);

    // Aquí debes: crear la matrícula en tu tabla matriculas, etc.
    // Ejemplo:
    // await db.query(`INSERT INTO matriculas (alumno_id, seccion_id, fecha, ...) VALUES (...)`)

    return res.json({ ok: true });
  } catch (err) {
    console.error("Confirm error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Error confirmando pago" });
  }
});


// =================================================
// 2️⃣ YAPE SIMULADO
// =================================================
router.post("/yape-simulado", pagoYapeSimulado);

// =================================================
// 3️⃣ REGISTRO DE PAGO (WEBHOOK + WEB)
// =================================================
//router.post("/exito", registrarPagoExitoso);

module.exports = router;
