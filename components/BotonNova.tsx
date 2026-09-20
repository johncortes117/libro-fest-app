"use client";

interface Props {
  className?: string;
}

/**
 * Acceso directo a Nova (Asistente conversacional con IA del Libro Fest).
 * Diseñado como un badge literario parejo a los demás:
 * - Fondo sólido sin degradado (acorde al branding del festival).
 * - Dos líneas de texto ("Habla con" / "Nova ↗") para igualar el ritmo visual de los otros badges.
 * - Icono con ecualizador de ondas animadas en tono dorado.
 * Enlace: https://librofest-hologram.vercel.app/
 */
export default function BotonNova({ className }: Props) {
  return (
    <a
      href="https://librofest-hologram.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className={`badge-literario badge-nova ${className ?? ""}`}
      title="Hablar con Nova (Asistente con IA del Libro Fest)"
      aria-label="Habla con Nova: Asistente con Inteligencia Artificial del Libro Fest (abre en nueva pestaña)"
    >
      {/* Icono de voz / ondas animadas */}
      <span className="badge-icono-caja badge-nova-icono" aria-hidden="true">
        <span className="nova-voz-ondas">
          <span className="onda o1" />
          <span className="onda o2" />
          <span className="onda o3" />
          <span className="onda o4" />
        </span>
      </span>

      {/* Texto en dos filas parejo con los demás badges */}
      <div className="badge-texto-caja">
        <span className="badge-nova-linea1">Habla con</span>
        <span className="badge-nova-linea2">
          Nova <span className="nova-flecha-char" aria-hidden="true">↗</span>
        </span>
      </div>
    </a>
  );
}
