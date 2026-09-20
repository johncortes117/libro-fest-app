"use client";

import { Fragment } from "react";
import Image from "next/image";
import Card3D from "./Card3D";
import AgendaFiltrable from "./AgendaFiltrable";
import BotonNova from "./BotonNova";
import { CIFRAS, SESIONES, enCurso, permanentesDe } from "@/lib/datos";
import { diaDe, diasHastaElInicio, estadoFestival } from "@/lib/tiempo";
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
import { type TipoSesion } from "@/lib/tipos";

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
 * la cuenta atrás, y durante el festival con el resumen de actividades en vivo
 * por tipo que tengan al menos una sesión activa). Incluye acceso directo a Nova.
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
                {/* Placa / Ficha de cuenta regresiva con anillas de calendario */}
                <div className="contador-placa-sello">
                  <span className="calendario-anillas" aria-hidden="true">
                    <span className="anilla a1" />
                    <span className="anilla a2" />
                  </span>
                  <span className="placa-kicker">{faltan === 1 ? "FALTA" : "FALTAN"}</span>
                  <span className="placa-cifra">{String(faltan).padStart(2, "0")}</span>
                  <span className="placa-unidad">{faltan === 1 ? "DÍA" : "DÍAS"}</span>
                </div>

                {/* Titular del evento */}
                <div className="contador-titular-evento">
                  <span className="contador-de">para el</span>
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

        <AgendaFiltrable />
      </div>
    );
  }

  /* --------------------------------------------------------- en festival ---- */

  const dia = diaDe(momento.fecha)!;
  const delDia = SESIONES.filter((s) => s.dia === dia.fecha);

  /* Resumen de las actividades programadas para hoy por tipo */
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
          {/* Cabecera editorial */}
          <div className="heroe-editorial-header">
            <span className="heroe-editorial-fecha">
              {dia.nombre.toUpperCase()} DE SEPTIEMBRE · CAMPUS UPEC
            </span>
          </div>


          {/* Badges de resumen en vivo + Acceso a Nova: flujo compacto que no se estira */}
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
                        <span className="tag-hoy-prefijo">Hoy: </span>
                        <span className="tag-desktop">{etiqueta}</span>
                        <span className="tag-mobile">{etiquetaCorta}</span>
                      </span>
                    </div>
                  </div>

                  {/* Salto de línea estructurado si hay 4 tipos para que queden 3 arriba y el 4to abajo con Nova */}
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

      <AgendaFiltrable />
    </div>
  );
}
