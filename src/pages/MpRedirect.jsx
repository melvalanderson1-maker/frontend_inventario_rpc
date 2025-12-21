import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function MpRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const externalReference = params.get("external_reference");

    if (!externalReference) {
      navigate("/");
      return;
    }

    const verificar = async () => {
      try {
        const res = await axiosClient.get(
          `/pagos/verificar/${externalReference}`
        );

        if (res.data.estado === "APPROVED") {
          navigate("/login"); // ✅ pago exitoso
        } else {
          navigate(-1); // ❌ vuelve a checkout
        }
      } catch (err) {
        console.error("Error verificando pago", err);
        navigate(-1);
      }
    };

    verificar();
  }, []);

  return <p>Verificando pago...</p>;
}
