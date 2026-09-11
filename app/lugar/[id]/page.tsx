import Link from "next/link";
import { notFound } from "next/navigation";
import { LUGARES, porId } from "@/data/lugares";
import { CUENTA_POR_LUGAR, sesionesDe } from "@/lib/datos";
import { hhmm } from "@/lib/tiempo";
import { DIAS } from "@/lib/tipos";
import ListaSesiones from "@/components/ListaSesiones";
import { IconoMapa, IconoVolver } from "@/components/Iconos";

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

  return (
    <div className="pagina">
      <Link href="/mapa/" className="eyebrow" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <IconoVolver aria-hidden style={{ width: 13, height: 13 }} />
        Mapa
      </Link>

      <header>
        <div className="fila-meta" style={{ marginBottom: 8 }}>
          {lugar.pin != null && <span className="chip chip-pin">{lugar.pin}</span>}
          {lugar.fuera && (
            <span className="chip chip-aviso">
              {lugar.fuera.ciudad}, {lugar.fuera.pais}
            </span>
          )}
          {lugar.porConfirmar && <span className="chip chip-aviso">sala por confirmar</span>}
        </div>

        <h1 className="titulo-pagina">{lugar.nombre}</h1>
        <p className="entradilla">{lugar.descripcion}</p>

        {lugar.nota && (
          <p className="aviso" style={{ marginTop: 14 }}>
            <span className="etiqueta">Ojo</span>
            <span>{lugar.nota}</span>
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

      <div className="cifras">
        <div className="cifra">
          <span className="v">{total}</span>
          <span className="l">actividades en los cinco días</span>
        </div>
        <div className="cifra">
          <span className="v">{porDia.filter((d) => d.sesiones.length > 0).length}</span>
          <span className="l">días con programación</span>
        </div>
        {primera && (
          <div className="cifra">
            <span className="v">{hhmm(primera.inicio)}</span>
            <span className="l">primera sesión de la semana</span>
          </div>
        )}
      </div>

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
