"use client";

import Link from "next/link";
import { aContinuacion, CIFRAS, enCurso, permanentesDe, sesionesDe } from "@/lib/datos";
import { diaDe, diasHastaElInicio, estadoFestival, hhmm } from "@/lib/tiempo";
import { DIAS } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import ListaSesiones from "./ListaSesiones";
import { IconoAgenda, IconoFlecha, IconoMapa, IconoPermanente } from "./Iconos";

/**
 * «Ahora mismo»: lo que está pasando y lo que arranca enseguida.
 *
 * Mientras `momento` es `null` —el HTML estático, antes de que el navegador
 * hidrate— se enseña un esqueleto neutro. Antes se enseñaba la portada de «faltan
 * N días», que durante el festival es contenido equivocado: la página pintaba una
 * cuenta atrás y saltaba a la vista en vivo un instante después, en cada carga y
 * para todo el mundo. Un esqueleto no dice nada falso.
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
    const primerDia = DIAS[0];
    const faltan = diasHastaElInicio(momento.fecha);
    const terminado = estado === "despues";
    const muestra = sesionesDe(primerDia.fecha, false).slice(0, 5);

    return (
      <div className="pagina">
        <section className="heroe">
          <p className="eyebrow">Del 21 al 25 de septiembre · UPEC, Tulcán</p>

          {terminado ? (
            <h1 className="titulo-pagina">Hasta la próxima edición</h1>
          ) : faltan > 0 ? (
            <div className="cuenta-atras">
              <span className="n">{faltan}</span>
              <span className="u">{faltan === 1 ? "día para el festival" : "días para el festival"}</span>
            </div>
          ) : (
            <h1 className="titulo-pagina">Empieza hoy</h1>
          )}

          <p className="entradilla" style={{ marginTop: 0 }}>
            {terminado
              ? "El programa completo sigue aquí, por si buscas un libro, un autor o una charla a la que asististe."
              : "Cuando arranque, esta pantalla enseñará qué está pasando en ese momento y en qué edificio."}
          </p>

          <div className="heroe-resumen">
            <div className="resumen-dato">
              <span className="v">{CIFRAS.total}</span>
              <span className="l">actividades</span>
            </div>
            <div className="resumen-dato">
              <span className="v">{CIFRAS.lugares}</span>
              <span className="l">lugares</span>
            </div>
            <div className="resumen-dato">
              <span className="v">{CIFRAS.personas}</span>
              <span className="l">ponentes y autores</span>
            </div>
          </div>

          <div className="botonera">
            <Link href="/agenda/" className="boton primario">
              <IconoAgenda />
              Ver la agenda
              <IconoFlecha />
            </Link>
            <Link href="/mapa/" className="boton">
              <IconoMapa />
              Mapa del campus
            </Link>
          </div>
        </section>

        <section className="bloque">
          <div className="bloque-cabecera">
            <h2>{terminado ? "Así empezó" : "Así arranca"} el lunes</h2>
            <span className="cuenta">{sesionesDe(primerDia.fecha, false).length}</span>
          </div>
          <ListaSesiones sesiones={muestra} />
          <Link href="/agenda/" className="boton" style={{ alignSelf: "flex-start" }}>
            Ver el lunes completo
            <IconoFlecha />
          </Link>
        </section>
      </div>
    );
  }

  /* --------------------------------------------------------- en festival ---- */

  const dia = diaDe(momento.fecha)!;
  const corriendo = enCurso(momento.fecha, momento.minutos);
  const siguientes = aContinuacion(momento.fecha, momento.minutos, 120);
  const permanentes = permanentesDe(momento.fecha);

  const conHorario = corriendo.filter((s) => !s.permanente);
  const abiertas = corriendo.filter((s) => s.permanente);
  const restoDelDia = sesionesDe(momento.fecha, false).filter((s) => s.inicio > momento.minutos);
  const lugaresAhora = new Set(conHorario.map((s) => s.lugarId)).size;

  return (
    <div className="pagina">
      <section className="heroe">
        <div className="heroe-fila">
          <div>
            <span className="heroe-hora">{hhmm(momento.minutos)}</span>
            <p className="heroe-dia">{dia.nombre} de septiembre</p>
            <p className="heroe-lugar">Campus UPEC · Tulcán</p>
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

      <section className="bloque">
        <div className="bloque-cabecera">
          <h2>En curso</h2>
          {conHorario.length > 0 && <span className="cuenta">{conHorario.length}</span>}
        </div>
        <ListaSesiones
          sesiones={conHorario}
          relativo
          vacio="Ninguna sesión con horario en este momento. Mira lo que viene a continuación."
        />
      </section>

      <section className="bloque">
        <div className="bloque-cabecera">
          <h2>A continuación</h2>
          <span className="cuenta">{siguientes.length}</span>
        </div>
        <ListaSesiones
          sesiones={siguientes}
          relativo
          vacio={
            restoDelDia.length > 0
              ? `Nada en las próximas dos horas. Lo siguiente empieza a las ${hhmm(restoDelDia[0].inicio)}.`
              : "Se acabó la programación con horario de hoy."
          }
        />
      </section>

      {restoDelDia.length > siguientes.length && (
        <Link href={`/agenda/?dia=${momento.fecha}`} className="boton" style={{ alignSelf: "flex-start" }}>
          <IconoAgenda />
          Resto del {dia.nombre.toLowerCase()} · {restoDelDia.length} sesiones
          <IconoFlecha />
        </Link>
      )}

      {abiertas.length > 0 && (
        <section className="bloque">
          <div className="bloque-cabecera">
            <h2>
              <IconoPermanente style={{ width: 19, height: 19, color: "var(--t-permanente)" }} />
              Abierto todo el día
            </h2>
            <span className="cuenta">
              {abiertas.length} de {permanentes.length}
            </span>
          </div>
          <ListaSesiones sesiones={abiertas} />
        </section>
      )}
    </div>
  );
}
