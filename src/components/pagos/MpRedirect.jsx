import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function MpRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const preferenceId =
      params.get("preference_id") || params.get("preference-id");

    if (!preferenceId) {
      navigate("/");
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
        } else if (estado === "PENDING" && intentos < 6) {
          intentos++;
          setTimeout(verificar, 2000); // espera webhook
        } else {
          navigate(-1);
        }
      } catch (err) {
        navigate(-1);
      }
    };

    verificar();
  }, [navigate, params]);

  return <p>Confirmando pago...</p>;
}
