"use client";

import { DIAS } from "@/lib/tipos";

/**
 * La tira de los cinco días.
 *
 * Estaba duplicada en la agenda y en el mapa con pequeñas diferencias —el mapa se
 * había dejado el punto de «hoy»—. Un solo componente y las dos pantallas se
 * comportan igual.
 */
export default function TiraDias({
  dia,
  hoy,
  onElegir,
}: {
  dia: string;
  hoy: string | null;
  onElegir: (fecha: string) => void;
}) {
  return (
    <div className="tira tira-dias" role="group" aria-label="Día del festival">
      {DIAS.map((d) => {
        const esHoy = hoy === d.fecha;
        return (
          <button
            key={d.fecha}
            type="button"
            className={esHoy ? "dia-boton hoy" : "dia-boton"}
            aria-pressed={dia === d.fecha}
            onClick={() => onElegir(d.fecha)}
          >
            <span className="d">{d.corto.slice(0, 3)}</span>
            <span className="n">{d.numero}</span>
            {esHoy && <span className="hoy-punto" aria-label="hoy" />}
          </button>
        );
      })}
      <button
        type="button"
        className="dia-boton dia-boton-todos"
        aria-pressed={dia === "todos"}
        onClick={() => onElegir("todos")}
        title="Ver actividades permanentes de todos los días"
      >
        <span className="d">TODOS</span>
        <span className="n n-todos">LOS DÍAS</span>
      </button>
    </div>
  );
}
