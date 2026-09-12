import Link from "next/link";
import { CIFRAS } from "@/lib/datos";
import { IconoInfo, IconoMapa, IconoPantalla } from "@/components/Iconos";

export const metadata = {
  title: "Para la organización",
  description: "Las herramientas internas: pantalla para el televisor, carteles con QR y modo kiosko.",
  robots: { index: false },
};

/**
 * Las tres herramientas internas, alcanzables.
 *
 * Antes `/pantalla` y `/carteles` solo se abrían escribiendo la URL a mano: dos de
 * las piezas más útiles del proyecto —la que hace que la Universidad note que
 * existe, y la única señalética física— eran invisibles para quien tenía que
 * usarlas el día del evento.
 */
export default function Organizacion() {
  const herramientas = [
    {
      href: "/pantalla/",
      Icono: IconoPantalla,
      titulo: "Modo pantalla",
      para: "Televisor de vestíbulo",
      texto:
        "Vista de solo lectura con lo que está en curso y lo que viene, en letra grande para leerse a tres metros. Sin navegación ni botones: no se toca.",
      como: "Abrir en el navegador del televisor y pulsar F11. Se actualiza sola cada 20 segundos.",
    },
    {
      href: "/?kiosko=1",
      Icono: IconoMapa,
      titulo: "Modo kiosko",
      para: "Pantallas táctiles del campus",
      texto:
        "La aplicación completa, con tipografía y botones más grandes, sin «Mi agenda» —es un aparato compartido— y con un código QR para llevarse la selección al móvil.",
      como: "Vuelve sola a la portada tras 90 segundos sin que nadie la toque.",
    },
    {
      href: "/carteles/",
      Icono: IconoMapa,
      titulo: "Carteles",
      para: "Para imprimir y colgar",
      texto:
        "Un cartel A4 por punto del mapa, con un código QR que abre la programación de ese edificio y no la portada: quien lo escanea ve lo que hay donde está parado.",
      como: "Imprimir con Ctrl+P. Cada cartel sale en su propia hoja.",
    },
  ];

  return (
    <div className="pagina">
      <header>
        <p className="eyebrow">Herramientas internas</p>
        <h1 className="titulo-pagina">Para la organización</h1>
        <p className="entradilla">
          Tres formas de que el festival se vea sin que nadie tenga que buscar nada: la pantalla de
          la entrada, las pantallas táctiles y los carteles de cada edificio.
        </p>
      </header>

      <div className="herramientas">
        {herramientas.map(({ href, Icono, titulo, para, texto, como }) => (
          <Link key={href} href={href} className="herramienta">
            <span className="herramienta-icono" aria-hidden>
              <Icono />
            </span>
            <span className="herramienta-cuerpo">
              <span className="herramienta-para">{para}</span>
              <span className="herramienta-titulo">{titulo}</span>
              <span className="herramienta-texto">{texto}</span>
              <span className="herramienta-como">{como}</span>
            </span>
          </Link>
        ))}
      </div>

      <p className="nota">
        <IconoInfo />
        <span>
          Antes de imprimir los carteles, comprueba que la dirección pública es la definitiva: los
          códigos QR se generan al compilar con esa dirección incrustada. Programación actual:{" "}
          {CIFRAS.total} actividades en {CIFRAS.lugares} lugares.{" "}
          <Link href="/datos/">Sobre estos datos</Link>
        </span>
      </p>
    </div>
  );
}
