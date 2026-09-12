import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Yellowtail } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import Navegacion from "@/components/Navegacion";
import BotonTema from "@/components/BotonTema";
import BotonCuenta from "@/components/BotonCuenta";
import RelojCabecera from "@/components/RelojCabecera";
import Avisos from "@/components/Avisos";
import RegistrarSW from "@/components/RegistrarSW";
import SincronizadorGuardadas from "@/components/SincronizadorGuardadas";
import ModoKiosko from "@/components/ModoKiosko";
import QrLlevar from "@/components/QrLlevar";
import { ProveedorMomento } from "@/components/Reloj";
import { ProveedorEntrada } from "@/components/Entrada";
import { ProveedorBrindis } from "@/components/Brindis";
import { SITIO } from "@/lib/sitio";

/* Archivo para todo lo estructural: sus pesos altos dan el mismo bloque compacto
   que los titulares del cartel, y es la cara de los números de hora. */
const display = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--fuente-display",
  display: "swap",
});

const cuerpo = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-body",
  display: "swap",
});

/* La cursiva del logotipo «Fest». Solo eso: dos palabras en toda la aplicación. */
const script = Yellowtail({
  subsets: ["latin"],
  weight: "400",
  variable: "--fuente-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: "UPEC Libro Fest 2026 · qué hay ahora y dónde",
    template: "%s · UPEC Libro Fest 2026",
  },
  description:
    "La agenda del UPEC Libro Fest 2026 en tiempo real: qué está pasando ahora mismo, en qué edificio del campus y qué viene después. Del 21 al 25 de septiembre en Tulcán.",
  applicationName: "UPEC Libro Fest 2026",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/img/icono-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/img/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "Libro Fest", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "UPEC Libro Fest 2026",
    title: "UPEC Libro Fest 2026 · qué hay ahora y dónde",
    description:
      "188 actividades en 17 lugares, del 21 al 25 de septiembre. Mira qué está pasando ahora mismo y en qué edificio.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#336439",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const guionTema = `
try {
  var t = localStorage.getItem("librofest2026:tema");
  if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
  if (location.search.indexOf("kiosko=1") > -1) document.documentElement.dataset.kiosko = "1";
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-EC" className={`${display.variable} ${cuerpo.variable} ${script.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: guionTema }} />

        <RegistrarSW />
        <SincronizadorGuardadas />
        <ModoKiosko />

        <ProveedorMomento>
          <ProveedorBrindis>
            <ProveedorEntrada>
              <a href="#principal" className="solo-lectores">
                Saltar al contenido
              </a>

              <header className="cabecera">
                <div className="cabecera-fila">
                  <Link href="/" className="marca" aria-label="UPEC Libro Fest 2026, inicio">
                    <span className="marca-liston" aria-hidden>
                      UPEC
                      <br />
                      LIBRO
                    </span>
                    <span className="marca-nombre">
                      <span className="a">Libro</span>
                      <span className="b">Fest 2026</span>
                    </span>
                  </Link>

                  <div className="acciones-cabecera">
                    <RelojCabecera />
                    <BotonCuenta />
                    <BotonTema />
                  </div>
                </div>
              </header>

              <Navegacion />

              <main id="principal" className="contenedor">
                <Avisos />
                {children}
                <QrLlevar />
              </main>

              {/* Una línea. Lo que antes eran dos párrafos de descargo en las 188
                  fichas vive ahora en /datos, donde no le quita sitio a la agenda. */}
              <footer className="pie contenedor">
                <p>
                  Sitio no oficial · programación de la{" "}
                  <a href="https://www.upec.edu.ec" target="_blank" rel="noreferrer">
                    UPEC
                  </a>{" "}
                  · <Link href="/datos/">Sobre esta agenda</Link>
                </p>
              </footer>
            </ProveedorEntrada>
          </ProveedorBrindis>
        </ProveedorMomento>
      </body>
    </html>
  );
}
