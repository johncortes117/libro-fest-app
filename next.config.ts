import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Ya no exportamos estático: «Mi agenda» vive en el servidor para que la misma
   * selección aparezca en el móvil, en el portátil y en la pantalla de la
   * universidad. Eso exige rutas de API reales (`/api/auth/...`) y conexión a la
   * base de datos.
   *
   * Lo que motivaba el `output: "export"` no se pierde: las 188 fichas de sesión y
   * las 17 de lugar siguen generándose en tiempo de compilación con
   * `generateStaticParams` + `dynamicParams = false`, así que cada charla conserva
   * sus etiquetas Open Graph propias cuando alguien pega el enlace en WhatsApp.
   */
  images: { unoptimized: true },
};

export default nextConfig;
