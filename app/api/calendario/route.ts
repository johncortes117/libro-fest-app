import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fijarCalendario, sincronizarCalendario, SinBaseDeDatos } from "@/lib/guardadas-servidor";
import { AUTH_CONFIGURADO } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * El interruptor de «añadir a mi Google Calendar».
 *
 * Encenderlo crea los eventos de todo lo que ya estaba guardado; apagarlo los
 * retira. Las dos direcciones importan: dejar eventos huérfanos en el calendario
 * de alguien que apagó la sincronización sería el peor final posible de esta
 * función.
 */
export async function POST(peticion: Request) {
  try {
    const cabeceras = await headers();
    if (!AUTH_CONFIGURADO) throw new SinBaseDeDatos();

    const sesion = await auth.api.getSession({ headers: cabeceras }).catch(() => {
      throw new SinBaseDeDatos();
    });
    const userId = sesion?.user.id;
    if (!userId) return NextResponse.json({ error: "sin-sesion" }, { status: 401 });

    const cuerpo = (await peticion.json()) as { activo?: unknown };
    const activo = cuerpo.activo === true;

    const resultado = await sincronizarCalendario(userId, activo, cabeceras);

    // Si falta el permiso de calendario no se guarda la preferencia: dejarla en
    // «encendido» sin poder escribir haría que la interfaz mintiera.
    if (resultado.sinPermiso) {
      return NextResponse.json({ error: "sin-permiso-calendario" }, { status: 403 });
    }

    await fijarCalendario(userId, activo);

    return NextResponse.json(
      { activo, cambiados: resultado.cambiados },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (e) {
    if (e instanceof SinBaseDeDatos) {
      return NextResponse.json({ error: "sin-base-de-datos" }, { status: 503 });
    }
    console.error("[calendario]", e);
    return NextResponse.json({ error: "fallo-servidor" }, { status: 500 });
  }
}
