"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * «Mi agenda» en el cliente.
 *
 * La verdad vive en el servidor —esa es la razón de que haya que entrar: la misma
 * selección tiene que aparecer en el móvil, en el portátil y en la pantalla de la
 * entrada. Pero el wifi de un campus con dos mil visitantes no aguanta, así que
 * aquí hay dos piezas más:
 *
 *  · un **espejo** en `localStorage`, que es lo que se pinta. Leer la agenda propia
 *    sigue funcionando sin conexión.
 *  · una **cola** de escrituras. Guardar nunca espera a la red: se actualiza el
 *    espejo al instante y el cambio se manda cuando se pueda. Un botón que tarda
 *    dos segundos en responder mientras alguien está de pie es un botón roto.
 *
 * El espejo se borra al cambiar de usuario. En un teléfono compartido o en la
 * pantalla táctil del campus, enseñarle a alguien la agenda de otro sería peor que
 * no tener agenda.
 */

const CLAVE_IDS = "librofest2026:guardadas";
const CLAVE_COLA = "librofest2026:cola";
const CLAVE_USUARIO = "librofest2026:usuario";
const CLAVE_PENDIENTE = "librofest2026:pendiente";

export type Accion = { tipo: "add" | "del"; sesionId: string };

export interface EstadoGuardadas {
  ids: string[];
  /** `null` mientras no se sabe si hay sesión; luego el id del usuario o `""`. */
  usuario: string | null;
  cargando: boolean;
  /** Cambios hechos sin conexión que aún no llegaron al servidor. */
  pendientes: number;
  /** La base de datos no responde o no está configurada. */
  falloServidor: boolean;
}

/* ------------------------------------------------------ almacenamiento ---- */

function leerJson<T>(clave: string, porDefecto: T): T {
  if (typeof window === "undefined") return porDefecto;
  try {
    const crudo = window.localStorage.getItem(clave);
    if (!crudo) return porDefecto;
    const valor = JSON.parse(crudo);
    return valor ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

function escribirJson(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* navegación privada o almacenamiento lleno: seguimos en memoria */
  }
}

function borrarClave(clave: string) {
  try {
    window.localStorage.removeItem(clave);
  } catch {
    /* nada que hacer */
  }
}

/* ------------------------------------------------------------- estado ---- */

let ids: string[] = [];
let cola: Accion[] = [];
let usuario: string | null = null;
let cargando = true;
let falloServidor = false;
let iniciado = false;
let enVuelo = false;

const oyentes = new Set<() => void>();
let instantanea: EstadoGuardadas = {
  ids: [],
  usuario: null,
  cargando: true,
  pendientes: 0,
  falloServidor: false,
};

function publicar() {
  // `useSyncExternalStore` exige que dos lecturas seguidas sin cambios devuelvan
  // el mismo objeto, o React entra en un bucle de renders.
  instantanea = { ids, usuario, cargando, pendientes: cola.length, falloServidor };
  for (const o of oyentes) o();
}

function hidratarDesdeDisco() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  ids = leerJson<string[]>(CLAVE_IDS, []).filter((v) => typeof v === "string");
  cola = leerJson<Accion[]>(CLAVE_COLA, []).filter(
    (a) => a && (a.tipo === "add" || a.tipo === "del") && typeof a.sesionId === "string"
  );
  publicar();
}

/* -------------------------------------------------------------- red ------ */

/** Manda la cola entera en una petición. Silencioso: los fallos se reintentan. */
async function vaciarCola() {
  if (enVuelo || typeof window === "undefined") return;
  if (!usuario) return;
  if (cola.length === 0) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;

  enVuelo = true;
  const enviadas = cola.slice();

  try {
    const r = await fetch("/api/guardadas/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acciones: enviadas }),
    });

    if (r.status === 401) {
      // La sesión caducó. Se conserva la cola: al volver a entrar se aplica.
      usuario = null;
      publicar();
      return;
    }
    if (!r.ok) {
      falloServidor = r.status === 503;
      publicar();
      return;
    }

    const datos = (await r.json()) as { ids?: string[] };
    // Quitamos solo lo que iba en este envío: si alguien tocó otro botón mientras
    // la petición estaba en vuelo, ese cambio sigue en la cola.
    cola = cola.slice(enviadas.length);
    escribirJson(CLAVE_COLA, cola);

    if (Array.isArray(datos.ids) && cola.length === 0) {
      ids = datos.ids;
      escribirJson(CLAVE_IDS, ids);
    }
    falloServidor = false;
    publicar();
  } catch {
    // Sin red. La cola se queda como está y se reintenta al volver «online».
  } finally {
    enVuelo = false;
    if (cola.length > 0 && typeof navigator !== "undefined" && navigator.onLine !== false) {
      void vaciarCola();
    }
  }
}

async function traerDelServidor() {
  if (!usuario) return;
  try {
    const r = await fetch("/api/guardadas/", { cache: "no-store" });
    if (r.status === 401) {
      usuario = null;
      publicar();
      return;
    }
    if (r.status === 503) {
      falloServidor = true;
      publicar();
      return;
    }
    if (!r.ok) return;

    const datos = (await r.json()) as { ids?: string[] };
    if (Array.isArray(datos.ids)) {
      // Si hay cola pendiente, el servidor va por detrás: mandamos primero y
      // dejamos que la respuesta del lote fije la lista.
      if (cola.length === 0) {
        ids = datos.ids;
        escribirJson(CLAVE_IDS, ids);
      }
      falloServidor = false;
      publicar();
    }
  } catch {
    /* sin red: nos quedamos con el espejo */
  }
}

/* ------------------------------------------------- ciclo de vida de sesión */

/**
 * Lo llama `<SincronizadorGuardadas>` cada vez que cambia la sesión.
 *
 * `null` significa «todavía no se sabe»; `""`, «no hay nadie dentro».
 */
export function configurarUsuario(nuevo: string | null) {
  hidratarDesdeDisco();
  if (nuevo === null) return;

  const anterior = leerJson<string | null>(CLAVE_USUARIO, null);

  if (nuevo === "") {
    // Sesión cerrada: el espejo se va con ella. Lo que no llegó a mandarse se
    // conserva para aplicarlo si la misma persona vuelve a entrar.
    if (usuario !== "" || ids.length > 0) {
      usuario = "";
      ids = [];
      cargando = false;
      borrarClave(CLAVE_IDS);
      borrarClave(CLAVE_USUARIO);
      publicar();
    } else if (cargando) {
      usuario = "";
      cargando = false;
      publicar();
    }
    return;
  }

  if (anterior && anterior !== nuevo) {
    // Otro usuario en el mismo navegador: fuera el espejo y fuera la cola, que
    // pertenecía a la cuenta anterior.
    ids = [];
    cola = [];
    borrarClave(CLAVE_IDS);
    borrarClave(CLAVE_COLA);
  }

  const cambio = usuario !== nuevo;
  usuario = nuevo;
  escribirJson(CLAVE_USUARIO, nuevo);

  if (cambio) {
    cargando = true;
    publicar();
    void (async () => {
      await vaciarCola();
      await traerDelServidor();
      aplicarPendiente();
      cargando = false;
      publicar();
    })();
  }
}

/* ----------------------------------------------------- guardado pendiente */

/**
 * Quien toca «guardar» sin haber entrado no pierde el gesto: se anota, se le manda
 * a Google, y al volver la actividad ya está en su agenda. Obligar a repetir el
 * toque después de un viaje de ida y vuelta por el navegador es donde se pierde
 * a la gente.
 */
export function anotarPendiente(sesionId: string) {
  escribirJson(CLAVE_PENDIENTE, sesionId);
}

function aplicarPendiente() {
  const pendiente = leerJson<string | null>(CLAVE_PENDIENTE, null);
  if (!pendiente || typeof pendiente !== "string") return;
  borrarClave(CLAVE_PENDIENTE);
  if (ids.includes(pendiente)) return;
  encolar({ tipo: "add", sesionId: pendiente });
}

/* ---------------------------------------------------------- operaciones --- */

function encolar(accion: Accion) {
  if (accion.tipo === "add") {
    if (!ids.includes(accion.sesionId)) ids = [...ids, accion.sesionId];
  } else {
    ids = ids.filter((x) => x !== accion.sesionId);
  }
  cola = [...cola, accion];

  escribirJson(CLAVE_IDS, ids);
  escribirJson(CLAVE_COLA, cola);
  publicar();
  void vaciarCola();
}

export type ResultadoAlternar = "guardada" | "quitada" | "necesita-entrar";

function alternarId(sesionId: string): ResultadoAlternar {
  hidratarDesdeDisco();

  if (!usuario) {
    anotarPendiente(sesionId);
    return "necesita-entrar";
  }

  const estaba = ids.includes(sesionId);
  encolar({ tipo: estaba ? "del" : "add", sesionId });
  return estaba ? "quitada" : "guardada";
}

function vaciarTodo() {
  if (!usuario) return;
  const anteriores = ids.slice();
  for (const id of anteriores) cola = [...cola, { tipo: "del" as const, sesionId: id }];
  ids = [];
  escribirJson(CLAVE_IDS, ids);
  escribirJson(CLAVE_COLA, cola);
  publicar();
  void vaciarCola();
}

/** Devuelve lo borrado para poder ofrecer «deshacer». */
function restaurar(anteriores: string[]) {
  if (!usuario) return;
  for (const id of anteriores) {
    if (!ids.includes(id)) encolar({ tipo: "add", sesionId: id });
  }
}

/* ------------------------------------------------------------- el hook ---- */

function suscribir(alCambiar: () => void) {
  hidratarDesdeDisco();
  oyentes.add(alCambiar);

  const otraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE_IDS) {
      ids = leerJson<string[]>(CLAVE_IDS, []);
      publicar();
    }
  };
  const alVolverLaRed = () => void vaciarCola();

  window.addEventListener("storage", otraPestana);
  window.addEventListener("online", alVolverLaRed);

  return () => {
    oyentes.delete(alCambiar);
    window.removeEventListener("storage", otraPestana);
    window.removeEventListener("online", alVolverLaRed);
  };
}

const VACIO: EstadoGuardadas = {
  ids: [],
  usuario: null,
  cargando: true,
  pendientes: 0,
  falloServidor: false,
};

export function useGuardadas() {
  const estado = useSyncExternalStore(suscribir, () => instantanea, () => VACIO);

  const alternar = useCallback((id: string) => alternarId(id), []);
  const contiene = useCallback((id: string) => estado.ids.includes(id), [estado.ids]);
  const vaciar = useCallback(() => vaciarTodo(), []);
  const deshacerVaciado = useCallback((anteriores: string[]) => restaurar(anteriores), []);

  return {
    ids: estado.ids,
    cargando: estado.cargando,
    pendientes: estado.pendientes,
    falloServidor: estado.falloServidor,
    haEntrado: Boolean(estado.usuario),
    sesionResuelta: estado.usuario !== null,
    alternar,
    contiene,
    vaciar,
    deshacerVaciado,
  };
}
