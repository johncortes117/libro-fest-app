import { DIAS } from "./tipos";

/**
 * Todo el festival ocurre en hora de Ecuador. Da igual dónde tenga puesto el reloj
 * el teléfono de quien mira: alguien que cruza desde Ipiales tiene que ver la misma
 * hora que el resto.
 *
 * Lo que hay que proteger no es la aritmética de UTC−5, es qué *día* del festival
 * es: usar la fecha local del dispositivo puede caer en el día equivocado, no solo
 * en la hora equivocada. Por eso la fecha se deriva siempre con `Intl` sobre la
 * zona del evento y nunca con `getDate()`.
 */
export const ZONA = "America/Guayaquil";

const formateador = new Intl.DateTimeFormat("es-EC", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export interface Momento {
  /** Fecha en la zona del evento, `2026-09-24`. */
  fecha: string;
  /** Minutos desde medianoche en la zona del evento. */
  minutos: number;
  /** El momento viene de `?t=`, no del reloj real. */
  simulado: boolean;
}

export function momentoDe(fecha: Date, simulado = false): Momento {
  const p: Record<string, string> = {};
  for (const parte of formateador.formatToParts(fecha)) {
    if (parte.type !== "literal") p[parte.type] = parte.value;
  }
  // A las 24:00 algunos entornos devuelven «24» en lugar de «00».
  const hora = Number(p.hour) % 24;
  return {
    fecha: `${p.year}-${p.month}-${p.day}`,
    minutos: hora * 60 + Number(p.minute),
    simulado,
  };
}

/**
 * Lee `?t=2026-09-24T15:10` de la URL para poder probar y enseñar la vista «ahora»
 * sin esperar al día del evento. Sin esto no hay forma de demostrarle nada a nadie
 * antes del 21 de septiembre.
 */
export function momentoSimulado(busqueda: string): Momento | null {
  const t = new URLSearchParams(busqueda).get("t");
  if (!t) return null;

  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?$/);
  if (!m) return null;

  return {
    fecha: `${m[1]}-${m[2]}-${m[3]}`,
    minutos: Number(m[4] ?? 0) * 60 + Number(m[5] ?? 0),
    simulado: true,
  };
}

/* ------------------------------------------------------------- formato ---- */

export function hhmm(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** «48 min», «1 h 48», «3 h». */
export function duracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

/** «en 18 min», «en 2 h 05». */
export function enCuanto(minutos: number): string {
  return minutos <= 0 ? "ahora" : `en ${duracion(minutos)}`;
}

export function esDiaDelFestival(fecha: string): boolean {
  return DIAS.some((d) => d.fecha === fecha);
}

export function diaDe(fecha: string) {
  return DIAS.find((d) => d.fecha === fecha) ?? null;
}

/**
 * Qué día del festival mostrar para un momento dado.
 * Antes del festival, el primero; después, el último; durante, el que toca.
 */
export function diaVisible(fecha: string): string {
  if (esDiaDelFestival(fecha)) return fecha;
  if (fecha < DIAS[0].fecha) return DIAS[0].fecha;
  return DIAS[DIAS.length - 1].fecha;
}

export type EstadoFestival = "antes" | "durante" | "despues";

export function estadoFestival(fecha: string): EstadoFestival {
  if (fecha < DIAS[0].fecha) return "antes";
  if (fecha > DIAS[DIAS.length - 1].fecha) return "despues";
  return "durante";
}

/** Días naturales que faltan para que arranque el festival. */
export function diasHastaElInicio(fecha: string): number {
  const [a, m, d] = fecha.split("-").map(Number);
  const [a2, m2, d2] = DIAS[0].fecha.split("-").map(Number);
  const hoy = Date.UTC(a, m - 1, d);
  const inicio = Date.UTC(a2, m2 - 1, d2);
  return Math.round((inicio - hoy) / 86400000);
}

/** `2026-09-24` + minutos → Date real, para exportar al calendario. */
export function aFechaReal(fecha: string, minutos: number): Date {
  const [a, m, d] = fecha.split("-").map(Number);
  // Ecuador es UTC−5 todo el año: no hay horario de verano que compensar.
  return new Date(Date.UTC(a, m - 1, d, Math.floor(minutos / 60) + 5, minutos % 60));
}
