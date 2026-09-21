"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import Card3D from "./Card3D";
import AgendaFiltrable from "./AgendaFiltrable";
import BotonNova from "./BotonNova";
import { CIFRAS, SESIONES, enCurso, permanentesDe } from "@/lib/datos";
import { diaDe, diasHastaElInicio, diaVisible, estadoFestival } from "@/lib/tiempo";
import { useMomento } from "./Reloj";
import {
  IconoConferencia,
  IconoCultural,
  IconoLibro,
  IconoLibros,
  IconoPermanente,
  IconoPersonas,
  IconoTaller,
} from "./Iconos";
import { DIAS, type TipoSesion } from "@/lib/tipos";

const ICONO_TIPO: Record<TipoSesion, (p: { className?: string }) => React.ReactElement> = {
  conferencia: IconoConferencia,
  taller: IconoTaller,
  cultural: IconoCultural,
  libro: IconoLibro,
  permanente: IconoPermanente,
};

const ETIQUETA_TIPO: Record<TipoSesion, { sing: string; plur: string; cortaSing: string; cortaPlur: string }> = {
  conferencia: { sing: "Conferencia", plur: "Conferencias", cortaSing: "Conf.", cortaPlur: "Conf." },
  taller: { sing: "Taller", plur: "Talleres", cortaSing: "Taller", cortaPlur: "Talleres" },
  cultural: { sing: "Cultural", plur: "Culturales", cortaSing: "Cultura", cortaPlur: "Cultura" },
  libro: { sing: "Libro", plur: "Libros", cortaSing: "Libro", cortaPlur: "Libros" },
  permanente: { sing: "Sala", plur: "Salas abiertas", cortaSing: "Sala", cortaPlur: "Salas" },
};

/**
 * Página principal: héroe contextual + agenda filtrable.
 *
 * Muestra el libro 3D a la derecha en ambos estados (antes del festival con
 * la cuenta atrás, y durante el festival con el resumen de actividades del día
 * por tipo sincronizado con la fecha seleccionada). Incluye acceso directo a Nova.
 */
export default function Ahora() {
  const momento = useMomento();
  const [diaElegido, setDiaElegido] = useState<string | null>(null);

  /* Leer estado inicial del día desde la URL si existe */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const d = p.get("dia");
    if (d && (d === "todos" || DIAS.some((x) => x.fecha === d))) {
      setDiaElegido(d);
    }
  }, []);

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
                {/* Placa / Ficha de cuenta regresiva con anillas de calendario */}
                <div className="contador-placa-sello">
                  <span className="calendario-anillas" aria-hidden="true">
                    <span className="anilla a1" />
                    <span className="anilla a2" />
                  </span>
                  <span className="placa-kicker">{faltan === 1 ? "FALTA" : "FALTAN"}</span>
                  <span className="placa-cifra">{String(faltan).padStart(2, "0")}</span>
                </div>

                {/* Titular del evento */}
                <div className="contador-titular-evento">
                  <span className="contador-de">
                    {faltan === 1 ? "día para el" : "días para el"}
                  </span>
                  <h1 className="contador-nombre-fest">UPEC Libro Fest 2026</h1>
                </div>
              </div>
            ) : (
              <div className="heroe-editorial-cuerpo">
                <h1 className="heroe-titular-countdown">
                  <span className="txt-evento">¡El festival ha comenzado!</span>
                </h1>
              </div>
            )}

            {/* Cifras de actividades, autores y Nova: compactos según su texto */}
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

              {/* Salto para dejar el botón de Nova solo en la segunda fila */}
              <span className="heroe-badges-salto" aria-hidden="true" />

              {/* Acceso a Nova compacto */}
              <BotonNova />
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

        <AgendaFiltrable diaElegido={diaElegido} onDiaChange={setDiaElegido} />
      </div>
    );
  }

  /* --------------------------------------------------------- en festival ---- */

  const diaActivoFecha = diaElegido ?? (momento ? diaVisible(momento.fecha) : DIAS[0].fecha);
  const esTodos = diaActivoFecha === "todos";
  const diaInfo = esTodos ? null : (DIAS.find((d) => d.fecha === diaActivoFecha) ?? DIAS[0]);
  const encabezadoDia = esTodos ? "21 – 25 DE SEPT · UPEC" : `${diaInfo!.corto.toUpperCase()} DE SEPT · UPEC`;
  const delDia = esTodos ? SESIONES : SESIONES.filter((s) => s.dia === diaActivoFecha);

  /* Resumen de las actividades programadas para el día seleccionado por tipo */
  const tiposActivos = (["conferencia", "taller", "cultural", "libro"] as TipoSesion[])
    .map((tipo) => ({
      tipo,
      count: delDia.filter((s) => s.tipo === tipo).length,
    }))
    .filter(({ count }) => count > 0);

  return (
    <div className="pagina">
      <section className="heroe heroe-compacto heroe-literario heroe-en-vivo">
        <div className="heroe-contenido">
          {/* Cabecera editorial en una sola línea */}
          <div className="heroe-editorial-header">
            <span className="heroe-editorial-fecha">
              {encabezadoDia}
            </span>
          </div>

          {/* Badges de resumen por día + Acceso a Nova: 3 por fila en móvil */}
          <div className="heroe-badges-literarios heroe-badges-vivo">
            {tiposActivos.map(({ tipo, count }, index) => {
              const Icono = ICONO_TIPO[tipo];
              const etiqueta = count === 1 ? ETIQUETA_TIPO[tipo].sing : ETIQUETA_TIPO[tipo].plur;
              const etiquetaCorta = count === 1 ? ETIQUETA_TIPO[tipo].cortaSing : ETIQUETA_TIPO[tipo].cortaPlur;
              return (
                <Fragment key={tipo}>
                  <div
                    className="badge-literario badge-tipo-vivo"
                    style={{
                      "--color-tipo": `var(--t-${tipo})`,
                      "--fondo-tipo": `var(--t-${tipo}-soft)`,
                    } as React.CSSProperties}
                  >
                    <span className="badge-icono-caja badge-tipo-icono">
                      <Icono />
                    </span>
                    <div className="badge-texto-caja">
                      <span className="badge-cifra-num">{count}</span>
                      <span className="badge-cifra-tag">
                        <span className="tag-desktop">{etiqueta}</span>
                        <span className="tag-mobile">{etiquetaCorta}</span>
                      </span>
                    </div>
                  </div>

                  {/* Salto de línea estructurado si hay más de 3 tipos para que queden 3 arriba y el resto abajo con Nova */}
                  {index === 2 && tiposActivos.length > 3 && (
                    <span className="heroe-badges-salto" aria-hidden="true" />
                  )}
                </Fragment>
              );
            })}

            {/* Acceso directo a Nova compacto */}
            <BotonNova />
          </div>
        </div>

        {/* Libro en 3D a la derecha */}
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

      <AgendaFiltrable diaElegido={diaElegido} onDiaChange={setDiaElegido} />
    </div>
  );
}
