import { porId as lugarPorId } from "@/data/lugares";
import { aFechaReal } from "./tiempo";
import type { Sesion } from "./tipos";

/**
 * Exporta sesiones al calendario del teléfono.
 *
 * Es el sustituto deliberado de las notificaciones push: en iOS, push exige
 * instalación previa, permisos y un servidor con claves —dos días de trabajo frágil
 * para algo que casi nadie activaría—. Un `.ics` se apoya en el recordatorio que la
 * gente ya tiene configurado y funciona en todos los teléfonos.
 */

const sello = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Escapa según RFC 5545 y parte las líneas a 75 octetos. */
function campo(nombre: string, valor: string): string {
  const escapado = valor
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

  const linea = `${nombre}:${escapado}`;
  if (linea.length <= 75) return linea;

  const trozos: string[] = [linea.slice(0, 75)];
  let resto = linea.slice(75);
  while (resto.length > 74) {
    trozos.push(" " + resto.slice(0, 74));
    resto = resto.slice(74);
  }
  if (resto) trozos.push(" " + resto);
  return trozos.join("\r\n");
}

function evento(s: Sesion): string[] {
  const lugar = lugarPorId.get(s.lugarId);
  const dondeBase = lugar
    ? lugar.fuera
      ? `${lugar.nombre}, ${lugar.fuera.ciudad} (${lugar.fuera.pais})`
      : `${lugar.nombre} · punto ${lugar.pin} del mapa`
    : s.lugarTexto;

  const donde = lugar?.porConfirmar ? `${dondeBase} — sala por confirmar` : dondeBase;

  const descripcion = [
    s.detalle,
    s.personas.length ? `Participan: ${s.personas.join(", ")}` : "",
    s.finSupuesto ? "Hora de cierre estimada." : "",
    "UPEC Libro Fest 2026",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "BEGIN:VEVENT",
    campo("UID", `${s.id}@upec-librofest-2026`),
    campo("DTSTAMP", sello(new Date())),
    campo("DTSTART", sello(aFechaReal(s.dia, s.inicio))),
    campo("DTEND", sello(aFechaReal(s.dia, s.fin))),
    campo("SUMMARY", s.titulo),
    campo("LOCATION", donde),
    campo("DESCRIPTION", descripcion),
    "END:VEVENT",
  ];
}

export function generarIcs(sesiones: Sesion[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UPEC Libro Fest 2026//ES",
    "CALSCALE:GREGORIAN",
    campo("X-WR-CALNAME", "UPEC Libro Fest 2026"),
    ...sesiones.flatMap(evento),
    "END:VCALENDAR",
  ].join("\r\n");
}

export function descargarIcs(sesiones: Sesion[], nombre: string) {
  const blob = new Blob([generarIcs(sesiones)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombre}.ics`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
