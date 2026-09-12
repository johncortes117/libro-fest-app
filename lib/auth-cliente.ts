"use client";

import { createAuthClient } from "better-auth/react";
import { AMBITO_CALENDARIO } from "./ambitos";

export const clienteAuth = createAuthClient();

export const { useSession, signIn, signOut, linkSocial } = clienteAuth;

/** Entrar con Google. Solo nombre y correo: el calendario se pide aparte. */
export function entrarConGoogle(volverA?: string) {
  return signIn.social({
    provider: "google",
    callbackURL: volverA ?? window.location.pathname,
  });
}

/**
 * Pedir permiso de calendario a quien ya entró.
 *
 * `includeGrantedScopes` va activo por defecto, así que Google devuelve un token
 * que cubre también los permisos de la primera vez: no se pierde el acceso básico
 * al añadir el de calendario.
 */
export function conectarCalendario(volverA?: string) {
  return linkSocial({
    provider: "google",
    scopes: [AMBITO_CALENDARIO],
    callbackURL: volverA ?? window.location.pathname,
  });
}
