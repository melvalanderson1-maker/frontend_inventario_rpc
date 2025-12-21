import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function MpRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const preferenceId =
      params.get("preference_id") || params.get("preference-id");
    const status = params.get("status"); // 👈 CLAVE

    if (!preferenceId) {
      navigate("/");
      return;
    }

    // 🔴 SI MP DICE FAILURE O REJECTED
    if (status === "failure") {
      navigate(`/checkout-error?pref=${preferenceId}`);
      return;
    }

    let intentos = 0;

    const verificar = async () => {
      try {
        const res = await axiosClient.get(
          `/pagos/verificar/${preferenceId}`
        );

        const estado = res.data.estado;

        if (estado === "APPROVED") {
          navigate("/login");
        } else if (estado === "PENDING" && intentos < 8) {
          intentos++;
          setTimeout(verificar, 2000);
        } else {
          // 🔴 RECHAZADO
          navigate(`/checkout-error?pref=${preferenceId}`);
        }
      } catch (err) {
        navigate(`/checkout-error?pref=${preferenceId}`);
      }
    };

    verificar();
  }, [navigate, params]);

  return <p>Confirmando pago...</p>;
}
