"use client";

import Image from "next/image";
import { aContinuacion, enCurso, sesionesDe } from "@/lib/datos";
import { porId as lugarPorId } from "@/data/lugares";
import { diaDe, diasHastaElInicio, duracion, estadoFestival, hhmm } from "@/lib/tiempo";
import { DIAS, type Sesion } from "@/lib/tipos";
import { useMomento } from "./Reloj";

/**
 * Modo pantalla: para el televisor de la entrada o del centro de convenciones.
 *
 * Sin navegación, sin botones y con letra grande, pensado para leerse a tres metros.
 * Es lo más barato de construir de todo el proyecto y lo que hace que la Universidad
 * note que existe.
 */

function Item({ sesion, minutos }: { sesion: Sesion; minutos: number }) {
  const lugar = lugarPorId.get(sesion.lugarId);
  const enMarcha = sesion.inicio <= minutos;
  const falta = enMarcha ? sesion.fin - minutos : sesion.inicio - minutos;

  return (
    <div
      className="pantalla-item"
      style={
        {
          "--color-tipo": `var(--t-${sesion.tipo})`,
        } as React.CSSProperties
      }
    >
      <span className="h">{hhmm(sesion.inicio)}</span>
      <span>
        <span className="t">{sesion.titulo}</span>
        <span className="l">
          {lugar ? (
            <>
              {lugar.pin != null && `${lugar.pin} · `}
              {lugar.nombre}
              {lugar.fuera && ` · ${lugar.fuera.ciudad}`}
            </>
          ) : (
            sesion.lugarTexto
          )}
          {" — "}
          {enMarcha ? `quedan ${duracion(falta)}` : `empieza en ${duracion(falta)}`}
        </span>
      </span>
    </div>
  );
}

export default function Pantalla() {
  const momento = useMomento();

  if (!momento) {
    return (
      <div className="pantalla">
        <div className="pantalla-cabecera">
          <div className="pantalla-logos-lado">
            <Image
              src="/logos/upec.png"
              alt="UPEC"
              width={120}
              height={46}
              className="pantalla-logo-upec"
            />
            <div className="pantalla-divisor-logos" aria-hidden="true" />
            <Image
              src="/logos/ulif.png"
              alt="ULIF'26"
              width={126}
              height={48}
              className="pantalla-logo-ulif"
            />
          </div>
          <div className="pantalla-cabecera-info">
            <p className="eyebrow">Universidad Politécnica Estatal del Carchi</p>
            <h1>UPEC Libro Fest 2026</h1>
          </div>
          <span className="pantalla-reloj">--:--</span>
        </div>
        <p className="entradilla">Del 21 al 25 de septiembre · Academia, arte y cultura</p>
      </div>
    );
  }

  const estado = estadoFestival(momento.fecha);

  if (estado !== "durante") {
    const faltan = diasHastaElInicio(momento.fecha);
    return (
      <div className="pantalla">
        <div className="pantalla-cabecera">
          <div className="pantalla-logos-lado">
            <Image
              src="/logos/upec.png"
              alt="UPEC"
              width={120}
              height={46}
              className="pantalla-logo-upec"
            />
            <div className="pantalla-divisor-logos" aria-hidden="true" />
            <Image
              src="/logos/ulif.png"
              alt="ULIF'26"
              width={126}
              height={48}
              className="pantalla-logo-ulif"
            />
          </div>
          <div className="pantalla-cabecera-info">
            <p className="eyebrow">Universidad Politécnica Estatal del Carchi</p>
            <h1>UPEC Libro Fest 2026</h1>
          </div>
          <span className="pantalla-reloj">{hhmm(momento.minutos)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.4vh", marginTop: "6vh" }}>
          <p className="eyebrow">Academia, arte y cultura</p>
          <p style={{ fontSize: "clamp(1.4rem, 3.4vw, 2.8rem)", fontFamily: "var(--display)", lineHeight: 1.2 }}>
            {estado === "antes"
              ? faltan === 0
                ? "Empieza mañana"
                : `Faltan ${faltan} ${faltan === 1 ? "día" : "días"}`
              : "Gracias por venir"}
          </p>
          <p style={{ color: "var(--muted)", fontSize: "clamp(0.95rem, 1.6vw, 1.4rem)" }}>
            Del 21 al 25 de septiembre · 188 actividades en 17 lugares del campus
          </p>
        </div>
      </div>
    );
  }

  const dia = diaDe(momento.fecha)!;
  const corriendo = enCurso(momento.fecha, momento.minutos).filter((s) => !s.permanente);
  const siguientes = aContinuacion(momento.fecha, momento.minutos, 180);
  const abiertas = enCurso(momento.fecha, momento.minutos).filter((s) => s.permanente);
  const resto = sesionesDe(momento.fecha, false).filter((s) => s.inicio > momento.minutos);

  return (
    <div className="pantalla">
      <div className="pantalla-cabecera">
        <div className="pantalla-logos-lado">
          <Image
            src="/logos/upec.png"
            alt="UPEC"
            width={120}
            height={46}
            className="pantalla-logo-upec"
          />
          <div className="pantalla-divisor-logos" aria-hidden="true" />
          <Image
            src="/logos/ulif.png"
            alt="ULIF'26"
            width={126}
            height={48}
            className="pantalla-logo-ulif"
          />
        </div>
        <div className="pantalla-cabecera-info">
          <p className="eyebrow">UPEC Libro Fest 2026 · {DIAS.length} días · Academia, arte y cultura</p>
          <h1>{dia.nombre} de septiembre</h1>
        </div>
        <span className="pantalla-reloj">{hhmm(momento.minutos)}</span>
      </div>

      <div className="pantalla-cols">
        <div className="pantalla-col">
          <h2>En curso · {corriendo.length}</h2>
          {corriendo.length > 0 ? (
            corriendo.slice(0, 7).map((s) => <Item key={s.id} sesion={s} minutos={momento.minutos} />)
          ) : (
            <p style={{ color: "var(--muted)" }}>
              {resto.length > 0
                ? `Nada con horario ahora mismo. Lo siguiente empieza a las ${hhmm(resto[0].inicio)}.`
                : "Se acabó la programación con horario de hoy."}
            </p>
          )}
        </div>

        <div className="pantalla-col">
          <h2>A continuación</h2>
          {siguientes.length > 0 ? (
            siguientes.slice(0, 7).map((s) => <Item key={s.id} sesion={s} minutos={momento.minutos} />)
          ) : (
            <p style={{ color: "var(--muted)" }}>Sin más sesiones programadas hoy.</p>
          )}
        </div>
      </div>

      <p style={{ color: "var(--muted)", fontSize: "clamp(0.78rem, 1.1vw, 1.05rem)", borderTop: "1px solid var(--line)", paddingTop: "1.2vh" }}>
        {abiertas.length} salas, muestras y exposiciones abiertas todo el día · programa completo y
        mapa del campus en el sitio del festival
      </p>
    </div>
  );
}
