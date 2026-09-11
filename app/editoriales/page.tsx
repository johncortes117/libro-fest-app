import Link from "next/link";
import { EDITORIALES } from "@/lib/datos";
import { porId } from "@/data/lugares";
import { IconoMapa } from "@/components/Iconos";

export const metadata = {
  title: "Editoriales y librerías",
  description:
    "Las 29 editoriales y librerías de Ecuador, Colombia y más allá presentes en la muestra editorial del UPEC Libro Fest 2026.",
};

export default function Editoriales() {
  const centro = porId.get("centro-convenciones")!;

  return (
    <div className="pagina">
      <header>
        <p className="eyebrow">Muestra editorial · los cinco días desde las 08:30</p>
        <h1 className="titulo-pagina">Editoriales y librerías</h1>
        <p className="entradilla">
          {EDITORIALES.length} sellos de Ecuador, Colombia y fuera de la región, reunidos en el salón
          del primer piso del centro de convenciones. Los emprendimientos están aparte, en la Plaza
          Roja y el Coliseo.
        </p>
      </header>

      <div className="botonera">
        <Link href={`/lugar/${centro.id}/`} className="boton primario">
          <IconoMapa aria-hidden />
          Punto {centro.pin} · {centro.nombre}
        </Link>
      </div>

      <ol className="editoriales">
        {EDITORIALES.map((nombre, i) => (
          <li key={nombre}>
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <span>{nombre}</span>
          </li>
        ))}
      </ol>

      <p className="nota">
        <span>
          La agenda oficial lista los sellos pero no asigna número de estand. Si la organización los
          publica, se añaden aquí.
        </span>
      </p>
    </div>
  );
}
