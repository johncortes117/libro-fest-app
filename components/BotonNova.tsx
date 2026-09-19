"use client";

interface Props {
  className?: string;
}

/**
 * Acceso directo a Nova (Asistente conversacional con IA).
 * Diseñado con la misma estructura y altura base de `badge-literario`,
 * destacando con acabado cósmico, borde dorado y ondas de audio animadas.
 * Enlace: https://librofest-hologram.vercel.app/
 */
export default function BotonNova({ className }: Props) {
  return (
    <a
      href="https://librofest-hologram.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className={`badge-literario badge-nova-ia ${className ?? ""}`}
      title="Hablar con Nova (Asistente conversacional con IA del festival)"
      aria-label="Hablar con Nova: Asistente con Inteligencia Artificial del Libro Fest (abre en nueva pestaña)"
    >
      {/* Icono con ondas animadas simulando ecualizador de voz / IA */}
      <span className="badge-icono-caja badge-nova-icono" aria-hidden="true">
        <span className="nova-ondas">
          <span className="onda o1" />
          <span className="onda o2" />
          <span className="onda o3" />
          <span className="onda o4" />
        </span>
      </span>

      {/* Textos del badge */}
      <div className="badge-texto-caja">
        <span className="badge-nova-nombre">
          Habla con Nova <span className="badge-nova-flecha">↗</span>
        </span>
        <span className="badge-nova-tag">Asistente IA</span>
      </div>
    </a>
  );
}
