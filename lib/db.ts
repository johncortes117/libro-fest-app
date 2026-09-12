import { Pool } from "@neondatabase/serverless";

/**
 * La conexión a Neon.
 *
 * El pool se construye siempre, incluso sin `DATABASE_URL`, porque
 * `next build` importa este módulo para prerenderizar las 188 fichas de sesión y
 * no debe caerse por una variable de entorno que solo hace falta en tiempo de
 * ejecución. Sin URL configurada, `HAY_BD` es `false` y las rutas que tocan la
 * base responden con un error legible en vez de un fallo de conexión.
 */
const URL_BD = process.env.DATABASE_URL ?? "";

export const HAY_BD = URL_BD.length > 0;

/**
 * Todo lo que hace falta para que alguien pueda entrar y guardar. Sin el secreto,
 * Better Auth lanza desde dentro de su propia inicialización y el fallo llega como
 * una promesa sin capturar en vez de como una respuesta que la interfaz entienda.
 */
export const AUTH_CONFIGURADO = HAY_BD && Boolean(process.env.BETTER_AUTH_SECRET);

export const pool = new Pool({
  connectionString: URL_BD || "postgresql://sin-configurar@localhost:5432/sin-configurar",
});

/** Consulta parametrizada. Nunca interpolar valores en la cadena SQL. */
export async function consulta<T>(texto: string, valores: unknown[] = []): Promise<T[]> {
  const r = await pool.query(texto, valores);
  return r.rows as T[];
}
