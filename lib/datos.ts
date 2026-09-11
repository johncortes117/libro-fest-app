import bruto from "@/data/agenda.json";
import { porId as lugarPorId, normalizar } from "@/data/lugares";
import type { Sesion, TipoSesion } from "./tipos";
import { DIAS } from "./tipos";

export const SESIONES = bruto.sesiones as Sesion[];
export const EDITORIALES = bruto.editoriales as string[];
export const GENERADO = bruto.generado as string;

/**
 * Las 25 actividades permanentes se guardan una sola vez y se reparten a los cinco
 * días al consultarlas. Guardarlas 125 veces engordaría el paquete y generaría 125
 * fichas casi idénticas; expandirlas aquí deja el resto de la lógica sin casos
 * especiales.
 */
const PERMANENTES_BASE = bruto.permanentes as Omit<Sesion, "dia">[];

export const PERMANENTES: Sesion[] = PERMANENTES_BASE.map((p) => ({ ...p, dia: DIAS[0].fecha }));

export const TODAS: Sesion[] = [...SESIONES, ...PERMANENTES];

/** Las permanentes de un día concreto, con la fecha ya puesta. */
export function permanentesDe(dia: string): Sesion[] {
  return PERMANENTES_BASE.map((p) => ({ ...p, dia }));
}

export function sesionesDe(dia: string, incluirPermanentes = true): Sesion[] {
  const conHorario = SESIONES.filter((s) => s.dia === dia);
  return incluirPermanentes ? [...conHorario, ...permanentesDe(dia)] : conHorario;
}

/* ------------------------------------------------------------- índices ---- */

const PorId = new Map<string, Sesion>();
for (const s of SESIONES) PorId.set(s.id, s);
for (const p of PERMANENTES_BASE) PorId.set(p.id, { ...p, dia: DIAS[0].fecha });

export function sesionPorId(id: string): Sesion | null {
  return PorId.get(id) ?? null;
}

export function lugarDe(sesion: Sesion) {
  return lugarPorId.get(sesion.lugarId) ?? null;
}

/** Cuántas sesiones toca cada lugar en toda la semana, permanentes incluidas. */
export const CUENTA_POR_LUGAR: Record<string, number> = {};
for (const s of SESIONES) CUENTA_POR_LUGAR[s.lugarId] = (CUENTA_POR_LUGAR[s.lugarId] ?? 0) + 1;
for (const p of PERMANENTES_BASE) {
  CUENTA_POR_LUGAR[p.lugarId] = (CUENTA_POR_LUGAR[p.lugarId] ?? 0) + DIAS.length;
}

/* ----------------------------------------------------------- ahora ------- */

export const estaEnCurso = (s: Sesion, min: number) => s.inicio <= min && s.fin > min;

/**
 * Lo que está pasando ahora mismo, ordenado por lo que queda menos —que es el orden
 * en que hay que decidir si te da tiempo a llegar.
 */
export function enCurso(dia: string, minutos: number): Sesion[] {
  return sesionesDe(dia)
    .filter((s) => estaEnCurso(s, minutos))
    .sort((a, b) => a.fin - b.fin || a.inicio - b.inicio);
}

/** Lo que arranca dentro de la ventana indicada (por defecto, dos horas). */
export function aContinuacion(dia: string, minutos: number, ventana = 120): Sesion[] {
  return sesionesDe(dia, false)
    .filter((s) => s.inicio > minutos && s.inicio <= minutos + ventana)
    .sort((a, b) => a.inicio - b.inicio);
}

/* ------------------------------------------------------------ búsqueda ---- */

const indice = new Map<string, string>();
for (const s of TODAS) {
  const lugar = lugarPorId.get(s.lugarId);
  indice.set(
    s.id,
    normalizar([s.titulo, s.detalle ?? "", s.personas.join(" "), s.lugarTexto, lugar?.nombre ?? ""].join(" "))
  );
}

export function buscar(consulta: string, dentro: Sesion[] = TODAS): Sesion[] {
  const q = normalizar(consulta);
  if (q.length < 2) return dentro;
  const terminos = q.split(" ").filter(Boolean);
  return dentro.filter((s) => {
    const texto = indice.get(s.id) ?? "";
    return terminos.every((t) => texto.includes(t));
  });
}

/* ------------------------------------------------------------- choques ---- */

export interface Choque {
  a: Sesion;
  b: Sesion;
  /** Minutos que se solapan. */
  solape: number;
}

/**
 * Dos sesiones guardadas que se pisan.
 *
 * Las permanentes quedan fuera a propósito: la muestra editorial está abierta de
 * 08:30 a 18:00 y se solapa con todo. Contarla como choque llenaría la pantalla de
 * colisiones falsas y la función dejaría de significar nada.
 */
export function choques(sesiones: Sesion[]): Choque[] {
  const conHorario = sesiones
    .filter((s) => !s.permanente)
    .sort((a, b) => a.dia.localeCompare(b.dia) || a.inicio - b.inicio);

  const encontrados: Choque[] = [];
  for (let i = 0; i < conHorario.length; i++) {
    for (let j = i + 1; j < conHorario.length; j++) {
      const a = conHorario[i];
      const b = conHorario[j];
      if (a.dia !== b.dia) break;
      if (b.inicio >= a.fin) break;
      encontrados.push({ a, b, solape: Math.min(a.fin, b.fin) - b.inicio });
    }
  }
  return encontrados;
}

export function tieneChoque(sesion: Sesion, lista: Choque[]): boolean {
  return lista.some((c) => c.a.id === sesion.id || c.b.id === sesion.id);
}

/* -------------------------------------------------------------- cifras ---- */

export const CIFRAS = {
  sesiones: SESIONES.length,
  permanentes: PERMANENTES_BASE.length,
  total: SESIONES.length + PERMANENTES_BASE.length,
  editoriales: EDITORIALES.length,
  personas: new Set(SESIONES.flatMap((s) => s.personas)).size,
  lugares: new Set(TODAS.map((s) => s.lugarId)).size,
  porConfirmar: SESIONES.filter((s) => lugarPorId.get(s.lugarId)?.porConfirmar).length,
};

export function cuentaPorTipo(sesiones: Sesion[]): Record<TipoSesion, number> {
  const c = { conferencia: 0, taller: 0, cultural: 0, libro: 0, permanente: 0 };
  for (const s of sesiones) c[s.tipo]++;
  return c;
}
