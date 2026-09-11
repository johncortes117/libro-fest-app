import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportación estática: una página HTML por sesión, sin servidor que mantener.
  // Es lo que permite que cada charla tenga etiquetas Open Graph propias cuando
  // alguien pega el enlace en WhatsApp o en una historia de Instagram.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
