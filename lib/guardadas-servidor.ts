import { randomUUID } from "node:crypto";
import { consulta, HAY_BD } from "./db";
import { sesionPorId } from "./datos";
import { accesoGoogle, borrarEvento, crearEvento } from "./calendario";

/**
 * «Mi agenda» en el servidor.
 *
 * La misma selección tiene que aparecer en el móvil de camino al campus, en el
 * portátil de casa y en la pantalla de la entrada. Eso es lo que obliga a que esto
 * viva en la base de datos y no en `localStorage`, que es donde vivía antes.
 *
 * El cliente mantiene además una copia local para poder leer sin conexión (el wifi
 * del campus no aguanta) y una cola de escrituras que se vacía al reconectar. Por
 * eso todas las operaciones de aquí son idempotentes: reintentar «guardar» dos
 * veces no puede duplicar nada.
 */

export interface FilaGuardada {
  sesionId: string;
  dia: string;
  eventoGoogleId: string | null;
}

export class SinBaseDeDatos extends Error {
  constructor() {
    super("Falta configuración: la agenda personal necesita DATABASE_URL y BETTER_AUTH_SECRET.");
    this.name = "SinBaseDeDatos";
  }
}

function exigirBd() {
  if (!HAY_BD) throw new SinBaseDeDatos();
}

export async function listar(userId: string): Promise<FilaGuardada[]> {
  exigirBd();
  return consulta<FilaGuardada>(
    `select "sesionId", "dia", "eventoGoogleId"
       from "sesion_guardada"
      where "userId" = $1
      order by "createdAt" asc`,
    [userId]
  );
}

export async function quiereCalendario(userId: string): Promise<boolean> {
  exigirBd();
  const filas = await consulta<{ syncCalendario: boolean }>(
    `select "syncCalendario" from "preferencia_usuario" where "userId" = $1`,
    [userId]
  );
  return filas[0]?.syncCalendario ?? false;
}

export async function fijarCalendario(userId: string, activo: boolean): Promise<void> {
  exigirBd();
  await consulta(
    `insert into "preferencia_usuario" ("userId", "syncCalendario", "updatedAt")
     values ($1, $2, now())
     on conflict ("userId") do update
       set "syncCalendario" = excluded."syncCalendario", "updatedAt" = now()`,
    [userId, activo]
  );
}

/**
 * Guarda una actividad. Idempotente: si ya estaba, no hace nada y no toca el
 * evento de calendario que pudiera existir.
 */
export async function guardar(
  userId: string,
  sesionId: string,
  cabeceras: Headers
): Promise<FilaGuardada | null> {
  exigirBd();
  const sesion = sesionPorId(sesionId);
  if (!sesion) return null;

  const dia = sesion.dia;

  const insertadas = await consulta<{ id: string }>(
    `insert into "sesion_guardada" ("id", "userId", "sesionId", "dia")
     values ($1, $2, $3, $4)
     on conflict ("userId", "sesionId") do nothing
     returning "id"`,
    [randomUUID(), userId, sesionId, dia]
  );

  // `do nothing` no devuelve filas: ya estaba guardada y no hay nada más que hacer.
  if (insertadas.length === 0) {
    const yaEstaba = await consulta<FilaGuardada>(
      `select "sesionId", "dia", "eventoGoogleId" from "sesion_guardada"
        where "userId" = $1 and "sesionId" = $2`,
      [userId, sesionId]
    );
    return yaEstaba[0] ?? null;
  }

  let eventoGoogleId: string | null = null;

  if (!sesion.permanente && (await quiereCalendario(userId))) {
    const acceso = await accesoGoogle(cabeceras, userId);
    if (acceso?.tieneCalendario) {
      eventoGoogleId = await crearEvento(acceso.token, sesion, dia);
      if (eventoGoogleId) {
        await consulta(
          `update "sesion_guardada" set "eventoGoogleId" = $1
            where "userId" = $2 and "sesionId" = $3`,
          [eventoGoogleId, userId, sesionId]
        );
      }
    }
  }

  return { sesionId, dia, eventoGoogleId };
}

/** Quita una actividad y, si tenía evento en Google, lo retira también. */
export async function quitar(
  userId: string,
  sesionId: string,
  cabeceras: Headers
): Promise<void> {
  exigirBd();

  const filas = await consulta<{ eventoGoogleId: string | null }>(
    `delete from "sesion_guardada"
      where "userId" = $1 and "sesionId" = $2
      returning "eventoGoogleId"`,
    [userId, sesionId]
  );

  const eventoId = filas[0]?.eventoGoogleId;
  if (!eventoId) return;

  const acceso = await accesoGoogle(cabeceras, userId);
  if (acceso?.tieneCalendario) await borrarEvento(acceso.token, eventoId);
}

/**
 * Pone el calendario al día con lo ya guardado: crea los eventos que faltan al
 * encender el interruptor, y los retira todos al apagarlo.
 *
 * Devuelve cuántos eventos cambiaron, para poder decirlo en la interfaz en vez de
 * dejar a la persona adivinando si funcionó.
 */
export async function sincronizarCalendario(
  userId: string,
  activo: boolean,
  cabeceras: Headers
): Promise<{ cambiados: number; sinPermiso: boolean }> {
  exigirBd();

  const acceso = await accesoGoogle(cabeceras, userId);
  if (!acceso?.tieneCalendario) return { cambiados: 0, sinPermiso: true };

  const filas = await listar(userId);
  let cambiados = 0;

  if (activo) {
    for (const fila of filas) {
      if (fila.eventoGoogleId) continue;
      const sesion = sesionPorId(fila.sesionId);
      if (!sesion || sesion.permanente) continue;

      const eventoId = await crearEvento(acceso.token, sesion, fila.dia);
      if (!eventoId) continue;

      await consulta(
        `update "sesion_guardada" set "eventoGoogleId" = $1
          where "userId" = $2 and "sesionId" = $3`,
        [eventoId, userId, fila.sesionId]
      );
      cambiados++;
    }
  } else {
    for (const fila of filas) {
      if (!fila.eventoGoogleId) continue;
      await borrarEvento(acceso.token, fila.eventoGoogleId);
      await consulta(
        `update "sesion_guardada" set "eventoGoogleId" = null
          where "userId" = $1 and "sesionId" = $2`,
        [userId, fila.sesionId]
      );
      cambiados++;
    }
  }

  return { cambiados, sinPermiso: false };
}
