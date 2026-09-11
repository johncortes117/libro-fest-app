import QRCode from "qrcode";
import { LUGARES_CAMPUS, LUGARES_FUERA } from "@/data/lugares";
import { CIFRAS, CUENTA_POR_LUGAR } from "@/lib/datos";
import { SITIO } from "@/lib/sitio";

export const metadata = {
  title: "Carteles para imprimir",
  description: "Un cartel A4 por edificio, con un código QR que abre la programación de ese punto del campus.",
  robots: { index: false },
};

/**
 * Los carteles que se cuelgan en cada edificio.
 *
 * Sin señalética física, un sitio web dentro de un campus es invisible: la gente no
 * lo busca, se lo tiene que encontrar donde ya está parada. Cada QR abre
 * directamente la programación de ese punto, no la portada.
 *
 * Los códigos se generan al compilar y quedan incrustados en el HTML, así que la
 * página se imprime igual sin conexión.
 */
async function qr(url: string, tamano: number) {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    width: tamano,
    color: { dark: "#14261aff", light: "#ffffff00" },
  });
}

export default async function Carteles() {
  const lugares = [...LUGARES_CAMPUS, ...LUGARES_FUERA];

  const carteles = await Promise.all(
    lugares.map(async (l) => ({
      lugar: l,
      svg: await qr(`${SITIO.url}/lugar/${l.id}/`, 420),
      cuantas: CUENTA_POR_LUGAR[l.id] ?? 0,
    }))
  );

  const general = await qr(SITIO.url, 460);

  return (
    <div className="pagina carteles-pagina">
      <header className="no-imprimir">
        <p className="eyebrow">Para imprimir y colgar · {carteles.length + 1} carteles A4</p>
        <h1 className="titulo-pagina">Carteles</h1>
        <p className="entradilla">
          Un cartel por punto del mapa. Cada código abre directamente la programación de ese
          edificio, no la portada: quien lo escanea ve lo que hay donde está parado.
        </p>
        <p className="aviso" style={{ marginTop: 16 }}>
          <span className="etiqueta">Antes</span>
          <span>
            Los códigos apuntan a <strong>{SITIO.url}</strong>. Si la dirección definitiva es otra,
            ponla en <code>NEXT_PUBLIC_SITIO</code> y vuelve a compilar antes de mandar a imprimir.
          </span>
        </p>
        <p className="nota">
          <span>Imprime desde el navegador (Ctrl+P). Cada cartel sale en su propia hoja.</span>
        </p>
      </header>

      <article className="cartel cartel-general">
        <p className="cartel-eyebrow">UPEC Libro Fest 2026 · Academia, arte y cultura</p>
        <h2>¿Qué hay ahora y dónde?</h2>
        <div className="cartel-qr" dangerouslySetInnerHTML={{ __html: general }} />
        <p className="cartel-pie">
          Escanea y mira la programación en tiempo real: {CIFRAS.total} actividades en{" "}
          {CIFRAS.lugares} lugares, del 21 al 25 de septiembre.
        </p>
        <p className="cartel-url">{SITIO.url.replace(/^https?:\/\//, "")}</p>
      </article>

      {carteles.map(({ lugar, svg, cuantas }) => (
        <article className="cartel" key={lugar.id}>
          <p className="cartel-eyebrow">UPEC Libro Fest 2026</p>

          <div className="cartel-lugar">
            {lugar.pin != null && <span className="cartel-pin">{lugar.pin}</span>}
            <h2>{lugar.nombre}</h2>
          </div>

          <p className="cartel-desc">{lugar.descripcion}</p>
          <div className="cartel-qr" dangerouslySetInnerHTML={{ __html: svg }} />

          <p className="cartel-pie">
            Escanea para ver qué hay <strong>aquí</strong> ahora y qué viene después.
            {cuantas > 0 && ` ${cuantas} actividades en este punto durante la semana.`}
          </p>
          <p className="cartel-url">{SITIO.url.replace(/^https?:\/\//, "")}</p>
        </article>
      ))}
    </div>
  );
}
