/**
 * Un único sitio de verdad para la URL pública. Al desplegar, pon la definitiva en
 * `NEXT_PUBLIC_SITIO` para que las tarjetas de WhatsApp y Facebook apunten bien.
 */
export const SITIO = {
  url: process.env.NEXT_PUBLIC_SITIO ?? "https://upec-librofest.vercel.app",
  nombre: "UPEC Libro Fest 2026",
};
