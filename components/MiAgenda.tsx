"use client";

import Link from "next/link";
import { useMemo } from "react";
import { choques, sesionPorId, permanentesDe } from "@/lib/datos";
import { useGuardadas } from "@/lib/guardadas";
import { descargarIcs } from "@/lib/ics";
import { duracion, hhmm } from "@/lib/tiempo";
import { DIAS, type Sesion } from "@/lib/tipos";
import ListaSesiones from "./ListaSesiones";
import ListaChoques from "./ListaChoques";
import { IconoAgenda, IconoCalendario, IconoFlecha } from "./Iconos";

export default function MiAgenda() {
  const { ids, vaciar } = useGuardadas();

  const guardadas = useMemo(() => {
    return ids.map((id) => sesionPorId(id)).filter((s): s is Sesion => s !== null);
  }, [ids]);

  const conHorario = guardadas.filter((s) => !s.permanente);
  const permanentes = guardadas.filter((s) => s.permanente);

  const colisiones = useMemo(() => choques(guardadas), [guardadas]);
  const idsQueChocan = useMemo(() => {
    const s = new Set<string>();
    for (const c of colisiones) {
      s.add(c.a.id);
      s.add(c.b.id);
    }
    return s;
  }, [colisiones]);

  const porDia = DIAS.map((d) => ({
    dia: d,
    sesiones: conHorario.filter((s) => s.dia === d.fecha).sort((a, b) => a.inicio - b.inicio),
  })).filter((g) => g.sesiones.length > 0);

  if (guardadas.length === 0) {
    return (
      <div className="pagina">
        <header>
          <p className="eyebrow">Se guarda solo en este teléfono</p>
          <h1 className="titulo-pagina">Mi agenda</h1>
        </header>

        <p className="vacio">
          Todavía no has guardado nada. Toca el marcador de cualquier sesión y aparecerá aquí.
        </p>

        <p className="nota">
          <span>
            No hay cuentas ni contraseñas: lo que guardes vive en este navegador y no se envía a
            ningún sitio. Si cambias de teléfono o borras los datos del navegador, se pierde.
          </span>
        </p>

        <Link href="/agenda/" className="boton primario" style={{ alignSelf: "flex-start" }}>
          <IconoAgenda aria-hidden />
          Ir a la agenda
          <IconoFlecha aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="pagina">
      <header>
        <p className="eyebrow">
          {guardadas.length} {guardadas.length === 1 ? "actividad guardada" : "actividades guardadas"}
        </p>
        <h1 className="titulo-pagina">Mi agenda</h1>
      </header>

      {colisiones.length > 0 && (
        <section className="bloque">
          <p className="aviso alerta">
            <span className="etiqueta">Se pisan</span>
            <span>
              {colisiones.length === 1
                ? "Dos de tus sesiones se solapan."
                : `Hay ${colisiones.length} solapamientos entre tus sesiones.`}{" "}
              El festival programa hasta ocho cosas a la vez, así que toca elegir.
            </span>
          </p>

          <ListaChoques colisiones={colisiones} />

          <p className="nota">
            <span>
              Las salas y muestras permanentes no cuentan como choque: están abiertas de 08:30 a
              18:00 y se solaparían con todo.
            </span>
          </p>
        </section>
      )}

      <div className="botonera">
        <button
          type="button"
          className="boton primario"
          onClick={() => descargarIcs(conHorario, "mi-agenda-librofest-2026")}
          disabled={conHorario.length === 0}
        >
          <IconoCalendario aria-hidden />
          Añadir {conHorario.length} al calendario
        </button>
        <button
          type="button"
          className="boton"
          onClick={() => {
            if (window.confirm("¿Vaciar tu agenda? Se borran las " + guardadas.length + " actividades guardadas.")) {
              vaciar();
            }
          }}
        >
          Vaciar
        </button>
      </div>

      {porDia.map(({ dia, sesiones }) => (
        <section className="bloque" key={dia.fecha}>
          <div className="bloque-cabecera">
            <h2>{dia.nombre}</h2>
            <span className="cuenta">{sesiones.length}</span>
          </div>
          <ListaSesiones sesiones={sesiones} idsQueChocan={idsQueChocan} />
        </section>
      ))}

      {permanentes.length > 0 && (
        <section className="bloque">
          <div className="bloque-cabecera">
            <h2>Abierto los cinco días</h2>
            <span className="cuenta">
              {permanentes.length} de {permanentesDe(DIAS[0].fecha).length}
            </span>
          </div>
          <ListaSesiones sesiones={permanentes} />
        </section>
      )}

      <p className="nota">
        <span>
          Todo esto vive solo en este navegador. No hay cuentas, no se sube a ningún servidor y nadie
          más lo ve.
        </span>
      </p>
    </div>
  );
}
