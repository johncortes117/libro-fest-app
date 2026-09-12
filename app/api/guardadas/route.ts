import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { guardar, listar, quiereCalendario, quitar, SinBaseDeDatos } from "@/lib/guardadas-servidor";
import { AUTH_CONFIGURADO } from "@/lib/db";
import { accesoGoogle } from "@/lib/calendario";

export const dynamic = "force-dynamic";

/**
 * Sin DATABASE_URL —o con Neon caído a mitad del festival— getSession lanza
 * contra la conexión. Distinguir ese caso importa: el cliente tiene una cola
 * offline que se vacía al reconectar, y solo la activa si le decimos que el fallo
 * es del servidor y no de la sesión.
 */
async function usuario() {
  const cabeceras = await headers();
  if (!AUTH_CONFIGURADO) throw new SinBaseDeDatos();
  try {
    const sesion = await auth.api.getSession({ headers: cabeceras });
    return { cabeceras, userId: sesion?.user.id ?? null };
  } catch {
    throw new SinBaseDeDatos();
  }
}

const SIN_ENTRAR = NextResponse.json({ error: "sin-sesion" }, { status: 401 });

function fallo(e: unknown) {
  if (e instanceof SinBaseDeDatos) {
    return NextResponse.json({ error: "sin-base-de-datos", detalle: e.message }, { status: 503 });
  }
  console.error("[guardadas]", e);
  return NextResponse.json({ error: "fallo-servidor" }, { status: 500 });
}

/** Lo guardado, más el estado de la sincronización con Google. */
export async function GET() {
  try {
    const { cabeceras, userId } = await usuario();
    if (!userId) return SIN_ENTRAR;

    const [filas, calendario, acceso] = await Promise.all([
      listar(userId),
      quiereCalendario(userId),
      accesoGoogle(cabeceras, userId),
    ]);

    return NextResponse.json({
      ids: filas.map((f) => f.sesionId),
      calendario,
      permisoCalendario: acceso?.tieneCalendario ?? false,
      sincronizadas: filas.filter((f) => f.eventoGoogleId).length,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return fallo(e);
  }
}

/**
 * Aplica un lote de cambios.
 *
 * Va por lotes y no por operación suelta porque el cliente acumula en una cola lo
 * que se guardó sin conexión; al recuperar red hay que vaciarla en una sola
 * petición y no en quince. Cada operación es idempotente, así que reintentar un
 * lote entero es seguro.
 */
export async function POST(peticion: Request) {
  try {
    const { cabeceras, userId } = await usuario();
    if (!userId) return SIN_ENTRAR;

    const cuerpo = (await peticion.json()) as {
      acciones?: { tipo: "add" | "del"; sesionId: string }[];
    };
    const acciones = Array.isArray(cuerpo.acciones) ? cuerpo.acciones.slice(0, 200) : [];

    for (const accion of acciones) {
      if (typeof accion?.sesionId !== "string") continue;
      if (accion.tipo === "add") await guardar(userId, accion.sesionId, cabeceras);
      else if (accion.tipo === "del") await quitar(userId, accion.sesionId, cabeceras);
    }

    const filas = await listar(userId);
    return NextResponse.json({
      ids: filas.map((f) => f.sesionId),
      sincronizadas: filas.filter((f) => f.eventoGoogleId).length,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return fallo(e);
  }
}
