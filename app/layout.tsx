import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import Navegacion from "@/components/Navegacion";
import BotonTema from "@/components/BotonTema";
import RelojCabecera from "@/components/RelojCabecera";
import Avisos from "@/components/Avisos";
import RegistrarSW from "@/components/RegistrarSW";
import { ProveedorMomento } from "@/components/Reloj";
import { SITIO } from "@/lib/sitio";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--fuente-display",
  display: "swap",
});

const cuerpo = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-mono",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#101a13" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Aplica el tema guardado antes del primer pintado. Sin esto, quien tiene el móvil
 * en oscuro ve un fogonazo blanco en cada carga.
 */
const guionTema = `
try {
  var t = localStorage.getItem("librofest2026:tema");
  if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-EC" className={`${display.variable} ${cuerpo.variable} ${mono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: guionTema }} />

        <RegistrarSW />

        <ProveedorMomento>
          <a href="#principal" className="solo-lectores">
            Saltar al contenido
          </a>

          <header className="cabecera">
            <div className="cabecera-fila">
              <Link href="/" className="marca">
                UPEC Libro Fest <span className="anio">2026</span>
              </Link>
              <div className="acciones-cabecera">
                <RelojCabecera />
                <BotonTema />
              </div>
            </div>
          </header>

          <Navegacion />

          <main id="principal" className="contenedor">
            <Avisos />
            {children}

            <footer className="pie">
              <p>
                Sitio no oficial, hecho por un estudiante para orientarse durante el festival.
                Toda la programación procede de la agenda oficial de la{" "}
                <a href="https://www.upec.edu.ec" target="_blank" rel="noreferrer">
                  Universidad Politécnica Estatal del Carchi
                </a>
                .
              </p>
              <p>
                Si encuentras un horario o un lugar equivocado, avísanos: corregir un dato es
                cuestión de minutos. Las horas son de Ecuador (UTC−5).
              </p>
            </footer>
          </main>
        </ProveedorMomento>
      </body>
    </html>
  );
}
