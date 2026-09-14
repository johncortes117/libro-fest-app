import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Yellowtail } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

import Navegacion from "@/components/Navegacion";
import BotonTema from "@/components/BotonTema";
import BotonCuenta from "@/components/BotonCuenta";
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
                  <div className="marca-conjunto">
                    <Link href="/" className="marca-ulif-link" aria-label="UPEC Libro Fest 2026, inicio">
                      <Image
                        src="/logos/ulif.png"
                        alt="ULIF'26 · Academia, arte y cultura"
                        width={96}
                        height={37}
                        className="marca-ulif-header"
                        priority
                      />
                    </Link>

                    <span className="marca-separador" aria-hidden="true" />

                    <a
                      href="https://www.upec.edu.ec"
                      target="_blank"
                      rel="noreferrer"
                      className="marca-upec"
                      title="Universidad Politécnica Estatal del Carchi"
                      aria-label="Sitio web oficial de la UPEC"
                    >
                      <Image
                        src="/logos/upec.png"
                        alt="Universidad Politécnica Estatal del Carchi"
                        width={92}
                        height={36}
                        className="marca-upec-img"
                        priority
                      />
                    </a>
                  </div>

                  <div className="acciones-cabecera">
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

              <footer className="pie-simple contenedor">
                <div className="pie-simple-fila">
                  <div className="pie-simple-marcas">
                    <a
                      href="https://www.upec.edu.ec"
                      target="_blank"
                      rel="noreferrer"
                      title="Universidad Politécnica Estatal del Carchi"
                    >
                      <Image
                        src="/logos/upec.png"
                        alt="UPEC"
                        width={68}
                        height={26}
                        className="pie-simple-upec"
                      />
                    </a>
                    <span className="pie-simple-div" aria-hidden="true" />
                    <Link href="/" title="ULIF'26">
                      <Image
                        src="/logos/ulif.png"
                        alt="ULIF'26"
                        width={60}
                        height={23}
                        className="pie-simple-ulif"
                      />
                    </Link>
                  </div>

                  <p className="pie-simple-texto">
                    UPEC Libro Fest 2026 · Del 21 al 25 de septiembre · <Link href="/datos/">Sobre esta agenda</Link> ·{" "}
                    <a href="https://www.upec.edu.ec" target="_blank" rel="noreferrer">
                      UPEC ↗
                    </a>
                  </p>
                </div>
              </footer>
            </ProveedorEntrada>
          </ProveedorBrindis>
        </ProveedorMomento>
      </body>
    </html>
  );
}
