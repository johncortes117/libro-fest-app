"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { porId as lugarPorId } from "@/data/lugares";
import { useGuardadas } from "@/lib/guardadas";
import { duracion, hhmm } from "@/lib/tiempo";
import { TIPOS, type Sesion, type TipoSesion } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import { useEntrada } from "./Entrada";
import { useBrindis } from "./Brindis";
import {
  IconoChoque,
  IconoConferencia,
  IconoCultural,
  IconoGuardado,
  IconoGuardar,
  IconoLibro,
  IconoMapa,
  IconoPermanente,
  IconoPersonas,
  IconoReloj,
  IconoTaller,
} from "./Iconos";

/** Cada tipo lleva icono además de color: el color por sí solo no es accesible. */
export const ICONO_TIPO: Record<TipoSesion, (p: { className?: string }) => React.ReactElement> = {
  conferencia: IconoConferencia,
  taller: IconoTaller,
  cultural: IconoCultural,
  libro: IconoLibro,
  permanente: IconoPermanente,
};

interface Props {
  sesion: Sesion;
  /** Muestra la barra de avance y el tiempo que queda, en vez de la hora de fin. */
  relativo?: boolean;
  /** Se solapa con algo que esta persona ya tiene guardado. */
  choca?: boolean;
  mostrarDia?: boolean;
  index?: number;
}

const DIA_CORTO: Record<string, string> = {
  "2026-09-21": "lun 21",
  "2026-09-22": "mar 22",
  "2026-09-23": "mié 23",
  "2026-09-24": "jue 24",
  "2026-09-25": "vie 25",
};

export default function FilaSesion({ sesion, relativo, choca, mostrarDia, index }: Props) {
  const momento = useMomento();
  const { contiene, alternar } = useGuardadas();
  const { pedirEntrada } = useEntrada();
  const { brindar } = useBrindis();

  /* El rebote del icono al guardar. Es la acción que más se repite en toda la
     aplicación y hasta ahora no devolvía ninguna señal: la gente tocaba dos veces
     porque dudaba, y con eso desguardaba lo que acababa de guardar. */
  const [late, setLate] = useState(false);
  const reloj = useRef(0);

  useEffect(() => () => window.clearTimeout(reloj.current), []);

  const lugar = lugarPorId.get(sesion.lugarId);
  const guardada = contiene(sesion.id);
  const Icono = ICONO_TIPO[sesion.tipo];

  const esHoy = momento?.fecha === sesion.dia;
  const enCurso = esHoy && sesion.inicio <= momento!.minutos && sesion.fin > momento!.minutos;
  const faltan = esHoy && sesion.inicio > momento!.minutos ? sesion.inicio - momento!.minutos : null;
  const restante = enCurso ? sesion.fin - momento!.minutos : null;
  const avance = enCurso ? ((momento!.minutos - sesion.inicio) / (sesion.fin - sesion.inicio)) * 100 : 0;

  function alGuardar() {
    const resultado = alternar(sesion.id);

    if (resultado === "necesita-entrar") {
      pedirEntrada("Entra para guardar esta actividad");
      return;
    }

    setLate(true);
    window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => setLate(false), 420);

    if (resultado === "guardada") {
      brindar({ texto: `Guardada · ${sesion.titulo}` });
    }
  }

  const estilo = {
    "--color-tipo": `var(--t-${sesion.tipo})`,
    "--fondo-tipo": `var(--t-${sesion.tipo}-soft)`,
    "--i": Math.min(index ?? 0, 10),
  } as React.CSSProperties;

  const clases = ["sesion"];
  if (enCurso) clases.push("vive");
  if (choca) clases.push("choca");
  if (late) clases.push("late");

  return (
    <article className={clases.join(" ")} style={estilo}>
      {/* Columna izquierda: Hora de inicio y fin grande con máxima jerarquía */}
      <div className="sesion-hora">
        <span className="inicio">{hhmm(sesion.inicio)}</span>
        {sesion.permanente ? (
          <span className="todo-el-dia">
            abierto
            <br />
            todo el día
          </span>
        ) : (
          <span className="fin">
            {relativo && faltan != null ? `en ${duracion(faltan)}` : `hasta ${hhmm(sesion.fin)}`}
          </span>
        )}
      </div>

      {/* Cuerpo principal */}
      <div className="sesion-cuerpo">
        <div className="sesion-cabecera-cuerpo">
          <span className="sesion-tipo">
            <Icono />
            {TIPOS[sesion.tipo].nombre}
            {mostrarDia && ` · ${DIA_CORTO[sesion.dia]}`}
          </span>

          {enCurso && (
            <span className="sesion-en-vivo">
              <span className="ping-vivo" aria-hidden>
                <span className="ping-nucleo" />
              </span>
              EN VIVO
            </span>
          )}
        </div>

        <Link href={`/sesion/${sesion.id}/`} className="sesion-titulo">
          {sesion.titulo}
          {sesion.truncado && (
            <span className="cortado" title="El título viene cortado en la agenda oficial">
              {" "}
              […]
            </span>
          )}
        </Link>

        {/* Ponente / Persona */}
        {(sesion.detalle || sesion.personas.length > 0) && (
          <div className="sesion-quien">
            <IconoPersonas className="icono-ponente" />
            <span>{sesion.detalle ?? sesion.personas.join(" · ")}</span>
          </div>
        )}

        {/* Lugar y avisos */}
        <div className="sesion-donde">
          {lugar ? (
            <Link href={`/lugar/${lugar.id}/`} className={`lugar-chip encima${lugar.pin != null ? " con-pin" : " sin-pin"}`}>
              {lugar.pin != null ? (
                <span className="pin-num">{lugar.pin}</span>
              ) : (
                <span className="pin-num pin-ext" aria-label="Lugar fuera del campus">
                  <IconoMapa aria-hidden />
                </span>
              )}
              <span className="lugar-nombre">{lugar.nombre}</span>
              {lugar.fuera && <span className="marca-aviso">{lugar.fuera.ciudad}</span>}
            </Link>
          ) : (
            <span className="lugar-chip sin-pin">
              <span className="pin-num pin-ext" aria-label="Lugar">
                <IconoMapa aria-hidden />
              </span>
              <span className="lugar-nombre">{sesion.lugarTexto}</span>
            </span>
          )}

          {choca && (
            <span className="marca-aviso choque encima">
              <IconoChoque />
              se pisa
            </span>
          )}
        </div>
      </div>

      {/* Barra de progreso si está en curso */}
      {enCurso && (
        <div className="sesion-avance">
          <div
            className="pista"
            role="progressbar"
            aria-valuenow={Math.round(avance)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso de la actividad: ${Math.round(avance)}%`}
          >
            <div className="hecho" style={{ width: `${Math.min(100, Math.max(2, avance))}%` }} />
          </div>
          <span className="queda">quedan {duracion(restante!)}</span>
        </div>
      )}

      {/* Botón Guardar en la esquina superior derecha */}
      <button
        type="button"
        className="sesion-guardar encima"
        aria-pressed={guardada}
        aria-label={guardada ? `Quitar «${sesion.titulo}» de mi agenda` : `Guardar «${sesion.titulo}» en mi agenda`}
        onClick={alGuardar}
      >
        {guardada ? <IconoGuardado /> : <IconoGuardar />}
      </button>
    </article>
  );
}
