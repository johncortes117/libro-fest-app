import { redirect } from "next/navigation";

/**
 * La agenda completa ahora vive en la página principal (`/`).
 * Esta ruta se mantiene como redirect para que los enlaces existentes
 * (compartidos, favoritos, carteles) sigan funcionando.
 */
export default function Agenda() {
  redirect("/");
}
