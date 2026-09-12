import Link from "next/link";
import { notFound } from "next/navigation";
import { LUGARES, porId } from "@/data/lugares";
import { CUENTA_POR_LUGAR, EDITORIALES, sesionesDe } from "@/lib/datos";
import { hhmm } from "@/lib/tiempo";
import { DIAS } from "@/lib/tipos";
import ListaSesiones from "@/components/ListaSesiones";
import { IconoInfo, IconoMapa, IconoVolver } from "@/components/Iconos";

export function generateStaticParams() {
  return LUGARES.map((l) => ({ id: l.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lugar = porId.get(id);
  if (!lugar) return { title: "Lugar no encontrado" };

  const cuantas = CUENTA_POR_LUGAR[lugar.id] ?? 0;
  const donde = lugar.fuera
    ? `${lugar.fuera.ciudad}, ${lugar.fuera.pais}`
    : `punto ${lugar.pin} del campus de la UPEC`;

  return {
    title: lugar.nombre,
    description: `${lugar.descripcion}. ${cuantas} actividades del UPEC Libro Fest 2026 en ${donde}.`,
    openGraph: { title: lugar.nombre, description: lugar.descripcion },
  };
}

export default async function FichaLugar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lugar = porId.get(id);
  if (!lugar) notFound();

  const porDia = DIAS.map((d) => ({
    dia: d,
    sesiones: sesionesDe(d.fecha)
      .filter((s) => s.lugarId === lugar.id)
      .sort((a, b) => Number(a.permanente ?? false) - Number(b.permanente ?? false) || a.inicio - b.inicio),
  }));

  const total = porDia.reduce((n, d) => n + d.sesiones.length, 0);
  const primera = porDia.flatMap((d) => d.sesiones).filter((s) => !s.permanente)[0];

  /* La muestra editorial es lo que más gente busca de este edificio, y hasta ahora
     tenía una pestaña propia en la navegación para una lista de nombres. Vive aquí,
     que es donde están los sellos. */
  const esMuestraEditorial = lugar.id === "centro-convenciones";

  return (
    <div className="pagina">
      <Link href="/mapa/" className="migaja">
        <IconoVolver aria-hidden />
        Mapa
      </Link>

      <header>
        <div className="sesion-donde" style={{ marginBottom: 10 }}>
          {lugar.pin != null && <span className="pin-num">{lugar.pin}</span>}
          {lugar.fuera && (
            <span className="marca-aviso">
              {lugar.fuera.ciudad}, {lugar.fuera.pais}
            </span>
          )}
          {lugar.porConfirmar && <span className="marca-aviso">sala por confirmar</span>}
        </div>

        <h1 className="titulo-pagina">{lugar.nombre}</h1>
        <p className="entradilla">{lugar.descripcion}</p>

        {lugar.nota && (
          <p className="aviso" style={{ marginTop: 14 }}>
            <IconoInfo />
            <span>
              {lugar.nota} <Link href="/datos/">Más sobre los datos</Link>
            </span>
          </p>
        )}
      </header>

      <div className="botonera">
        {lugar.pin != null && (
          <Link href="/mapa/" className="boton primario">
            <IconoMapa aria-hidden />
            Ver el punto {lugar.pin} en el mapa
          </Link>
        )}
        {lugar.fuera && (
          <a href={lugar.fuera.maps} target="_blank" rel="noreferrer" className="boton primario">
            <IconoMapa aria-hidden />
            Abrir en Google Maps
          </a>
        )}
      </div>

      <div className="heroe-resumen">
        <div className="resumen-dato">
          <span className="v">{total}</span>
          <span className="l">actividades en los cinco días</span>
        </div>
        <div className="resumen-dato">
          <span className="v">{porDia.filter((d) => d.sesiones.length > 0).length}</span>
          <span className="l">días con programación</span>
        </div>
        {primera && (
          <div className="resumen-dato">
            <span className="v">{hhmm(primera.inicio)}</span>
            <span className="l">primera sesión de la semana</span>
          </div>
        )}
      </div>

      {esMuestraEditorial && (
        <section className="bloque" id="editoriales">
          <div className="bloque-cabecera">
            <h2>Muestra editorial</h2>
            <span className="cuenta">{EDITORIALES.length}</span>
          </div>
          <p className="entradilla" style={{ marginTop: 0 }}>
            Sellos de Ecuador, Colombia y fuera de la región, en el salón del primer piso. Abierta
            los cinco días desde las 08:30. Los emprendimientos están aparte, en la Plaza Roja y el
            Coliseo.
          </p>
          <details className="desplegable">
            <summary>Ver las {EDITORIALES.length} editoriales y librerías</summary>
            <ol className="editoriales">
              {EDITORIALES.map((nombre, i) => (
                <li key={nombre}>
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{nombre}</span>
                </li>
              ))}
            </ol>
          </details>
        </section>
      )}

      {porDia.map(({ dia, sesiones }) => (
        <section className="bloque" key={dia.fecha}>
          <div className="bloque-cabecera">
            <h2>{dia.nombre}</h2>
            {sesiones.length > 0 && <span className="cuenta">{sesiones.length}</span>}
          </div>
          <ListaSesiones sesiones={sesiones} vacio={`Sin programación el ${dia.nombre.toLowerCase()}.`} />
        </section>
      ))}
    </div>
  );
}
