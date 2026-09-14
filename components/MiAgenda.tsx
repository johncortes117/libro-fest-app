"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { choques, sesionPorId } from "@/lib/datos";
import { useGuardadas } from "@/lib/guardadas";
import { descargarIcs } from "@/lib/ics";
import { DIAS, type Sesion } from "@/lib/tipos";
import ListaSesiones from "./ListaSesiones";
import ListaChoques from "./ListaChoques";
import HorarioDia from "./HorarioDia";
import SincronizacionCalendario from "./SincronizacionCalendario";
import { useEntrada } from "./Entrada";
import { useBrindis } from "./Brindis";
import {
  IconoAgenda,
  IconoCalendario,
  IconoChoque,
  IconoCuenta,
  IconoFlecha,
  IconoSinNube,
} from "./Iconos";

export default function MiAgenda() {
  const { ids, vaciar, deshacerVaciado, cargando, haEntrado, sesionResuelta, pendientes, falloServidor } =
    useGuardadas();
  const { pedirEntrada } = useEntrada();
  const { brindar } = useBrindis();
  const [choquesAbiertos, setChoquesAbiertos] = useState(false);
  const [vista, setVista] = useState<"lista" | "horario">("lista");

  const guardadas = useMemo(
    () => ids.map((id) => sesionPorId(id)).filter((s): s is Sesion => s !== null),
    [ids]
  );

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

  /* -------------------------------------------------- todavía no se sabe ---- */

  if (!sesionResuelta || (haEntrado && cargando)) {
    return (
      <div className="pagina">
        <header>
          <h1 className="titulo-pagina">Mi agenda</h1>
        </header>
        <div className="esqueleto-lista" aria-hidden>
          <span /> <span /> <span />
        </div>
        <p className="solo-lectores">Cargando tu agenda.</p>
      </div>
    );
  }

  /* ------------------------------------------------------- sin entrar ------ */

  if (!haEntrado) {
    return (
      <div className="pagina">
        <header>
          <h1 className="titulo-pagina">Mi agenda</h1>
        </header>

        <div className="mi-agenda-invitacion">
          <IconoCalendario className="mi-agenda-invitacion-icono" aria-hidden />
          <h2>Personaliza tu agenda</h2>
          <p>
            Inicia sesión con tu cuenta de Google para guardar las actividades que te interesen.
            Las añadiremos a tu Google Calendar para que no te pierdas nada del festival.
          </p>
          <button type="button" className="boton primario" onClick={() => pedirEntrada("Entra para personalizar tu agenda")}>
            <IconoCuenta aria-hidden />
            Iniciar sesión con Google
            <IconoFlecha aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------- dentro, pero vacía ---- */

  if (guardadas.length === 0) {
    return (
      <div className="pagina">
        <header>
          <h1 className="titulo-pagina">Mi agenda</h1>
        </header>

        <div className="mi-agenda-invitacion">
          <IconoAgenda className="mi-agenda-invitacion-icono" aria-hidden />
          <h2>Tu agenda está vacía</h2>
          <p>
            Toca el marcador de cualquier actividad en la agenda y aparecerá aquí.
            También puedes añadirlas a tu Google Calendar.
          </p>
          <Link href="/" className="boton primario">
            <IconoAgenda aria-hidden />
            Ir a la agenda
            <IconoFlecha aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------ con cosas --- */

  function alVaciar() {
    const anteriores = ids.slice();
    vaciar();
    brindar({
      texto: `${anteriores.length} ${anteriores.length === 1 ? "actividad quitada" : "actividades quitadas"}`,
      deshacer: () => deshacerVaciado(anteriores),
      tono: "alerta",
    });
  }

  return (
    <div className="pagina">
      <header>
        <p className="eyebrow">
          {guardadas.length} {guardadas.length === 1 ? "actividad guardada" : "actividades guardadas"}
        </p>
        <h1 className="titulo-pagina">Mi agenda</h1>
      </header>

      {falloServidor && (
        <p className="aviso alerta">
          <IconoSinNube aria-hidden />
          <span>
            No se puede guardar en el servidor ahora mismo. Lo que toques se queda en este
            dispositivo y se sincroniza cuando vuelva.
          </span>
        </p>
      )}

      {pendientes > 0 && !falloServidor && (
        <p className="nota">
          <IconoSinNube />
          <span>
            {pendientes} {pendientes === 1 ? "cambio sin sincronizar" : "cambios sin sincronizar"}. Se
            mandan solos en cuanto haya conexión.
          </span>
        </p>
      )}

      <SincronizacionCalendario />

      {/* Antes esto abría la pantalla con un bloque rojo a pantalla completa: la
          aplicación castigaba a quien la había usado bien. Ahora es una línea que
          se despliega si interesa. */}
      {colisiones.length > 0 && (
        <div className="choques-resumen">
          <button
            type="button"
            className="choques-cabecera"
            aria-expanded={choquesAbiertos}
            onClick={() => setChoquesAbiertos((v) => !v)}
          >
            <IconoChoque aria-hidden />
            <span>
              {colisiones.length === 1
                ? "Dos actividades se te pisan"
                : `${colisiones.length} solapamientos en tu agenda`}
            </span>
            <span className="chevron" aria-hidden>
              {choquesAbiertos ? "−" : "+"}
            </span>
          </button>
          {choquesAbiertos && <ListaChoques colisiones={colisiones} />}
        </div>
      )}

      <div className="botonera">
        <button
          type="button"
          className="boton"
          onClick={() => descargarIcs(conHorario, "mi-agenda-librofest-2026")}
          disabled={conHorario.length === 0}
        >
          <IconoCalendario aria-hidden />
          Descargar .ics
        </button>
        <button type="button" className="boton" onClick={alVaciar}>
          Vaciar
        </button>
      </div>

      {porDia.length > 0 && (
        <div className="conmutador" role="group" aria-label="Forma de ver la agenda">
          <button type="button" aria-pressed={vista === "lista"} onClick={() => setVista("lista")}>
            Lista
          </button>
          <button type="button" aria-pressed={vista === "horario"} onClick={() => setVista("horario")}>
            Horario
          </button>
        </div>
      )}

      {porDia.map(({ dia, sesiones }) => (
        <section className="bloque" key={dia.fecha}>
          <div className="bloque-cabecera">
            <h2>{dia.nombre}</h2>
            <span className="cuenta">{sesiones.length}</span>
          </div>
          {vista === "horario" ? (
            <HorarioDia sesiones={sesiones} />
          ) : (
            <ListaSesiones sesiones={sesiones} idsQueChocan={idsQueChocan} />
          )}
        </section>
      ))}

      {permanentes.length > 0 && (
        <section className="bloque">
          <div className="bloque-cabecera">
            <h2>Abierto los cinco días</h2>
            <span className="cuenta">{permanentes.length}</span>
          </div>
          <ListaSesiones sesiones={permanentes} />
        </section>
      )}
    </div>
  );
}
