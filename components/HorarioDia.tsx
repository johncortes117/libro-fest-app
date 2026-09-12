"use client";

import Link from "next/link";
import { hhmm } from "@/lib/tiempo";
import { TIPOS, type Sesion } from "@/lib/tipos";
import { porId as lugarPorId } from "@/data/lugares";

/**
 * Las actividades guardadas de un día, en una columna de horas.
 *
 * Es la representación natural del problema que tiene esta agenda: con hasta ocho
 * cosas a la vez, el solape se ve de un vistazo y no hay que leer una lista aparte
 * que lo explique con palabras. Dos bloques uno al lado del otro son dos bloques a
 * la misma hora.
 */

const PX_POR_MINUTO = 1.15;

interface Colocada {
  sesion: Sesion;
  carril: number;
  carriles: number;
}

/**
 * Reparte las sesiones en carriles: cada una va al primer carril libre a su hora.
 * Las que se solapan acaban en carriles distintos y, por tanto, lado a lado.
 */
function colocar(sesiones: Sesion[]): Colocada[] {
  const orden = [...sesiones].sort((a, b) => a.inicio - b.inicio || a.fin - b.fin);
  const finDeCarril: number[] = [];
  const conCarril = orden.map((sesion) => {
    let carril = finDeCarril.findIndex((fin) => fin <= sesion.inicio);
    if (carril === -1) {
      carril = finDeCarril.length;
      finDeCarril.push(sesion.fin);
    } else {
      finDeCarril[carril] = sesion.fin;
    }
    return { sesion, carril };
  });

  /* Cuántos carriles hay *en cada grupo de solape*: si a las 9:00 hay tres cosas a
     la vez pero a las 17:00 solo una, la de las 17:00 debe ocupar todo el ancho. */
  return conCarril.map(({ sesion, carril }) => {
    const solapan = conCarril.filter(
      (o) => o.sesion.inicio < sesion.fin && o.sesion.fin > sesion.inicio
    );
    return { sesion, carril, carriles: Math.max(...solapan.map((o) => o.carril)) + 1 };
  });
}

export default function HorarioDia({ sesiones }: { sesiones: Sesion[] }) {
  if (sesiones.length === 0) return null;

  const colocadas = colocar(sesiones);
  const desde = Math.floor(Math.min(...sesiones.map((s) => s.inicio)) / 60) * 60;
  const hasta = Math.ceil(Math.max(...sesiones.map((s) => s.fin)) / 60) * 60;
  const alto = (hasta - desde) * PX_POR_MINUTO;

  const horas: number[] = [];
  for (let m = desde; m <= hasta; m += 60) horas.push(m);

  return (
    <div className="horario" style={{ height: alto }}>
      <div className="horario-reglas" aria-hidden>
        {horas.map((m) => (
          <div key={m} className="horario-hora" style={{ top: (m - desde) * PX_POR_MINUTO }}>
            <span>{hhmm(m)}</span>
            <i />
          </div>
        ))}
      </div>

      <div className="horario-pistas">
        {colocadas.map(({ sesion, carril, carriles }) => {
          const lugar = lugarPorId.get(sesion.lugarId);
          const ancho = 100 / carriles;

          return (
            <Link
              key={sesion.id}
              href={`/sesion/${sesion.id}/`}
              className="horario-bloque"
              style={
                {
                  top: (sesion.inicio - desde) * PX_POR_MINUTO,
                  height: Math.max(30, (sesion.fin - sesion.inicio) * PX_POR_MINUTO - 3),
                  left: `${carril * ancho}%`,
                  width: `calc(${ancho}% - 4px)`,
                  "--color-tipo": `var(--t-${sesion.tipo})`,
                  "--fondo-tipo": `var(--t-${sesion.tipo}-soft)`,
                } as React.CSSProperties
              }
              title={`${hhmm(sesion.inicio)}–${hhmm(sesion.fin)} · ${sesion.titulo}`}
            >
              <span className="hb-hora">{hhmm(sesion.inicio)}</span>
              <span className="hb-titulo">{sesion.titulo}</span>
              {lugar && <span className="hb-lugar">{lugar.nombre}</span>}
              <span className="solo-lectores">
                {TIPOS[sesion.tipo].nombre}, hasta las {hhmm(sesion.fin)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
