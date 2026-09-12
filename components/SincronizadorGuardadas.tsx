"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-cliente";
import { configurarUsuario } from "@/lib/guardadas";

/**
 * El puente entre la sesión de Better Auth y el almacén de «Mi agenda».
 *
 * Va montado una sola vez en el armazón. Cuando la sesión se resuelve, le dice al
 * almacén de quién es el espejo local: eso dispara la descarga de lo guardado, el
 * vaciado de la cola pendiente y —si alguien tocó «guardar» antes de entrar— la
 * aplicación de ese gesto.
 */
export default function SincronizadorGuardadas() {
  const { data, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    configurarUsuario(data?.user?.id ?? "");
  }, [data?.user?.id, isPending]);

  return null;
}
