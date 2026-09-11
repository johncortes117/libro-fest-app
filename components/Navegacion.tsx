"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoAgenda, IconoAhora, IconoGuardar, IconoLibros, IconoMapa } from "./Iconos";

const ENLACES = [
  { href: "/", texto: "Ahora", Icono: IconoAhora },
  { href: "/agenda/", texto: "Agenda", Icono: IconoAgenda },
  { href: "/mapa/", texto: "Mapa", Icono: IconoMapa },
  { href: "/mi-agenda/", texto: "Mi agenda", Icono: IconoGuardar },
  { href: "/editoriales/", texto: "Editoriales", Icono: IconoLibros },
];

export default function Navegacion() {
  const ruta = usePathname();

  return (
    <nav className="nav" aria-label="Secciones">
      <div className="nav-fila">
        {ENLACES.map(({ href, texto, Icono }) => {
          const activo = href === "/" ? ruta === "/" : ruta.startsWith(href);
          return (
            <Link key={href} href={href} className="nav-enlace" aria-current={activo ? "page" : undefined}>
              <Icono aria-hidden />
              <span>{texto}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
