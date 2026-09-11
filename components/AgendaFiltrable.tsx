"use client";

import { useEffect, useMemo, useState } from "react";
import { LUGARES } from "@/data/lugares";
import { buscar, cuentaPorTipo, permanentesDe, sesionesDe } from "@/lib/datos";
import { diaVisible, hhmm } from "@/lib/tiempo";
import { DIAS, ORDEN_TIPOS, TIPOS, type Sesion, type TipoSesion } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import ListaSesiones from "./ListaSesiones";
import { IconoBuscar, IconoCerrar } from "./Iconos";

const esTipo = (v: string): v is TipoSesion => ORDEN_TIPOS.includes(v as TipoSesion);

export default function AgendaFiltrable() {
  const momento = useMomento();

  const [diaElegido, setDiaElegido] = useState<string | null>(null);
  const [tipos, setTipos] = useState<TipoSesion[]>([]);
  const [lugar, setLugar] = useState("");
  const [consulta, setConsulta] = useState("");

  // Mientras nadie elija un día, manda el momento actual: durante el festival la
  // agenda abre en el día de hoy, y antes de empezar, en el lunes. Derivarlo en vez
  // de fijarlo en un efecto evita un fotograma con el día equivocado.
  const dia = diaElegido ?? (momento ? diaVisible(momento.fecha) : DIAS[0].fecha);

  /* Estado inicial desde la URL. Se lee del navegador en lugar de con
     `useSearchParams` para no necesitar un límite de Suspense en export estático. */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);

    const d = p.get("dia");
    if (d && DIAS.some((x) => x.fecha === d)) setDiaElegido(d);

    const t = (p.get("tipo") ?? "").split(",").filter(esTipo);
    if (t.length) setTipos(t);

    const l = p.get("lugar");
    if (l && LUGARES.some((x) => x.id === l)) setLugar(l);

    const q = p.get("q");
    if (q) setConsulta(q);
  }, []);

  /* Mantener la URL al día para que un filtro se pueda compartir tal cual. */
  useEffect(() => {
    const p = new URLSearchParams();
    if (diaElegido) p.set("dia", diaElegido);
    if (tipos.length) p.set("tipo", tipos.join(","));
    if (lugar) p.set("lugar", lugar);
    if (consulta) p.set("q", consulta);

    const t = new URLSearchParams(window.location.search).get("t");
    if (t) p.set("t", t);

    const cadena = p.toString();
    window.history.replaceState(null, "", cadena ? `?${cadena}` : window.location.pathname);
  }, [diaElegido, tipos, lugar, consulta]);

  const delDia = useMemo(() => sesionesDe(dia), [dia]);

  const resultados = useMemo(() => {
    let r = delDia;
    if (tipos.length) r = r.filter((s) => tipos.includes(s.tipo));
    if (lugar) r = r.filter((s) => s.lugarId === lugar);
    if (consulta.trim().length >= 2) r = buscar(consulta, r);
    return r;
  }, [delDia, tipos, lugar, consulta]);

  const cuentas = useMemo(() => {
    let base = delDia;
    if (lugar) base = base.filter((s) => s.lugarId === lugar);
    if (consulta.trim().length >= 2) base = buscar(consulta, base);
    return cuentaPorTipo(base);
  }, [delDia, lugar, consulta]);

  const conHorario = resultados.filter((s) => !s.permanente).sort((a, b) => a.inicio - b.inicio);
  const permanentes = resultados.filter((s) => s.permanente);

  /* Agrupar por hora de inicio: es como la gente lee un programa. */
  const grupos = useMemo(() => {
    const mapa = new Map<number, Sesion[]>();
    for (const s of conHorario) {
      const hora = Math.floor(s.inicio / 60) * 60;
      if (!mapa.has(hora)) mapa.set(hora, []);
      mapa.get(hora)!.push(s);
    }
    return [...mapa.entries()].sort((a, b) => a[0] - b[0]);
  }, [conHorario]);

  const lugaresDelDia = useMemo(() => {
    const ids = new Set(delDia.map((s) => s.lugarId));
    return LUGARES.filter((l) => ids.has(l.id));
  }, [delDia]);

  const hayFiltros = tipos.length > 0 || lugar !== "" || consulta !== "";
  const totalDia = permanentesDe(dia).length + sesionesDe(dia, false).length;

  function alternarTipo(t: TipoSesion) {
    setTipos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  return (
    <div className="pagina">
      <header>
        <p className="eyebrow">{totalDia} actividades este día</p>
        <h1 className="titulo-pagina">Agenda</h1>
      </header>

      <div className="filtros">
        <div className="tira" role="group" aria-label="Día">
          {DIAS.map((d) => (
            <button
              key={d.fecha}
              type="button"
              className="pildora"
              aria-pressed={dia === d.fecha}
              onClick={() => setDiaElegido(d.fecha)}
            >
              {d.nombre}
            </button>
          ))}
        </div>

        <div className="buscador">
          <IconoBuscar className="lupa" aria-hidden />
          <input
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar por título, autor, ponente o lugar"
            aria-label="Buscar en la agenda"
          />
          {consulta && (
            <button type="button" className="limpiar" onClick={() => setConsulta("")} aria-label="Borrar la búsqueda">
              <IconoCerrar aria-hidden style={{ width: 15, height: 15 }} />
            </button>
          )}
        </div>

        <div className="tira" role="group" aria-label="Tipo de actividad">
          {ORDEN_TIPOS.map((t) => (
            <button
              key={t}
              type="button"
              className="pildora"
              aria-pressed={tipos.includes(t)}
              onClick={() => alternarTipo(t)}
              style={
                tipos.includes(t)
                  ? ({ background: `var(--t-${t})`, borderColor: `var(--t-${t})` } as React.CSSProperties)
                  : undefined
              }
            >
              {TIPOS[t].plural}
              <span className="cuenta">{cuentas[t]}</span>
            </button>
          ))}
        </div>

        <select
          className="selector"
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          aria-label="Filtrar por lugar"
        >
          <option value="">Todos los lugares</option>
          {lugaresDelDia.map((l) => (
            <option key={l.id} value={l.id}>
              {l.pin != null ? `${l.pin} · ` : ""}
              {l.nombre}
              {l.fuera ? ` (${l.fuera.ciudad})` : ""}
            </option>
          ))}
        </select>

        {hayFiltros && (
          <button
            type="button"
            className="boton"
            style={{ alignSelf: "flex-start" }}
            onClick={() => {
              setTipos([]);
              setLugar("");
              setConsulta("");
            }}
          >
            <IconoCerrar aria-hidden />
            Quitar filtros · {resultados.length} de {totalDia}
          </button>
        )}
      </div>

      {conHorario.length === 0 && permanentes.length === 0 && (
        <p className="vacio">
          Nada coincide con lo que buscas. Prueba con menos filtros, o busca el nombre de un autor.
        </p>
      )}

      {grupos.map(([hora, sesiones]) => (
        <section className="bloque" key={hora}>
          <div className="bloque-cabecera">
            <h2 className="grupo-hora">{hhmm(hora)}</h2>
            <span className="cuenta">
              {sesiones.length} {sesiones.length === 1 ? "actividad" : "en paralelo"}
            </span>
          </div>
          <ListaSesiones sesiones={sesiones} />
        </section>
      ))}

      {permanentes.length > 0 && (
        <section className="bloque">
          <div className="bloque-cabecera">
            <h2 className="grupo-hora">Todo el día</h2>
            <span className="cuenta">{permanentes.length}</span>
          </div>
          <ListaSesiones sesiones={permanentes} />
          <p className="nota">
            <span>
              Abren a las 08:30. La agenda oficial no indica hora de cierre; mostramos las 18:00 como
              estimación.
            </span>
          </p>
        </section>
      )}
    </div>
  );
}
