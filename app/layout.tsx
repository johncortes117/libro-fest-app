import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Yellowtail } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
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

                {/* Créditos de autor / creador */}
                <div className="pie-creditos-autor">
                  <div className="pie-autor-info">
                    <span className="pie-autor-label">Desarrollado y diseñado por</span>
                    <a
                      href="https://johncp.dev/"
                      target="_blank"
                      rel="noreferrer"
                      className="pie-autor-handle"
                    >
                      @johncp.dev
                    </a>
                  </div>

                  <div className="pie-autor-redes">
                    <a
                      href="https://johncp.dev/"
                      target="_blank"
                      rel="noreferrer"
                      className="pie-red-link"
                      title="Sitio web de @johncp.dev"
                      aria-label="Sitio web personal"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="pie-red-icono">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                        <path d="M2 12h20" />
                      </svg>
                      <span>johncp.dev</span>
                    </a>

                    <a
                      href="https://github.com/johncortes117"
                      target="_blank"
                      rel="noreferrer"
                      className="pie-red-link"
                      title="GitHub @johncortes117"
                      aria-label="Perfil de GitHub"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="pie-red-icono">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>GitHub</span>
                    </a>

                    <a
                      href="https://www.linkedin.com/in/john-cortes-pozo/"
                      target="_blank"
                      rel="noreferrer"
                      className="pie-red-link"
                      title="LinkedIn John Cortés Pozo"
                      aria-label="Perfil de LinkedIn"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="pie-red-icono">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                      </svg>
                      <span>LinkedIn</span>
                    </a>

                    <a
                      href="https://www.instagram.com/johncp.dev/"
                      target="_blank"
                      rel="noreferrer"
                      className="pie-red-link"
                      title="Instagram @johncp.dev"
                      aria-label="Perfil de Instagram"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="pie-red-icono">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>
              </footer>
            </ProveedorEntrada>
          </ProveedorBrindis>
        </ProveedorMomento>
        <Analytics />
      </body>
    </html>
  );
}
