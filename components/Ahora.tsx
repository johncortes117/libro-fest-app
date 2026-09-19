"use client";

import Image from "next/image";
import Card3D from "./Card3D";
import AgendaFiltrable from "./AgendaFiltrable";
import BotonNova from "./BotonNova";
import { CIFRAS, enCurso, permanentesDe } from "@/lib/datos";
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

const ETIQUETA_TIPO: Record<TipoSesion, { sing: string; plur: string }> = {
  conferencia: { sing: "Conferencia", plur: "Conferencias" },
  taller: { sing: "Taller", plur: "Talleres" },
  cultural: { sing: "Cultural", plur: "Culturales" },
  libro: { sing: "Libro", plur: "Libros" },
  permanente: { sing: "Sala", plur: "Salas abiertas" },
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

            {/* Dos únicas tarjetas de cifras: Actividades y Autores */}
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

              {/* Acceso a Nova integrado en la fila de badges */}
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
  const corriendo = enCurso(momento.fecha, momento.minutos);
  const permanentes = permanentesDe(momento.fecha);

  const conHorario = corriendo.filter((s) => !s.permanente);
  const abiertas = corriendo.filter((s) => s.permanente);

  /* Solo los tipos que tienen AL MENOS una sesión activa en este momento */
  const tiposActivos = (["conferencia", "taller", "cultural", "libro"] as TipoSesion[])
    .map((tipo) => ({
      tipo,
      count: conHorario.filter((s) => s.tipo === tipo).length,
    }))
    .filter(({ count }) => count > 0);

  return (
    <div className="pagina">
      <section className="heroe heroe-compacto heroe-literario heroe-en-vivo">
        <div className="heroe-contenido">
          {/* Cabecera editorial con badge EN VIVO */}
          <div className="heroe-editorial-header">
            <span className="badge-en-vivo-header">
              <span className="ping-vivo" aria-hidden>
                <span className="ping-nucleo" />
              </span>
              EN VIVO
            </span>
            <span className="heroe-editorial-fecha">
              {dia.nombre.toUpperCase()} DE SEPTIEMBRE · CAMPUS UPEC
            </span>
          </div>

          <div className="heroe-editorial-cuerpo">
            <h1 className="heroe-titular-vivo">
              <span className="txt-evento">
                {conHorario.length > 0
                  ? `${conHorario.length} ${conHorario.length === 1 ? "actividad en curso" : "actividades en curso"}`
                  : "Festival en marcha"}
              </span>
            </h1>
          </div>

          {/* Badges de resumen en vivo: SOLO tipos con count > 0 */}
          {tiposActivos.length > 0 ? (
            <div className="heroe-badges-literarios heroe-badges-vivo">
              {tiposActivos.map(({ tipo, count }) => {
                const Icono = ICONO_TIPO[tipo];
                const etiqueta = count === 1 ? ETIQUETA_TIPO[tipo].sing : ETIQUETA_TIPO[tipo].plur;
                return (
                  <div
                    key={tipo}
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
                      <span className="badge-cifra-tag">{etiqueta}</span>
                    </div>
                  </div>
                );
              })}

              {abiertas.length > 0 && (
                <div
                  className="badge-literario badge-tipo-vivo"
                  style={{
                    "--color-tipo": "var(--t-permanente)",
                    "--fondo-tipo": "var(--t-permanente-soft)",
                  } as React.CSSProperties}
                >
                  <span className="badge-icono-caja badge-tipo-icono">
                    <IconoPermanente />
                  </span>
                  <div className="badge-texto-caja">
                    <span className="badge-cifra-num">{abiertas.length}</span>
                    <span className="badge-cifra-tag">salas abiertas</span>
                  </div>
                </div>
              )}

              {/* Acceso a Nova integrado en la fila de badges en vivo */}
              <BotonNova />
            </div>
          ) : abiertas.length > 0 ? (
            <div className="heroe-badges-literarios heroe-badges-vivo">
              <div
                className="badge-literario badge-tipo-vivo"
                style={{
                  "--color-tipo": "var(--t-permanente)",
                  "--fondo-tipo": "var(--t-permanente-soft)",
                } as React.CSSProperties}
              >
                <span className="badge-icono-caja badge-tipo-icono">
                  <IconoPermanente />
                </span>
                <div className="badge-texto-caja">
                  <span className="badge-cifra-num">{abiertas.length}</span>
                  <span className="badge-cifra-tag">salas abiertas todo el día</span>
                </div>
              </div>

              {/* Acceso a Nova */}
              <BotonNova />
            </div>
          ) : (
            <div className="heroe-badges-literarios heroe-badges-vivo">
              <BotonNova />
            </div>
          )}

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
