"use client";

import Link from "next/link";
import { aContinuacion, CIFRAS, enCurso, permanentesDe, sesionesDe } from "@/lib/datos";
import { diaDe, diasHastaElInicio, estadoFestival, hhmm } from "@/lib/tiempo";
import { DIAS } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import ListaSesiones from "./ListaSesiones";
import { IconoAgenda, IconoFlecha } from "./Iconos";

/**
 * «Ahora mismo»: lo que está pasando y lo que arranca enseguida.
 *
 * Mientras `momento` es `null` —es decir, en el HTML estático, antes de que el
 * navegador hidrate— se enseña la versión de antes del festival con el programa del
 * primer día. Es un estado real y útil, no un esqueleto cargando, y evita cocer la
 * fecha de compilación dentro del HTML.
 */
export default function Ahora() {
  const momento = useMomento();
  const estado = momento ? estadoFestival(momento.fecha) : "antes";

  /* ---------------------------------------------------- antes y después ---- */

  if (estado !== "durante" || !momento) {
    const primerDia = DIAS[0];
    const faltan = momento ? diasHastaElInicio(momento.fecha) : null;
    const terminado = estado === "despues";
    const muestra = sesionesDe(primerDia.fecha, false).slice(0, 6);

    return (
      <div className="pagina">
        <header>
          <p className="eyebrow">Del 21 al 25 de septiembre · Tulcán, Carchi</p>
          <h1 className="titulo-pagina">
            {terminado ? "Hasta la próxima edición" : "Qué hay ahora y dónde"}
          </h1>
          <p className="entradilla">
            {terminado ? (
              <>
                El UPEC Libro Fest 2026 ya terminó. El programa completo sigue disponible por si
                buscas un libro, un autor o una charla a la que asististe.
              </>
            ) : (
              <>
                Cuando arranque el festival, esta pantalla enseñará lo que está pasando en ese
                momento y en qué edificio del campus. Mientras tanto, puedes ir armando tu agenda.
              </>
            )}
          </p>
        </header>

        {!terminado && faltan !== null && faltan > 0 && (
          <p className="aviso">
            <span className="etiqueta">Faltan</span>
            <span>
              <strong>{faltan === 1 ? "un día" : `${faltan} días`}</strong> para el arranque. Guarda
              desde ya las sesiones que te interesan: la aplicación te avisa si dos se pisan.
            </span>
          </p>
        )}

        <div className="cifras">
          <div className="cifra">
            <span className="v">{CIFRAS.total}</span>
            <span className="l">actividades</span>
          </div>
          <div className="cifra">
            <span className="v">{CIFRAS.lugares}</span>
            <span className="l">lugares</span>
          </div>
          <div className="cifra">
            <span className="v">{CIFRAS.personas}</span>
            <span className="l">ponentes y autores</span>
          </div>
          <div className="cifra">
            <span className="v">{CIFRAS.editoriales}</span>
            <span className="l">editoriales</span>
          </div>
        </div>

        <section className="bloque">
          <div className="bloque-cabecera">
            <h2>{terminado ? "Así empezó" : "Así arranca"} el {primerDia.nombre.toLowerCase()}</h2>
            <span className="cuenta">primeras {muestra.length} de {sesionesDe(primerDia.fecha, false).length}</span>
          </div>
          <ListaSesiones sesiones={muestra} />
          <Link href="/agenda/" className="boton primario" style={{ alignSelf: "flex-start" }}>
            <IconoAgenda aria-hidden />
            Ver la agenda completa
            <IconoFlecha aria-hidden />
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

  return (
    <div className="pagina">
      <header>
        <p className="eyebrow">
          {dia.nombre} · {hhmm(momento.minutos)} en Tulcán
        </p>
        <h1 className="titulo-pagina">Ahora mismo</h1>
        <p className="entradilla">
          {conHorario.length > 0
            ? `${conHorario.length} ${conHorario.length === 1 ? "sesión en curso" : "sesiones en curso"}, ordenadas por lo que les queda. ${abiertas.length} salas y muestras abiertas todo el día.`
            : `Ninguna sesión con horario ahora mismo, pero hay ${abiertas.length} salas y muestras abiertas.`}
        </p>
      </header>

      <section className="bloque">
        <div className="bloque-cabecera">
          <h2>En curso</h2>
          {conHorario.length > 0 && <span className="cuenta">{conHorario.length}</span>}
        </div>
        <ListaSesiones
          sesiones={conHorario}
          relativo
          vacio="No hay sesiones con horario en este momento. Mira lo que viene a continuación."
        />
      </section>

      <section className="bloque">
        <div className="bloque-cabecera">
          <h2>A continuación</h2>
          <span className="cuenta">próximas dos horas</span>
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

      {abiertas.length > 0 && (
        <section className="bloque">
          <div className="bloque-cabecera">
            <h2>Abierto todo el día</h2>
            <span className="cuenta">
              {abiertas.length} de {permanentes.length}
            </span>
          </div>
          <ListaSesiones sesiones={abiertas} />
          <p className="nota">
            <span>
              Las salas, muestras y exposiciones permanentes abren a las 08:30. La agenda oficial no
              dice a qué hora cierran: mostramos las 18:00 como estimación.
            </span>
          </p>
        </section>
      )}

      {restoDelDia.length > siguientes.length && (
        <Link href={`/agenda/?dia=${momento.fecha}`} className="boton" style={{ alignSelf: "flex-start" }}>
          <IconoAgenda aria-hidden />
          Ver el resto del {dia.nombre.toLowerCase()} ({restoDelDia.length} sesiones)
          <IconoFlecha aria-hidden />
        </Link>
      )}

      {corriendo.length > 0 && (
        <p className="nota">
          <span>
            El festival llega a programar ocho sesiones en paralelo en ocho lugares distintos. Si dos
            te interesan a la vez, guárdalas: en{" "}
            <Link href="/mi-agenda/" style={{ textDecoration: "underline" }}>
              Mi agenda
            </Link>{" "}
            verás cuántos minutos se pisan.
          </span>
        </p>
      )}
    </div>
  );
}
