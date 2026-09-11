import Link from "next/link";
import { notFound } from "next/navigation";
import { porId as lugarPorId } from "@/data/lugares";
import { PERMANENTES, SESIONES, sesionPorId, sesionesDe } from "@/lib/datos";
import { diaDe, hhmm } from "@/lib/tiempo";
import { TIPOS } from "@/lib/tipos";
import AccionesSesion from "@/components/AccionesSesion";
import ListaSesiones from "@/components/ListaSesiones";
import Avisos from "@/components/Avisos";
import { IconoVolver } from "@/components/Iconos";

/** Una página estática por sesión: 188 archivos HTML, ninguno con servidor detrás. */
export function generateStaticParams() {
  return [...SESIONES, ...PERMANENTES].map((s) => ({ id: s.id }));
}

export const dynamicParams = false;

function descripcion(id: string): string {
  const s = sesionPorId(id);
  if (!s) return "";
  const lugar = lugarPorId.get(s.lugarId);
  const dia = diaDe(s.dia);
  const cuando = s.permanente
    ? "Abierto los cinco días desde las 08:30"
    : `${dia?.nombre ?? s.dia}, ${hhmm(s.inicio)}–${hhmm(s.fin)}`;
  const donde = lugar ? (lugar.pin != null ? `${lugar.nombre} (punto ${lugar.pin})` : lugar.nombre) : s.lugarTexto;
  const quien = s.personas.length ? ` · ${s.personas.join(", ")}` : s.detalle ? ` · ${s.detalle}` : "";
  return `${cuando} · ${donde}${quien}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = sesionPorId(id);
  if (!s) return { title: "Sesión no encontrada" };

  const desc = descripcion(id);
  return {
    title: s.titulo,
    description: desc,
    openGraph: { title: s.titulo, description: desc, type: "article" },
  };
}

export default async function FichaSesion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesion = sesionPorId(id);
  if (!sesion) notFound();

  const lugar = lugarPorId.get(sesion.lugarId);
  const dia = diaDe(sesion.dia);
  const tipo = TIPOS[sesion.tipo];

  /* Lo que se pisa con esta sesión: el problema real del festival, resuelto en la
     propia ficha en vez de obligar a volver a la agenda y comparar a mano. */
  const alMismoTiempo = sesion.permanente
    ? []
    : sesionesDe(sesion.dia, false)
        .filter((s) => s.id !== sesion.id && s.inicio < sesion.fin && s.fin > sesion.inicio)
        .sort((a, b) => a.inicio - b.inicio);

  const mismoLugar = sesion.permanente
    ? []
    : sesionesDe(sesion.dia, false)
        .filter((s) => s.id !== sesion.id && s.lugarId === sesion.lugarId)
        .sort((a, b) => a.inicio - b.inicio);

  return (
    <div className="pagina">
      <Avisos sesionId={sesion.id} />

      <Link href="/agenda/" className="eyebrow" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <IconoVolver aria-hidden style={{ width: 13, height: 13 }} />
        Agenda
      </Link>

      <article className="ficha">
        <header className="ficha-cabecera">
          <div className="fila-meta">
            <span
              className="chip chip-tipo"
              style={
                {
                  "--color-tipo": `var(--t-${sesion.tipo})`,
                  "--fondo-tipo": `var(--t-${sesion.tipo}-soft)`,
                } as React.CSSProperties
              }
            >
              {tipo.nombre}
            </span>
            {sesion.permanente && <span className="chip chip-aviso">los cinco días</span>}
          </div>

          <h1>{sesion.titulo}</h1>
          {sesion.detalle && <p className="entradilla">{sesion.detalle}</p>}

          {sesion.truncado && (
            <p className="nota">
              <span>
                El título viene cortado en la agenda oficial. Lo mostramos tal cual llega, sin
                completarlo por nuestra cuenta.
              </span>
            </p>
          )}
        </header>

        <AccionesSesion sesion={sesion} />

        <dl className="datos">
          <div className="dato">
            <dt>Cuándo</dt>
            <dd>
              {sesion.permanente ? (
                <>
                  Del lunes 21 al viernes 25, desde las {hhmm(sesion.inicio)}
                  <br />
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                    La agenda oficial no indica hora de cierre. Mostramos las {hhmm(sesion.fin)} como
                    estimación.
                  </span>
                </>
              ) : (
                <>
                  {dia?.nombre} de septiembre · {hhmm(sesion.inicio)} – {hhmm(sesion.fin)}
                </>
              )}
            </dd>
          </div>

          <div className="dato">
            <dt>Dónde</dt>
            <dd>
              {lugar ? (
                <>
                  <Link href={`/lugar/${lugar.id}/`} style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>
                    {lugar.nombre}
                  </Link>
                  {lugar.pin != null && (
                    <>
                      {" "}
                      <span className="chip chip-pin">{lugar.pin}</span>{" "}
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>en el mapa del campus</span>
                    </>
                  )}
                  {lugar.fuera && (
                    <>
                      <br />
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Fuera del campus · {lugar.fuera.ciudad}, {lugar.fuera.pais} ·{" "}
                        <a href={lugar.fuera.maps} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                          abrir en Google Maps
                        </a>
                      </span>
                    </>
                  )}
                  {lugar.porConfirmar && (
                    <>
                      <br />
                      <span className="chip chip-aviso" style={{ marginTop: 6 }}>
                        sala por confirmar
                      </span>
                      <br />
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{lugar.nota}</span>
                    </>
                  )}
                </>
              ) : (
                sesion.lugarTexto
              )}
            </dd>
          </div>

          {sesion.personas.length > 0 && (
            <div className="dato">
              <dt>{sesion.tipo === "libro" ? "Autoría" : "Participan"}</dt>
              <dd>{sesion.personas.join(" · ")}</dd>
            </div>
          )}

          <div className="dato">
            <dt>En la agenda</dt>
            <dd style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              Aparece como «{sesion.lugarTexto}» en la agenda oficial de la UPEC.
            </dd>
          </div>
        </dl>

        {alMismoTiempo.length > 0 && (
          <section className="bloque">
            <div className="bloque-cabecera">
              <h2>Al mismo tiempo</h2>
              <span className="cuenta">{alMismoTiempo.length}</span>
            </div>
            <p className="entradilla" style={{ marginTop: 0 }}>
              Lo que se solapa con esta sesión, para que decidas antes de cruzar el campus.
            </p>
            <ListaSesiones sesiones={alMismoTiempo} />
          </section>
        )}

        {mismoLugar.length > 0 && (
          <section className="bloque">
            <div className="bloque-cabecera">
              <h2>Ese día, en {lugar?.nombre ?? sesion.lugarTexto}</h2>
              <span className="cuenta">{mismoLugar.length}</span>
            </div>
            <ListaSesiones sesiones={mismoLugar} />
          </section>
        )}
      </article>
    </div>
  );
}
