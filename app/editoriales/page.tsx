import { redirect } from "next/navigation";

/**
 * «Editoriales» ya no es una sección propia.
 *
 * Eran 29 nombres sin número de estand, sin horario y sin valor de orientación,
 * ocupando el 20 % de la barra de navegación. Ahora viven dentro de la ficha del
 * Centro de convenciones, que es donde esos sellos están físicamente.
 *
 * La ruta se conserva porque el enlace ya circuló: romperlo no arregla nada.
 */
export default function Editoriales() {
  redirect("/lugar/centro-convenciones/#editoriales");
}
