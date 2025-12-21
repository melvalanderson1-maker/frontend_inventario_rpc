import { useSearchParams } from "react-router-dom";

export default function CheckoutError() {
  const [params] = useSearchParams();
  const pref = params.get("pref");

  const reintentar = () => {
    window.location.href = `https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=${pref}`;
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>No se pudo procesar el pago</h2>
      <p>
        El medio de pago fue rechazado.  
        Puedes intentar nuevamente con otro medio.
      </p>

      <button onClick={reintentar}>
        Reintentar pago
      </button>
    </div>
  );
}
