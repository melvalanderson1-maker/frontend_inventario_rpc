// src/App.jsx
import React, { useEffect } from "react";
import AppRouter from "./router/AppRouter";

export default function App() {

  useEffect(() => {
    const url = window.location.href;
    console.log("🔥 [APP] URL ACTUAL:", url);

    const esMP =
      url.includes("mercadopago.com") ||
      url.includes("mercadopago.pe") ||
      url.includes("/checkout/v1/payment/redirect");

    console.log("🔥 [APP] ¿ES URL DE MP?:", esMP);

    if (esMP) {
      const params = window.location.search.substring(1);
      console.log("🔥 [APP] Parámetros detectados:", params);

      const destino = "/mp-redirect?" + params;
      console.log("🔥 [APP] Redirigiendo a:", destino);

      window.location.href = destino;
    }
  }, []);

  return <AppRouter />;
}
