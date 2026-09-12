import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";

export { AMBITO_CALENDARIO } from "./ambitos";

/**
 * Autenticación del festival.
 *
 * Solo Google. Es una decisión deliberada y tiene coste: quien no tenga cuenta de
 * Google no puede guardar. A cambio, no hace falta infraestructura de correo
 * —verificación, recuperación de contraseña— que nadie va a mantener durante los
 * cinco días, y es la misma cuenta que luego recibe los eventos en el calendario.
 *
 * El permiso de calendario NO se pide al entrar. Entrar solo pide nombre y correo,
 * que es una pantalla de consentimiento que la gente acepta sin pensar. El acceso
 * al calendario se pide aparte, cuando alguien enciende el interruptor de
 * sincronización, mediante `linkSocial` con `includeGrantedScopes` (activo por
 * defecto en Better Auth), que conserva los permisos ya concedidos.
 */
export const auth = betterAuth({
  appName: "UPEC Libro Fest 2026",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITIO,
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Sin esto Google no entrega refresh token y la sincronización de calendario
      // deja de funcionar en cuanto caduca el primer access token, a la hora.
      accessType: "offline",
      prompt: "consent",
    },
  },

  session: {
    // Cinco días de festival más margen: nadie debería tener que volver a entrar
    // a mitad de semana.
    expiresIn: 60 * 60 * 24 * 60,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },

  plugins: [nextCookies()],
});

export type Sesion = typeof auth.$Infer.Session;
