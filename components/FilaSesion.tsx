"use client";

import Link from "next/link";
import { porId as lugarPorId } from "@/data/lugares";
import { useGuardadas } from "@/lib/guardadas";
import { duracion, hhmm } from "@/lib/tiempo";
import { TIPOS, type Sesion } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import { IconoGuardado, IconoGuardar } from "./Iconos";

interface Props {
  sesion: Sesion;
  /** Muestra «quedan 48 min» / «en 18 min» en lugar de la hora de fin. */
  relativo?: boolean;
  /** Marca la fila como conflictiva en «Mi agenda». */
  choca?: boolean;
  mostrarDia?: boolean;
}

const DIA_CORTO: Record<string, string> = {
  "2026-09-21": "lun 21",
  "2026-09-22": "mar 22",
  "2026-09-23": "mié 23",
  "2026-09-24": "jue 24",
  "2026-09-25": "vie 25",
};

export default function FilaSesion({ sesion, relativo, choca, mostrarDia }: Props) {
  const momento = useMomento();
  const { contiene, alternar } = useGuardadas();

  const lugar = lugarPorId.get(sesion.lugarId);
  const guardada = contiene(sesion.id);

  const enCurso =
    momento != null &&
    momento.fecha === sesion.dia &&
    sesion.inicio <= momento.minutos &&
    sesion.fin > momento.minutos;

  const restante = momento && enCurso ? sesion.fin - momento.minutos : null;
  const faltan =
    momento && momento.fecha === sesion.dia && sesion.inicio > momento.minutos
      ? sesion.inicio - momento.minutos
      : null;

  const estilo = {
    "--color-tipo": `var(--t-${sesion.tipo})`,
    "--fondo-tipo": `var(--t-${sesion.tipo}-soft)`,
  } as React.CSSProperties;

  return (
    <div className={choca ? "fila choca" : "fila"} style={estilo}>
      <div className="fila-hora">
        {sesion.permanente ? (
          <>
            <span>{hhmm(sesion.inicio)}</span>
            <span className="fin">todo el día</span>
          </>
        ) : (
          <>
            <span>{hhmm(sesion.inicio)}</span>
            <span className="fin">
              {relativo && restante != null
                ? `quedan ${duracion(restante)}`
                : relativo && faltan != null
                  ? `en ${duracion(faltan)}`
                  : hhmm(sesion.fin)}
            </span>
          </>
        )}
      </div>

      <div className="fila-cuerpo">
        <Link href={`/sesion/${sesion.id}/`} className="fila-titulo">
          {sesion.titulo}
          {sesion.truncado && <span title="El título viene cortado en la agenda oficial"> […]</span>}
        </Link>

        {sesion.detalle && <p className="fila-detalle">{sesion.detalle}</p>}
        {sesion.personas.length > 0 && <p className="fila-detalle">{sesion.personas.join(" · ")}</p>}

        <div className="fila-meta">
          <span className="chip chip-tipo">{TIPOS[sesion.tipo].nombre}</span>

          {enCurso && (
            <span className="chip chip-vivo">
              <span className="punto-vivo" /> en curso
            </span>
          )}

          {mostrarDia && <span>{DIA_CORTO[sesion.dia]}</span>}

          {lugar && (
            <>
              {lugar.pin != null && <span className="chip chip-pin">{lugar.pin}</span>}
              <Link href={`/lugar/${lugar.id}/`}>{lugar.nombre}</Link>
              {sesion.lugarTexto !== lugar.nombre && (
                <>
                  <span className="sep">·</span>
                  <span>{sesion.lugarTexto}</span>
                </>
              )}
              {lugar.fuera && <span className="chip chip-aviso">{lugar.fuera.ciudad}</span>}
              {lugar.porConfirmar && <span className="chip chip-aviso">sala por confirmar</span>}
            </>
          )}

          {sesion.finSupuesto && <span className="chip chip-aviso">cierre estimado</span>}
          {choca && <span className="chip chip-vivo">se pisa</span>}
        </div>
      </div>

      <button
        type="button"
        className="boton-icono fila-guardar"
        aria-pressed={guardada}
        aria-label={guardada ? `Quitar «${sesion.titulo}» de mi agenda` : `Guardar «${sesion.titulo}» en mi agenda`}
        onClick={() => alternar(sesion.id)}
      >
        {guardada ? (
          <IconoGuardado className="icono" aria-hidden />
        ) : (
          <IconoGuardar className="icono" aria-hidden />
        )}
      </button>
    </div>
  );
}
