"use client";

import { useEffect, useMemo, useState } from "react";
import { LUGARES } from "@/data/lugares";
import { buscar, cuentaPorTipo, permanentesDe, sesionesDe, sesionPorId } from "@/lib/datos";
import { useGuardadas } from "@/lib/guardadas";
import { diaVisible, hhmm } from "@/lib/tiempo";
import { DIAS, ORDEN_TIPOS, TIPOS, type Sesion, type TipoSesion } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import ListaSesiones from "./ListaSesiones";
import TiraDias from "./TiraDias";
import { ICONO_TIPO } from "./FilaSesion";
import { IconoBuscar, IconoCerrar, IconoChoque, IconoFiltros } from "./Iconos";

const esTipo = (v: string): v is TipoSesion => ORDEN_TIPOS.includes(v as TipoSesion);

export default function AgendaFiltrable() {
  const momento = useMomento();
  const { ids: guardadasIds } = useGuardadas();

  const [diaElegido, setDiaElegido] = useState<string | null>(null);
  const [tipos, setTipos] = useState<TipoSesion[]>([]);
  const [lugar, setLugar] = useState("");
  const [consulta, setConsulta] = useState("");
  const [soloLibres, setSoloLibres] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [mostrarPasadas, setMostrarPasadas] = useState(false);

  // Mientras nadie elija un día, manda el momento actual: durante el festival la
  // agenda abre en el día de hoy, y antes de empezar, en el lunes. Derivarlo en vez
  // de fijarlo en un efecto evita un fotograma con el día equivocado.
  const dia = diaElegido ?? (momento ? diaVisible(momento.fecha) : DIAS[0].fecha);

  /* Estado inicial desde la URL. Se lee del navegador en lugar de con
     `useSearchParams` para no necesitar un límite de Suspense. */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);

    const d = p.get("dia");
    if (d && (d === "todos" || DIAS.some((x) => x.fecha === d))) setDiaElegido(d);

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

    const actual = new URLSearchParams(window.location.search);
    for (const clave of ["t", "kiosko"]) {
      const v = actual.get(clave);
      if (v) p.set(clave, v);
    }

    const cadena = p.toString();
    window.history.replaceState(null, "", cadena ? `?${cadena}` : window.location.pathname);
  }, [diaElegido, tipos, lugar, consulta]);

  const delDia = useMemo(() => {
    if (dia === "todos") return permanentesDe("todos");
    return sesionesDe(dia);
  }, [dia]);

  const lugaresDelDia = useMemo(() => {
    const ids = new Set(delDia.map((s) => s.lugarId));
    return LUGARES.filter((l) => ids.has(l.id));
  }, [delDia]);

  /* El filtro de lugar se quedaba apuntando a un sitio que ese día no programa
     nada: el selector se veía en blanco y la agenda salía a cero sin explicar por
     qué. Al cambiar de día, si el lugar elegido ya no está, se suelta. */
  useEffect(() => {
    if (lugar && !lugaresDelDia.some((l) => l.id === lugar)) setLugar("");
  }, [lugar, lugaresDelDia]);

  /* Al empezar a hacer scroll con el panel de filtros abierto, ocultarlo automáticamente
     para no tapar las sesiones que el usuario quiere consultar. */
  useEffect(() => {
    if (!panelAbierto) return;

    const scrollInicial = window.scrollY;
    const UMBRAL = 15;

    const alHacerScroll = () => {
      if (Math.abs(window.scrollY - scrollInicial) > UMBRAL) {
        setPanelAbierto(false);
      }
    };

    window.addEventListener("scroll", alHacerScroll, { passive: true });
    return () => window.removeEventListener("scroll", alHacerScroll);
  }, [panelAbierto]);

  /* Lo que se pisa con lo que esta persona ya guardó. Es el cálculo que antes solo
     existía dentro de «Mi agenda», y es la razón por la que esta aplicación sirve
     para algo que el PDF no: con ocho cosas a la vez, la tarea no es leer el
     programa, es elegir. */
  const franjasGuardadas = useMemo(() => {
    return guardadasIds
      .map((id) => sesionPorId(id))
      .filter((s): s is Sesion => s !== null && !s.permanente && s.dia === dia)
      .map((s) => ({ id: s.id, inicio: s.inicio, fin: s.fin }));
  }, [guardadasIds, dia]);

  const idsQueChocan = useMemo(() => {
    const set = new Set<string>();
    if (franjasGuardadas.length === 0) return set;
    for (const s of delDia) {
      if (s.permanente) continue;
      const choca = franjasGuardadas.some(
        (g) => g.id !== s.id && s.inicio < g.fin && s.fin > g.inicio
      );
      if (choca) set.add(s.id);
    }
    return set;
  }, [delDia, franjasGuardadas]);

  const resultados = useMemo(() => {
    let r = delDia;
    if (tipos.length) r = r.filter((s) => tipos.includes(s.tipo));
    if (lugar) r = r.filter((s) => s.lugarId === lugar);
    if (consulta.trim().length >= 2) r = buscar(consulta, r);
    if (soloLibres) r = r.filter((s) => s.permanente || !idsQueChocan.has(s.id));
    return r;
  }, [delDia, tipos, lugar, consulta, soloLibres, idsQueChocan]);

  const cuentas = useMemo(() => {
    let base = delDia;
    if (lugar) base = base.filter((s) => s.lugarId === lugar);
    if (consulta.trim().length >= 2) base = buscar(consulta, base);
    if (soloLibres) base = base.filter((s) => s.permanente || !idsQueChocan.has(s.id));
    return cuentaPorTipo(base);
  }, [delDia, lugar, consulta, soloLibres, idsQueChocan]);

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

  /* Firma de los filtros que reordenan la lista. La búsqueda queda fuera a
     propósito: animar en cada pulsación de tecla marearía. */
  const firmaFiltros = [dia, tipos.join(","), lugar, soloLibres].join("|");

  const cuantosFiltros = tipos.length + (lugar ? 1 : 0) + (soloLibres ? 1 : 0);
  const hayFiltros = cuantosFiltros > 0 || consulta !== "";
  const totalDia =
    dia === "todos"
      ? permanentesDe("todos").length
      : permanentesDe(dia).length + sesionesDe(dia, false).length;

  function alternarTipo(t: TipoSesion) {
    setTipos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function limpiar() {
    setTipos([]);
    setLugar("");
    setConsulta("");
    setSoloLibres(false);
  }

  /* ---- Partición en vivo: pasadas vs. actuales+futuras ---- */
  const esHoyVivo = !!momento && momento.fecha === dia && dia !== "todos";
  const minActual = momento?.minutos ?? 0;

  const gruposPasados = useMemo(() => {
    if (!esHoyVivo) return [];
    // Un bloque-hora es "pasado" cuando su franja horaria ya terminó completa,
    // es decir, la hora de inicio del bloque + 60 min ya pasó.
    // Las sesiones largas (p.ej. 09:00–12:00) pueden seguir en vivo, pero
    // el bloque-hora de las 09:00 ya es historia cuando son las 10:01.
    return grupos.filter(([hora]) => hora + 60 <= minActual);
  }, [grupos, esHoyVivo, minActual]);

  const gruposVivosYFuturos = useMemo(() => {
    if (!esHoyVivo) return grupos;
    return grupos.filter(([hora]) => hora + 60 > minActual);
  }, [grupos, esHoyVivo, minActual]);

  const totalPasadas = gruposPasados.reduce((acc, [, sgs]) => acc + sgs.length, 0);

  return (
    <div className="pagina-agenda">
      {/* Los días se quedan pegados arriba; el resto de los filtros se pliega.
          Antes, cuatro controles apilados empujaban la primera sesión fuera de la
          pantalla en un móvil: la página que existe para enseñar la programación
          enseñaba, sobre todo, filtros. */}
      <div className="barra-filtros">
        <TiraDias dia={dia} hoy={momento?.fecha ?? null} onElegir={setDiaElegido} />

        <div className="fila-buscar">
          <div className="buscador">
            <IconoBuscar className="lupa" aria-hidden />
            <input
              id="buscar-agenda"
              type="search"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="Buscar título, autor o ponente"
              aria-label="Buscar en la agenda"
            />
            {consulta && (
              <button type="button" className="limpiar" onClick={() => setConsulta("")} aria-label="Borrar la búsqueda">
                <IconoCerrar aria-hidden style={{ width: 15, height: 15 }} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={cuantosFiltros > 0 ? "boton-filtros activo" : "boton-filtros"}
            aria-expanded={panelAbierto}
            aria-controls="panel-filtros"
            onClick={() => setPanelAbierto((v) => !v)}
          >
            <IconoFiltros aria-hidden />
            Filtros
            {cuantosFiltros > 0 && <span className="insignia">{cuantosFiltros}</span>}
          </button>
        </div>

        {panelAbierto && (
          <div className="panel-filtros" id="panel-filtros">
            <div className="grupo-filtro">
              <p className="etiqueta-filtro">Tipo</p>
              <div className="tira">
                {ORDEN_TIPOS.map((t) => {
                  const Icono = ICONO_TIPO[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      className="pildora"
                      aria-pressed={tipos.includes(t)}
                      onClick={() => alternarTipo(t)}
                      style={
                        {
                          "--color-tipo": `var(--t-${t})`,
                          "--fondo-tipo": `var(--t-${t}-soft)`,
                        } as React.CSSProperties
                      }
                    >
                      <Icono />
                      {TIPOS[t].plural}
                      <span className="cuenta">{cuentas[t]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grupo-filtro">
              <p className="etiqueta-filtro">Lugar</p>
              <div className="tira">
                <button
                  type="button"
                  className="pildora"
                  aria-pressed={lugar === ""}
                  onClick={() => setLugar("")}
                >
                  Todos
                </button>
                {lugaresDelDia.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className="pildora"
                    aria-pressed={lugar === l.id}
                    onClick={() => setLugar(lugar === l.id ? "" : l.id)}
                  >
                    {l.pin != null && <span className="pin-num pequeno">{l.pin}</span>}
                    {l.nombre}
                  </button>
                ))}
              </div>
            </div>

            {franjasGuardadas.length > 0 && (
              <div className="grupo-filtro">
                <p className="etiqueta-filtro">Tu agenda</p>
                <button
                  type="button"
                  className="pildora choque"
                  aria-pressed={soloLibres}
                  onClick={() => setSoloLibres((v) => !v)}
                >
                  <IconoChoque />
                  Solo lo que no se pisa
                </button>
              </div>
            )}

            <div className="fila-acciones-filtros" style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginTop: "4px" }}>
              {hayFiltros ? (
                <button type="button" className="boton" onClick={limpiar}>
                  <IconoCerrar aria-hidden />
                  Quitar filtros
                </button>
              ) : <div />}
              <button
                type="button"
                className="boton primario"
                onClick={() => setPanelAbierto(false)}
              >
                Cerrar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {hayFiltros && (
        <p className="resumen-filtros">
          {resultados.length} de {totalDia} actividades
          <button type="button" onClick={limpiar}>
            quitar filtros
          </button>
        </p>
      )}

      {conHorario.length === 0 && permanentes.length === 0 && (
        <div className="vacio">
          <p>Nada coincide con lo que buscas.</p>
          {hayFiltros && (
            <button type="button" className="boton" onClick={limpiar}>
              <IconoCerrar aria-hidden />
              Quitar filtros
            </button>
          )}
        </div>
      )}

      <div className="resultados" key={firmaFiltros}>

        {/* Actividades pasadas: separador sutil tipo timeline cronológico */}
        {esHoyVivo && gruposPasados.length > 0 && (
          <div className="seccion-pasadas">
            <div className="pasadas-separador-linea">
              <button
                type="button"
                className="btn-pasadas-sutil"
                onClick={() => setMostrarPasadas((v) => !v)}
                aria-expanded={mostrarPasadas}
                title={mostrarPasadas ? "Ocultar actividades anteriores de hoy" : `Ver ${totalPasadas} actividades anteriores finalizadas`}
              >
                <svg
                  className="icono-pasadas"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="6" />
                  <polyline points="8 4.5 8 8 10.5 9.5" />
                </svg>
                <span className="texto-pasadas">
                  {mostrarPasadas
                    ? "Ocultar actividades anteriores"
                    : `${totalPasadas} ${totalPasadas === 1 ? "actividad anterior" : "actividades anteriores"}`}
                </span>
                <span className={`chevron-pasadas ${mostrarPasadas ? "abierto" : ""}`} aria-hidden="true">▾</span>
              </button>
            </div>
            {mostrarPasadas &&
              gruposPasados.map(([hora, sesiones]) => (
                <section className="bloque bloque-pasado" key={hora}>
                  <div className="hora-marca">
                    <h2 className="h">{hhmm(hora)}</h2>
                    <span className="raya" />
                    <span className="n">
                      {sesiones.length} {sesiones.length === 1 ? "actividad" : "en paralelo"}
                    </span>
                  </div>
                  <ListaSesiones sesiones={sesiones} idsQueChocan={idsQueChocan} />
                </section>
              ))}
          </div>
        )}

        {/* Actividades en curso y futuras */}
        {gruposVivosYFuturos.map(([hora, sesiones]) => (
          <section className="bloque" key={hora}>
            <div className="hora-marca">
              <h2 className="h">{hhmm(hora)}</h2>
              <span className="raya" />
              <span className="n">
                {sesiones.length} {sesiones.length === 1 ? "actividad" : "en paralelo"}
              </span>
            </div>
            <ListaSesiones sesiones={sesiones} idsQueChocan={idsQueChocan} />
          </section>
        ))}

        {permanentes.length > 0 && (
          <section className="bloque">
            <div className="hora-marca">
              <h2 className="h">{dia === "todos" ? "Todos los días" : "Todo el día"}</h2>
              <span className="raya" />
              <span className="n">
                {dia === "todos"
                  ? `${permanentes.length} ${permanentes.length === 1 ? "actividad permanente" : "actividades permanentes"}`
                  : `${permanentes.length} salas y muestras`}
              </span>
            </div>
            <ListaSesiones sesiones={permanentes} />
          </section>
        )}
      </div>
    </div>
  );
}
