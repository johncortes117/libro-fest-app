import { auth } from "./auth";
import { AMBITO_CALENDARIO } from "./ambitos";
import { consulta } from "./db";
import { porId as lugarPorId } from "@/data/lugares";
import { aFechaReal } from "./tiempo";
import type { Sesion } from "./tipos";

/**
 * Google Calendar.
 *
 * Nunca se escribe en el calendario de nadie por el mero hecho de guardar una
 * actividad: hace falta que la persona encienda el interruptor en «Mi agenda», y
 * eso además dispara la pantalla de consentimiento del permiso de calendario, que
 * no se pide al entrar.
 *
 * Cada evento creado se anota en «sesion_guardada.eventoGoogleId», y es lo que
 * permite retirarlo si alguien quita la actividad o apaga la sincronización. Sin
 * esa anotación, apagar el interruptor dejaría eventos huérfanos en el calendario
 * real de una persona, que es exactamente la clase de cosa por la que se desinstala
 * una aplicación.
 */

const API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export interface AccesoGoogle {
  token: string;
  /** `false` si la persona entró con Google pero nunca concedió el calendario. */
  tieneCalendario: boolean;
}

/**
 * Token de acceso de Google del usuario, renovado si hacía falta.
 *
 * Better Auth usa el refresh token guardado en «account» para renovarlo, así que
 * esto sigue funcionando días después de que la persona entrara — siempre que el
 * proveedor esté configurado con `accessType: "offline"`.
 */
export async function accesoGoogle(
  cabeceras: Headers,
  userId: string
): Promise<AccesoGoogle | null> {
  const filas = await consulta<{ id: string }>(
    `select "id" from "account" where "userId" = $1 and "providerId" = 'google' limit 1`,
    [userId]
  );
  if (filas.length === 0) return null;

  try {
    const r = await auth.api.getAccessToken({
      body: { accountId: filas[0].id, userId },
      headers: cabeceras,
    });
    if (!r?.accessToken) return null;
    return {
      token: r.accessToken,
      tieneCalendario: (r.scopes ?? []).some((s) => s === AMBITO_CALENDARIO),
    };
  } catch {
    // Token no renovable (permiso revocado desde la cuenta de Google, por
    // ejemplo). Se trata como «no conectado» y la interfaz ofrece reconectar.
    return null;
  }
}

function dondeTexto(sesion: Sesion): string {
  const lugar = lugarPorId.get(sesion.lugarId);
  if (!lugar) return sesion.lugarTexto;
  if (lugar.fuera) return `${lugar.nombre}, ${lugar.fuera.ciudad} (${lugar.fuera.pais})`;
  const base = lugar.pin != null ? `${lugar.nombre} · punto ${lugar.pin} del campus UPEC` : lugar.nombre;
  return lugar.porConfirmar ? `${base} — sala por confirmar` : base;
}

function cuerpoEvento(sesion: Sesion, dia: string) {
  const descripcion = [
    sesion.detalle,
    sesion.personas.length ? `Participan: ${sesion.personas.join(", ")}` : "",
    sesion.finSupuesto ? "Hora de cierre estimada: la agenda oficial no la indica." : "",
    "UPEC Libro Fest 2026",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    summary: sesion.titulo,
    location: dondeTexto(sesion),
    description: descripcion,
    start: { dateTime: aFechaReal(dia, sesion.inicio).toISOString(), timeZone: "America/Guayaquil" },
    end: { dateTime: aFechaReal(dia, sesion.fin).toISOString(), timeZone: "America/Guayaquil" },
    source: { title: "UPEC Libro Fest 2026", url: `${process.env.NEXT_PUBLIC_SITIO ?? ""}/sesion/${sesion.id}/` },
  };
}

/** Crea el evento y devuelve su id, o `null` si Google lo rechazó. */
export async function crearEvento(
  token: string,
  sesion: Sesion,
  dia: string
): Promise<string | null> {
  const r = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cuerpoEvento(sesion, dia)),
  });
  if (!r.ok) return null;
  const datos = (await r.json()) as { id?: string };
  return datos.id ?? null;
}

/**
 * Borra el evento. Un 404 o un 410 cuentan como éxito: si el usuario ya lo borró
 * a mano desde Google Calendar, el resultado que queríamos ya se cumplió.
 */
export async function borrarEvento(token: string, eventoId: string): Promise<boolean> {
  const r = await fetch(`${API}/${encodeURIComponent(eventoId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.ok || r.status === 404 || r.status === 410;
}
