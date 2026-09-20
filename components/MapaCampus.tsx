"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LUGARES, LUGARES_CAMPUS, LUGARES_FUERA, MAPA, PIN_13_DERECHA, porId } from "@/data/lugares";
import { CUENTA_POR_LUGAR, EDITORIALES, enCurso, sesionesDe } from "@/lib/datos";
import { diaVisible, hhmm } from "@/lib/tiempo";
import { DIAS } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import ListaSesiones from "./ListaSesiones";
import TiraDias from "./TiraDias";
import { IconoCerrar, IconoFlecha, IconoLupaMas, IconoMapa } from "./Iconos";

const ZOOMS = [1, 1.8, 2.6];

export default function MapaCampus() {
  const momento = useMomento();
  const [elegido, setElegido] = useState<string | null>(null);
  const [diaElegido, setDiaElegido] = useState<string | null>(null);
  const [nivelZoom, setNivelZoom] = useState(0);
  const [ampliado, setAmpliado] = useState(false);
  const [filtroEditorial, setFiltroEditorial] = useState("");
  const ventana = useRef<HTMLDivElement>(null);

  const editorialesVisibles = useMemo(() => {
    if (!filtroEditorial.trim()) return EDITORIALES;
    const q = filtroEditorial.toLowerCase().trim();
    return EDITORIALES.filter((e) => e.toLowerCase().includes(q));
  }, [filtroEditorial]);

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

  /* Centrar el zoom en el punto elegido: acercar y que el sitio que te interesa
     se quede fuera de la ventana sería peor que no acercar. */
  const centrarEn = useCallback((x: number, y: number) => {
    const v = ventana.current;
    if (!v) return;
    const lienzo = v.firstElementChild as HTMLElement | null;
    if (!lienzo) return;
    v.scrollTo({
      left: (lienzo.offsetWidth * x) / 100 - v.clientWidth / 2,
      top: (lienzo.offsetHeight * y) / 100 - v.clientHeight / 2,
      behavior: "smooth",
    });
  }, []);

  function alternarZoom() {
    const siguiente = (nivelZoom + 1) % ZOOMS.length;
    setNivelZoom(siguiente);
    if (siguiente > 0 && lugar?.x != null && lugar.y != null) {
      window.setTimeout(() => centrarEn(lugar.x!, lugar.y!), 60);
    }
  }

  function elegirLugar(id: string) {
    setElegido((previo) => (previo === id ? null : id));
  }

  useEffect(() => {
    if (!ampliado) return;
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setAmpliado(false);
    window.addEventListener("keydown", escape);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", escape);
      document.body.style.overflow = overflow;
    };
  }, [ampliado]);

  const zoom = ZOOMS[nivelZoom];

  const mapa = (
    <div className={ampliado ? "mapa-ventana ampliado" : "mapa-ventana"} ref={ventana}>
      <div className="mapa-lienzo" style={{ width: `${zoom * 100}%` }}>
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
            onClick={() => elegirLugar(l.id)}
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
          onClick={() => elegirLugar("parqueadero-antisana")}
          aria-pressed={elegido === "parqueadero-antisana"}
          aria-label="Punto 13: Parqueadero Calle Antisana, lado este"
        >
          <span aria-hidden>13</span>
        </button>
      </div>

      <div className="mapa-controles">
        <button
          type="button"
          className="boton-mapa"
          onClick={alternarZoom}
          aria-label={nivelZoom === ZOOMS.length - 1 ? "Alejar el mapa" : "Acercar el mapa"}
        >
          <IconoLupaMas aria-hidden />
          <span>{zoom === 1 ? "Acercar" : `${zoom}×`}</span>
        </button>
        <button
          type="button"
          className="boton-mapa"
          onClick={() => setAmpliado((v) => !v)}
          aria-label={ampliado ? "Cerrar el mapa ampliado" : "Ver el mapa a pantalla completa"}
        >
          {ampliado ? <IconoCerrar aria-hidden /> : <IconoMapa aria-hidden />}
          <span>{ampliado ? "Cerrar" : "Ampliar"}</span>
        </button>
      </div>
    </div>
  );

  /* La ficha del punto va en una hoja por encima del mapa. Antes se insertaba
     debajo de la imagen: tocabas un pin y, desde el móvil, no pasaba nada visible. */
  const hoja = lugar && (
    <div className="hoja-mapa" role="dialog" aria-label={lugar.nombre}>
      <div className="hoja-mapa-tirador" aria-hidden />

      <div className="hoja-mapa-cabecera">
        <h2>
          {lugar.pin != null && <span className="pin-num">{lugar.pin}</span>}
          {lugar.nombre}
        </h2>
        <button type="button" className="boton-icono oscuro" onClick={() => setElegido(null)} aria-label="Cerrar">
          <IconoCerrar aria-hidden />
        </button>
      </div>

      <p className="hoja-mapa-desc">{lugar.descripcion}</p>

      <div className="hoja-mapa-cuerpo">
        {ahoraAqui.length > 0 && (
          <>
            <div className="hora-marca">
              <h3 className="h">Ahora mismo aquí</h3>
              <span className="raya" />
            </div>
            <ListaSesiones sesiones={ahoraAqui} relativo />
          </>
        )}

        <div className="hora-marca">
          <h3 className="h">{esHoy && ahoraAqui.length > 0 ? "Después" : "Programa del día"}</h3>
          <span className="raya" />
        </div>
        <ListaSesiones
          sesiones={luegoAqui}
          vacio={`Nada programado aquí el ${DIAS.find((d) => d.fecha === dia)?.nombre.toLowerCase()}.`}
        />

        <Link href={`/lugar/${lugar.id}/`} className="boton" style={{ alignSelf: "flex-start" }}>
          Ver los cinco días
          <IconoFlecha aria-hidden />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="pagina pagina-mapa">
      <header>
        <h1 className="titulo-pagina">Mapa</h1>
      </header>

      <TiraDias dia={dia} hoy={momento?.fecha ?? null} onElegir={setDiaElegido} />

      {mapa}

      {/* La leyenda no desaparece al elegir un punto: comparar dos sitios sin
          tener que deseleccionar es justo lo que se hace aquí. */}
      <div className="leyenda">
        {LUGARES_CAMPUS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={elegido === l.id ? "leyenda-fila activa" : "leyenda-fila"}
            aria-pressed={elegido === l.id}
            onClick={() => elegirLugar(l.id)}
          >
            <span className={ocupados.has(l.id) ? "pin-num vivo" : "pin-num"}>{l.pin}</span>
            <span className="leyenda-texto">
              <span className="n">{l.nombre}</span>
              <span className="d">{l.descripcion}</span>
            </span>
            <span className="cuantas">{CUENTA_POR_LUGAR[l.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <section className="bloque">
        <div className="bloque-cabecera">
          <h2>Fuera del campus</h2>
          <span className="cuenta">{LUGARES_FUERA.length}</span>
        </div>
        <div className="fuera-lista">
          {LUGARES_FUERA.map((l) => {
            const cuantas = sesionesDe(dia, false).filter((s) => s.lugarId === l.id);
            return (
              <div className="fuera-fila" key={l.id}>
                <Link href={`/lugar/${l.id}/`} className="fuera-titulo">
                  {l.nombre}
                </Link>
                <p className="fuera-desc">{l.descripcion}</p>
                <div className="fuera-pie">
                  <span className="marca-aviso">
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
            );
          })}
        </div>
      </section>

      <section className="bloque" id="editoriales">
        <div className="bloque-cabecera">
          <h2>Editoriales y librerías presentes</h2>
          <span className="cuenta">{EDITORIALES.length}</span>
        </div>
        <p className="pistas" style={{ margin: "0 0 14px 0" }}>
          Presentes en la muestra editorial del <strong>Centro de Convenciones</strong> (Salón principal) durante los cinco días del festival.
        </p>
        <div style={{ marginBottom: "14px" }}>
          <input
            type="search"
            value={filtroEditorial}
            onChange={(e) => setFiltroEditorial(e.target.value)}
            placeholder="Buscar editorial o librería..."
            aria-label="Buscar editorial o librería"
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "0.9rem",
              borderRadius: "10px",
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--ink)",
              outline: "none",
            }}
          />
        </div>
        {editorialesVisibles.length === 0 ? (
          <p className="vacio" style={{ margin: "16px 0", color: "var(--muted)", fontStyle: "italic" }}>
            No se encontraron editoriales o librerías con &ldquo;{filtroEditorial}&rdquo;.
          </p>
        ) : (
          <ol className="editoriales">
            {editorialesVisibles.map((nombre) => {
              const numOriginal = EDITORIALES.indexOf(nombre) + 1;
              return (
                <li key={nombre}>
                  <span className="num" aria-hidden="true">{numOriginal}</span>
                  <span>{nombre}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {hoja}
    </div>
  );
}
