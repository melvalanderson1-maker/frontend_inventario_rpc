// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// BD
const { initDB } = require("./config/db");

// RUTAS
const pagosRoutes = require("./routes/pagos.routes");
const authRoutes = require("./routes/auth.routes");
const cursosRoutes = require("./routes/cursos.routes");
const matriculasRoutes = require("./routes/matriculas.routes");
const izipayRoutes = require("./routes/izipay.routes");
const seccionesRoutes = require("./routes/secciones.routes");

const facturasRoutes = require("./routes/facturas.routes");


const app = express();

console.log("TOKEN MP:", process.env.MP_ACCESS_TOKEN);
console.log("FRONT_URL usando:", process.env.FRONT_URL);


// CORS
app.use(
  cors({
    origin: [
      "https://pruebasquantum.grupo-digital-nextri.com",
      "https://u-quantum-pruebas-production.up.railway.app",
      "http://localhost:5173"
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);



app.use(bodyParser.json());

// Conexión BD
(async () => {
  try {
    const pool = await initDB();
    await pool.getConnection();
    console.log("✅ Conectado a MySQL → Base:", process.env.DB_NAME);
  } catch (err) {
    console.error("❌ Error conectando a MySQL:", err.message);
  }
})();

// 🔵 RUTAS API
app.use("/pagos", pagosRoutes);          // ESTE PRIMERO SIEMPRE
app.use("/auth", authRoutes);
app.use("/cursos", cursosRoutes);

app.use("/secciones", seccionesRoutes);

app.use("/facturas", facturasRoutes);
app.use("/matriculas", matriculasRoutes);



// ⚠ REGISTRAR RUTAS DE USUARIOS AQUÍ
app.use("/usuarios", require("./routes/usuarios.routes"));
// ⚠ IZIPAY DEBE IR DESPUÉS PARA NO ROMPER /pagos/yape/iniciar
app.use("/pagos/izipay", izipayRoutes);

app.use("/estudiantes", require("./routes/estudiantes.routes"));

app.use("/secretaria", require("./routes/secretaria.routes"));

app.use("/cursos", require("./routes/cursos.routes"));



// RUTA BASE
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "Backend Universidad Quantum activo" });
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend escuchando en puerto ${PORT}`));
