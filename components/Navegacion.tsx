"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGuardadas } from "@/lib/guardadas";
import { IconoAgenda, IconoGuardar, IconoMapa } from "./Iconos";

/**
 * Tres secciones.
 *
 * «Ahora» y «Agenda» se fusionaron: la página principal muestra el héroe
 * (cuenta atrás o estado en vivo) seguido de la agenda filtrable completa.
 * «Editoriales» vive dentro de la ficha del Centro de convenciones.
 *
 * La prueba que tiene que pasar una sección para estar aquí: ¿responde a una
 * pregunta que alguien se está haciendo ahora mismo, de pie, en el campus?
 */
const ENLACES = [
  { href: "/", texto: "Agenda", Icono: IconoAgenda, clave: "agenda" },
  { href: "/mapa/", texto: "Mapa", Icono: IconoMapa, clave: "mapa" },
  { href: "/mi-agenda/", texto: "Mi agenda", Icono: IconoGuardar, clave: "mi-agenda" },
];

export default function Navegacion() {
  const ruta = usePathname();
  const { ids } = useGuardadas();

  return (
    <nav className="nav" aria-label="Secciones">
      <div className="nav-fila">
        {ENLACES.map(({ href, texto, Icono, clave }) => {
          const activo = href === "/" ? ruta === "/" : ruta.startsWith(href);
          const cuantas = clave === "mi-agenda" ? ids.length : 0;

          return (
            <Link
              key={href}
              href={href}
              className={`nav-enlace nav-${clave}`}
              aria-current={activo ? "page" : undefined}
            >
              <span className="nav-icono">
                <Icono aria-hidden />
                {/* El contador es la confirmación que faltaba al guardar: se ve
                    subir desde cualquier pantalla de la aplicación. */}
                {cuantas > 0 && (
                  <span className="nav-cuenta" key={cuantas}>
                    {cuantas > 99 ? "99+" : cuantas}
                  </span>
                )}
              </span>
              <span>{texto}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
