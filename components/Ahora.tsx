"use client";

import Image from "next/image";
import Card3D from "./Card3D";
import AgendaFiltrable from "./AgendaFiltrable";
import { CIFRAS, enCurso, permanentesDe } from "@/lib/datos";
import { diaDe, diasHastaElInicio, estadoFestival, hhmm } from "@/lib/tiempo";
import { useMomento } from "./Reloj";
import { IconoLibros, IconoPersonas } from "./Iconos";

/**
 * Página principal: héroe contextual + agenda filtrable.
 *
 * Antes del festival muestra la cuenta atrás y las cifras; durante, el estado
 * en vivo. En ambos casos el componente `AgendaFiltrable` va debajo, abriendo
 * en el día que toque. De este modo se elimina la pestaña «Ahora» como entidad
 * separada y todo vive en una sola pantalla.
 */
export default function Ahora() {
  const momento = useMomento();

  /* --------------------------------------------------------- sin hora ---- */

  if (!momento) {
    return (
      <div className="pagina">
        <section className="heroe heroe-esqueleto" aria-hidden>
          <span className="esq esq-hora" />
          <span className="esq esq-linea" />
          <span className="esq esq-linea corta" />
        </section>
        <div className="esqueleto-lista" aria-hidden>
          <span /> <span /> <span />
        </div>
        <p className="solo-lectores">Cargando la programación en curso.</p>
      </div>
    );
  }

  const estado = estadoFestival(momento.fecha);

  /* ---------------------------------------------------- antes y después ---- */

  if (estado !== "durante") {
    const faltan = diasHastaElInicio(momento.fecha);
    const terminado = estado === "despues";

    return (
      <div className="pagina">
        <section className="heroe heroe-compacto heroe-literario">
          <div className="heroe-contenido">
            {/* Fechas y lugar */}
            <div className="heroe-editorial-header">
              <span className="heroe-editorial-fecha">21 – 25 SEPT · TULCÁN, UPEC</span>
            </div>

            {terminado ? (
              <div className="heroe-editorial-cuerpo">
                <h1 className="heroe-titular-countdown">
                  <span className="txt-evento">Hasta la próxima edición</span>
                </h1>
              </div>
            ) : faltan > 0 ? (
              <div className="contador-chevere-wrap">
                {/* Placa / Ficha de cuenta regresiva */}
                <div className="contador-placa-sello">
                  <span className="placa-kicker">FALTAN</span>
                  <span className="placa-cifra">{String(faltan).padStart(2, "0")}</span>
                  <span className="placa-unidad">{faltan === 1 ? "DÍA" : "DÍAS"}</span>
                </div>

                {/* Titular del evento */}
                <div className="contador-titular-evento">
                  <span className="contador-de">para el</span>
                  <h1 className="contador-nombre-fest">LibroFest</h1>
                </div>
              </div>
            ) : (
              <div className="heroe-editorial-cuerpo">
                <h1 className="heroe-titular-countdown">
                  <span className="txt-evento">¡El festival ha comenzado!</span>
                </h1>
              </div>
            )}

            {/* Dos únicas tarjetas de cifras: Actividades y Autores (compactas, sin textos largos) */}
            <div className="heroe-badges-literarios">
              <div className="badge-literario">
                <span className="badge-icono-caja">
                  <IconoLibros />
                </span>
                <div className="badge-texto-caja">
                  <span className="badge-cifra-num">{CIFRAS.total}</span>
                  <span className="badge-cifra-tag">actividades</span>
                </div>
              </div>

              <div className="badge-literario">
                <span className="badge-icono-caja autores">
                  <IconoPersonas />
                </span>
                <div className="badge-texto-caja">
                  <span className="badge-cifra-num">{CIFRAS.personas}</span>
                  <span className="badge-cifra-tag">autores</span>
                </div>
              </div>
            </div>
          </div>

          <div className="heroe-arte-lado" aria-hidden="true">
            <Card3D className="heroe-afiche-card-3d">
              <Image
                src="/logos/librofest.png"
                alt="Afiche UPEC Libro Fest 2026"
                width={135}
                height={207}
                className="heroe-afiche-3d-img"
                priority
              />
            </Card3D>
          </div>
        </section>

        <AgendaFiltrable />
      </div>
    );
  }

  /* --------------------------------------------------------- en festival ---- */

  const dia = diaDe(momento.fecha)!;
  const corriendo = enCurso(momento.fecha, momento.minutos);
  const permanentes = permanentesDe(momento.fecha);

  const conHorario = corriendo.filter((s) => !s.permanente);
  const abiertas = corriendo.filter((s) => s.permanente);
  const lugaresAhora = new Set(conHorario.map((s) => s.lugarId)).size;

  return (
    <div className="pagina">
      <section className="heroe heroe-en-vivo">
        <div className="heroe-fila">
          <div className="heroe-vivo-izq">
            <div className="heroe-marcas-vivo">
              <Image
                src="/logos/librofest.png"
                alt="Logo Libro Fest"
                width={36}
                height={55}
                className="heroe-vivo-logo"
              />
              <div>
                <span className="heroe-hora">{hhmm(momento.minutos)}</span>
                <p className="heroe-dia">{dia.nombre} de septiembre</p>
                <p className="heroe-lugar">Campus UPEC · Tulcán · En vivo</p>
              </div>
            </div>
          </div>

          <div className="heroe-resumen">
            <div className="resumen-dato" style={{ "--color-dato": "var(--t-cultural)" } as React.CSSProperties}>
              <span className="v">{conHorario.length}</span>
              <span className="l">en curso ahora</span>
            </div>
            <div className="resumen-dato">
              <span className="v">{lugaresAhora}</span>
              <span className="l">{lugaresAhora === 1 ? "lugar activo" : "lugares activos"}</span>
            </div>
            <div className="resumen-dato">
              <span className="v">{abiertas.length}</span>
              <span className="l">salas abiertas</span>
            </div>
          </div>
        </div>
      </section>

      <AgendaFiltrable />
    </div>
  );
}

