import Link from "next/link";
import { notFound } from "next/navigation";
import { porId as lugarPorId } from "@/data/lugares";
import { PERMANENTES, SESIONES, sesionPorId, sesionesDe } from "@/lib/datos";
import { diaDe, duracion, hhmm } from "@/lib/tiempo";
import AccionesSesion from "@/components/AccionesSesion";
import BloqueRelacionadas from "@/components/BloqueRelacionadas";
import Avisos from "@/components/Avisos";
import EtiquetaTipo from "@/components/EtiquetaTipo";
import { IconoMapa, IconoPersonas, IconoReloj, IconoVolver } from "@/components/Iconos";

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

      <Link href="/agenda/" className="migaja">
        <IconoVolver aria-hidden />
        Agenda
      </Link>

      <article className="ficha">
        <header className="ficha-cabecera">
          <EtiquetaTipo tipo={sesion.tipo} />
          <h1>
            {sesion.titulo}
            {/* El título viene cortado en la agenda oficial. El porqué está en
                /datos; aquí basta la marca y el «title» del navegador. */}
            {sesion.truncado && (
              <span className="cortado" title="El título viene cortado en la agenda oficial">
                {" "}
                […]
              </span>
            )}
          </h1>
          {sesion.detalle && <p className="entradilla" style={{ marginTop: 0 }}>{sesion.detalle}</p>}
        </header>

        <AccionesSesion sesion={sesion} />

        <dl className="datos">
          <div className="dato">
            <IconoReloj />
            <div>
              <dt>Cuándo</dt>
              <dd>
                {sesion.permanente ? (
                  <>
                    Los cinco días, {hhmm(sesion.inicio)} – <span title="La agenda oficial no indica hora de cierre; 18:00 es una estimación nuestra.">~{hhmm(sesion.fin)}</span>
                  </>
                ) : (
                  <>
                    {dia?.nombre} de septiembre · {hhmm(sesion.inicio)} – {hhmm(sesion.fin)}
                    <span className="secundario">Dura {duracion(sesion.fin - sesion.inicio)}</span>
                  </>
                )}
              </dd>
            </div>
          </div>

          <div className="dato">
            <IconoMapa />
            <div>
              <dt>Dónde</dt>
              <dd>
                {lugar ? (
                  <>
                    {lugar.pin != null && (
                      <span className="pin-num" style={{ display: "inline-grid", verticalAlign: "-4px", marginRight: 6 }}>
                        {lugar.pin}
                      </span>
                    )}
                    <Link href={`/lugar/${lugar.id}/`}>{lugar.nombre}</Link>

                    {lugar.fuera && (
                      <span className="secundario">
                        Fuera del campus · {lugar.fuera.ciudad}, {lugar.fuera.pais} ·{" "}
                        <a href={lugar.fuera.maps} target="_blank" rel="noreferrer">
                          abrir en Google Maps
                        </a>
                      </span>
                    )}

                    {/* La única advertencia que sobrevive en la ficha, porque es la
                        única que cambia adónde tiene que ir una persona. */}
                    {lugar.porConfirmar && (
                      <span className="secundario">
                        <span className="marca-aviso">sala por confirmar</span>{" "}
                        <Link href="/datos/">por qué</Link>
                      </span>
                    )}
                  </>
                ) : (
                  sesion.lugarTexto
                )}
              </dd>
            </div>
          </div>

          {sesion.personas.length > 0 && (
            <div className="dato">
              <IconoPersonas />
              <div>
                <dt>{sesion.tipo === "libro" ? "Autoría" : "Participan"}</dt>
                <dd>{sesion.personas.join(" · ")}</dd>
              </div>
            </div>
          )}
        </dl>

        <BloqueRelacionadas
          alMismoTiempo={alMismoTiempo}
          mismoLugar={mismoLugar}
          dia={sesion.dia}
          lugarId={sesion.lugarId}
          nombreLugar={lugar?.nombre ?? sesion.lugarTexto}
        />
      </article>
    </div>
  );
}
