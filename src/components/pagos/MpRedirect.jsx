import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function MpRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Mercado Pago SIEMPRE devuelve preference_id
    const preferenceId =
      params.get("preference_id") || params.get("preference-id");

    if (!preferenceId) {
      console.error("❌ No llegó preference_id desde Mercado Pago");
      navigate("/");
      return;
    }

    const verificar = async () => {
      try {
        const res = await axiosClient.get(
          `/pagos/verificar/${preferenceId}`
        );

        const estado = res.data.estado;

        if (estado === "APPROVED") {
          navigate("/login"); // ✅ pago exitoso
        } else if (estado === "PENDING") {
          // ⏳ puedes mostrar una vista de espera si quieres
          navigate("/"); 
        } else {
          // ❌ rejected, failure, etc
          navigate(-1);
        }
      } catch (err) {
        console.error("❌ Error verificando pago", err);
        navigate(-1);
      }
    };

    verificar();
  }, [navigate, params]);

  return <p>Verificando pago...</p>;
}
