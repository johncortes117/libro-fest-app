"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * «Mi agenda» vive solo en el teléfono de quien la usa.
 *
 * Sin cuentas, sin servidor y sin base de datos: en un evento con público infantil,
 * no recoger datos personales es la decisión correcta y además no hay nada que
 * mantener durante los cinco días del festival.
 */
const CLAVE = "librofest2026:guardadas";

let cache: string[] = [];
let cacheCruda: string | null = null;
const oyentes = new Set<() => void>();

function leer(): string[] {
  if (typeof window === "undefined") return [];
  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(CLAVE);
  } catch {
    // Navegación privada o almacenamiento bloqueado: se sigue sin guardar nada.
    return cache;
  }
  // `useSyncExternalStore` exige que la misma lectura devuelva el mismo objeto,
  // o React entra en un bucle de renders.
  if (crudo !== cacheCruda) {
    cacheCruda = crudo;
    try {
      const valor = crudo ? JSON.parse(crudo) : [];
      cache = Array.isArray(valor) ? valor.filter((v) => typeof v === "string") : [];
    } catch {
      cache = [];
    }
  }
  return cache;
}

function escribir(ids: string[]) {
  cache = ids;
  cacheCruda = JSON.stringify(ids);
  try {
    window.localStorage.setItem(CLAVE, cacheCruda);
  } catch {
    // Si el almacenamiento falla, la sesión sigue funcionando en memoria.
  }
  for (const o of oyentes) o();
}

function suscribir(alCambiar: () => void) {
  oyentes.add(alCambiar);
  // Mantiene sincronizadas dos pestañas abiertas a la vez.
  const enOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE) {
      cacheCruda = null;
      alCambiar();
    }
  };
  window.addEventListener("storage", enOtraPestana);
  return () => {
    oyentes.delete(alCambiar);
    window.removeEventListener("storage", enOtraPestana);
  };
}

const VACIO: string[] = [];

export function useGuardadas() {
  const ids = useSyncExternalStore(suscribir, leer, () => VACIO);

  const alternar = useCallback((id: string) => {
    const actuales = leer();
    escribir(actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id]);
  }, []);

  const contiene = useCallback((id: string) => ids.includes(id), [ids]);

  const vaciar = useCallback(() => escribir([]), []);

  return { ids, alternar, contiene, vaciar };
}
