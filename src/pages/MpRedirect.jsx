// src/pages/MpRedirect.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function MpRedirect() {
  const locate = useLocation();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Verificando pago...");

  useEffect(() => {
    const params = new URLSearchParams(locate.search);
    const preference_id = params.get("preference_id") || params.get("preference_id");
    const collection_id = params.get("collection_id") || params.get("collection_id");
    const status = params.get("collection_status") || params.get("status");

    // Si ya vino status approved, confirmamos en servidor
    (async () => {
      try {
        const res = await axiosClient.post("/pagos/confirm", { preference_id, collection_id });
        if (res.data && res.data.ok) {
          setMsg("Pago confirmado. Redirigiendo al login...");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          setMsg("Pago pendiente o no confirmado. Revisa tu método de pago.");
        }
      } catch (err) {
        console.error("Error confirmando:", err);
        setMsg("Error verificando pago. Revisa la consola.");
      }
    })();
  }, [locate.search, navigate]);

  return (
    <div className="container">
      <h2>{msg}</h2>
    </div>
  );
}
