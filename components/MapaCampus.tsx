"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LUGARES, LUGARES_CAMPUS, LUGARES_FUERA, MAPA, PIN_13_DERECHA, porId } from "@/data/lugares";
import { enCurso, sesionesDe } from "@/lib/datos";
import { diaVisible, hhmm } from "@/lib/tiempo";
import { DIAS } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import ListaSesiones from "./ListaSesiones";
import { IconoFlecha } from "./Iconos";

export default function MapaCampus() {
  const momento = useMomento();
  const [elegido, setElegido] = useState<string | null>(null);
  const [diaElegido, setDiaElegido] = useState<string | null>(null);

  // El día se deriva del momento en lugar de fijarse en un efecto: así el primer
  // render ya trae el día correcto y los puntos encendidos, sin un fotograma de
  // parpadeo enseñando el lunes.
  const dia = diaElegido ?? (momento ? diaVisible(momento.fecha) : DIAS[0].fecha);

  const esHoy = momento?.fecha === dia;
  const minutos = momento?.minutos ?? null;

  /** Lugares con algo en marcha justo ahora: el pin se enciende. */
  const ocupados = useMemo(() => {
    if (!esHoy || minutos == null) return new Set<string>();
    return new Set(enCurso(dia, minutos).filter((s) => !s.permanente).map((s) => s.lugarId));
  }, [dia, esHoy, minutos]);

  const lugar = elegido ? porId.get(elegido) ?? null : null;

  /* El pin 14 se comparte con «Sala de presentaciones»: al tocarlo se enseñan las dos. */
  const idsDelLugar = useMemo(() => {
    if (!lugar) return [];
    return LUGARES.filter((l) => l.pin != null && l.pin === lugar.pin).map((l) => l.id);
  }, [lugar]);

  const delLugar = useMemo(() => {
    if (idsDelLugar.length === 0) return [];
    return sesionesDe(dia)
      .filter((s) => idsDelLugar.includes(s.lugarId))
      .sort((a, b) => a.inicio - b.inicio);
  }, [dia, idsDelLugar]);

  const ahoraAqui = esHoy && minutos != null ? delLugar.filter((s) => s.inicio <= minutos && s.fin > minutos) : [];
  const luegoAqui = esHoy && minutos != null ? delLugar.filter((s) => s.inicio > minutos) : delLugar;

  return (
    <div className="pagina">
      <header>
        <p className="eyebrow">Vista aérea del campus universitario</p>
        <h1 className="titulo-pagina">Mapa</h1>
        <p className="entradilla">
          Toca un punto para ver qué hay ahí. Los puntos encendidos tienen algo en marcha ahora mismo.
        </p>
      </header>

      <div className="tira" role="group" aria-label="Día">
        {DIAS.map((d) => (
          <button
            key={d.fecha}
            type="button"
            className="pildora"
            aria-pressed={dia === d.fecha}
            onClick={() => setDiaElegido(d.fecha)}
          >
            {d.corto}
          </button>
        ))}
      </div>

      <div className="mapa-marco">
        {/* Imagen del mapa oficial de la UPEC; los puntos van encima en porcentajes. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MAPA.src}
          alt="Vista aérea del campus de la UPEC con los quince puntos del festival señalados"
          width={MAPA.ancho}
          height={MAPA.alto}
        />

        {LUGARES_CAMPUS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`pin${ocupados.has(l.id) || (l.pin === 14 && ocupados.has("sala-presentaciones")) ? " ocupado" : ""}${elegido === l.id ? " activo" : ""}`}
            style={{ left: `${l.x}%`, top: `${l.y}%` }}
            onClick={() => setElegido(elegido === l.id ? null : l.id)}
            aria-pressed={elegido === l.id}
            aria-label={`Punto ${l.pin}: ${l.nombre}. ${l.descripcion}`}
          >
            <span aria-hidden>{l.pin}</span>
          </button>
        ))}

        {/* El mapa oficial repite el punto 13 al otro lado del campus. */}
        <button
          type="button"
          className={`pin${elegido === "parqueadero-antisana" ? " activo" : ""}`}
          style={{ left: `${PIN_13_DERECHA.x}%`, top: `${PIN_13_DERECHA.y}%` }}
          onClick={() => setElegido(elegido === "parqueadero-antisana" ? null : "parqueadero-antisana")}
          aria-label="Punto 13: Parqueadero Calle Antisana, lado este"
        >
          <span aria-hidden>13</span>
        </button>
      </div>

      {!lugar && (
        <div className="leyenda">
          {LUGARES_CAMPUS.map((l) => (
            <button key={l.id} type="button" className="leyenda-fila" onClick={() => setElegido(l.id)}>
              <span className="chip chip-pin">{l.pin}</span>
              <span className="leyenda-texto">
                <span className="n">{l.nombre}</span>
                <span className="d">{l.descripcion}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {lugar && (
        <section className="bloque">
          <div className="bloque-cabecera">
            <h2>
              {lugar.pin != null && <span className="chip chip-pin">{lugar.pin}</span>} {lugar.nombre}
            </h2>
            <button type="button" className="boton" onClick={() => setElegido(null)}>
              Ver todos los puntos
            </button>
          </div>
          <p className="entradilla" style={{ marginTop: 0 }}>
            {lugar.descripcion}
          </p>

          {ahoraAqui.length > 0 && (
            <>
              <h3 className="grupo-hora">Ahora mismo aquí</h3>
              <ListaSesiones sesiones={ahoraAqui} relativo />
            </>
          )}

          <h3 className="grupo-hora">{esHoy && ahoraAqui.length > 0 ? "Después" : "Programa del día"}</h3>
          <ListaSesiones
            sesiones={luegoAqui}
            vacio={`No hay nada programado aquí el ${DIAS.find((d) => d.fecha === dia)?.nombre.toLowerCase()}.`}
          />

          <Link href={`/lugar/${lugar.id}/`} className="boton" style={{ alignSelf: "flex-start" }}>
            Ver los cinco días de este lugar
            <IconoFlecha aria-hidden />
          </Link>
        </section>
      )}

      <section className="bloque">
        <div className="bloque-cabecera">
          <h2>Fuera del campus</h2>
          <span className="cuenta">{LUGARES_FUERA.length} sedes</span>
        </div>
        <p className="entradilla" style={{ marginTop: 0 }}>
          El festival es binacional: dos sedes están al otro lado de la frontera y no aparecen en el
          mapa del campus.
        </p>
        <div className="lista">
          {LUGARES_FUERA.map((l) => {
            const cuantas = sesionesDe(dia, false).filter((s) => s.lugarId === l.id);
            return (
              <div className="fila" key={l.id} style={{ gridTemplateColumns: "1fr" }}>
                <div className="fila-cuerpo">
                  <Link href={`/lugar/${l.id}/`} className="fila-titulo">
                    {l.nombre}
                  </Link>
                  <p className="fila-detalle">{l.descripcion}</p>
                  <div className="fila-meta">
                    <span className="chip chip-aviso">
                      {l.fuera!.ciudad}, {l.fuera!.pais}
                    </span>
                    <span>
                      {cuantas.length === 0
                        ? "sin programación este día"
                        : `${cuantas.length} ${cuantas.length === 1 ? "sesión" : "sesiones"} · ${cuantas
                            .map((s) => hhmm(s.inicio))
                            .join(", ")}`}
                    </span>
                    <a href={l.fuera!.maps} target="_blank" rel="noreferrer">
                      Google Maps
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
