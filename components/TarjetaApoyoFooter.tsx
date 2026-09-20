"use client";

import { useApoyo } from "./ModalApoyo";
import { IconoCafe } from "./Iconos";

export default function TarjetaApoyoFooter() {
  const { abrirApoyo } = useApoyo();

  return (
    <div className="pie-tarjeta-apoyo">
      <div className="pie-tarjeta-apoyo-contenido">
        <div className="pie-tarjeta-apoyo-icono" aria-hidden="true">
          <IconoCafe />
        </div>
        <div className="pie-tarjeta-apoyo-texto">
          <h3 className="pie-tarjeta-apoyo-titulo">¿Te sirvió esta agenda en el Libro Fest?</h3>
          <p className="pie-tarjeta-apoyo-bajada">
            Esta aplicación fue desarrollada de manera voluntaria e independiente por <strong>John Cortés</strong> para toda la comunidad universitaria y visitantes. Si valoras este trabajo, puedes donarme un café de corazón.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={abrirApoyo}
        className="boton-donar-deuna"
        title="Abrir código QR para donar voluntariamente"
      >
        <span>Donar un café</span>
      </button>
    </div>
  );
}
