import type { Lugar } from "@/lib/tipos";

/**
 * Los 15 puntos del mapa oficial del campus, más las sedes que están fuera de él.
 *
 * Las coordenadas `x`/`y` son la punta de cada marcador dorado sobre
 * `public/img/mapa-campus.png` (1122×642), detectadas píxel a píxel con
 * `node scripts/detectar-pines.mjs`. Si algún día se cambia la imagen del mapa,
 * vuelve a correr ese script en lugar de mover los números a mano.
 *
 * `nombre` y `descripcion` son literalmente la leyenda del mapa oficial. Los `alias`
 * son las cadenas tal como aparecen en la agenda, que no coinciden con la leyenda:
 * la agenda dice «Auditorio Edificio central» donde el mapa dice «Auditorio Edificio
 * Principal». Esa es toda la reconciliación que hace falta.
 */
export const LUGARES: Lugar[] = [
  {
    id: "edificio-principal",
    pin: 1,
    nombre: "Edificio Principal",
    descripcion: "Salón literario principal",
    x: 56.77, y: 86.29,
  },
  {
    id: "auditorio-principal",
    pin: 2,
    nombre: "Auditorio Edificio Principal",
    descripcion: "Conferencias, recitales, conversatorios",
    x: 56.77, y: 72.74,
  },
  {
    id: "plaza-roja",
    pin: 3,
    nombre: "Plaza Roja",
    descripcion: "Emprendimientos",
    x: 56.77, y: 53.58,
  },
  {
    id: "aulas-2",
    pin: 4,
    nombre: "Edificio Aulas 2",
    descripcion: "Sala de cuentos, talleres, sala de lectura",
    x: 76.96, y: 70.25,
  },
  {
    id: "aulas-4",
    pin: 5,
    nombre: "Edificio Aulas 4",
    descripcion: "BotQuiz, portal de la imaginación",
    x: 94.03, y: 70.56,
  },
  {
    id: "coliseo",
    pin: 6,
    nombre: "Coliseo universitario 5 de Abril",
    descripcion: "Emprendimientos, moda circular y sostenible",
    x: 85.16, y: 20.25,
  },
  {
    id: "parqueadero-julio-robles",
    pin: 7,
    nombre: "Parqueadero Av. Julio Robles",
    descripcion: "Juegos tradicionales",
    x: 69.07, y: 23.21,
  },
  {
    id: "cancha-sintetica",
    pin: 8,
    nombre: "Cancha Sintética",
    descripcion: "Zona de recreación",
    x: 57.89, y: 28.82,
  },
  {
    id: "agora",
    pin: 9,
    nombre: "Ágora",
    descripcion: "Música, danza, percusión",
    x: 46.79, y: 47.82,
  },
  {
    id: "aulas-1",
    pin: 10,
    nombre: "Edificio Aulas 1",
    descripcion: "Salones literarios, portal de la imaginación",
    x: 37.25, y: 68.85,
  },
  {
    id: "aulas-3",
    pin: 11,
    nombre: "Edificio Aulas 3",
    descripcion: "Salones literarios",
    x: 20.37, y: 68.85,
  },
  {
    id: "posgrados",
    pin: 12,
    nombre: "Edificio de Posgrados",
    descripcion: "Sala de lectura, salón literario",
    x: 2.67, y: 75.7,
  },
  {
    id: "parqueadero-antisana",
    pin: 13,
    nombre: "Parqueadero Calle Antisana",
    descripcion: "Oferta académica Grado y Posgrado",
    // El mapa oficial repite el marcador 13 a ambos lados del campus.
    // Usamos el de la izquierda; el otro se dibuja aparte desde el componente.
    x: 28.61, y: 91.43,
  },
  {
    id: "centro-convenciones",
    pin: 14,
    nombre: "Centro de convenciones",
    descripcion: "Muestra editorial, exposición artística y fotográfica, sala de presentaciones de libros",
    x: 42.69, y: 31.0,
  },
  {
    id: "auditorio-convenciones",
    pin: 15,
    nombre: "Auditorio del centro de convenciones",
    descripcion: "Teatro, títeres, cine foro, narración oral",
    x: 28.34, y: 34.27,
  },

  /* --------------------------------------------------------------------- */

  /**
   * Las 60 presentaciones de libros dicen solo «Sala 1» o «Sala 2», sin edificio.
   * El pin 14 del mapa es el único que menciona «sala de presentaciones de libros»,
   * así que el Centro de convenciones es la lectura razonable — pero es nuestra,
   * no de la organización, y por eso viaja marcada hasta que alguien la confirme.
   */
  {
    id: "sala-presentaciones",
    pin: 14,
    nombre: "Sala de presentaciones de libros",
    descripcion: "Presentaciones de libros (Salas 1 y 2)",
    x: 42.69, y: 31.0,
    porConfirmar: true,
    nota: "La agenda dice solo «Sala 1» o «Sala 2». Deducimos el Centro de convenciones porque es el único punto del mapa con sala de presentaciones de libros, pero no está confirmado por la organización.",
  },

  /* --- Fuera del campus: dos sedes al otro lado de la frontera --- */

  {
    id: "banco-republica-ipiales",
    pin: null,
    nombre: "Agencia Cultural Banco de la República",
    descripcion: "Conversatorios y encuentros con poetas",
    x: null, y: null,
    fuera: {
      ciudad: "Ipiales",
      pais: "Colombia",
      maps: "https://www.google.com/maps/search/?api=1&query=Agencia+Cultural+Banco+de+la+Rep%C3%BAblica+Ipiales",
    },
  },
  {
    id: "universidad-narino",
    pin: null,
    nombre: "Auditorio Gonzalo Bravo Pérez · Universidad de Nariño",
    descripcion: "Conferencias y talleres",
    x: null, y: null,
    fuera: {
      ciudad: "Pasto",
      pais: "Colombia",
      maps: "https://www.google.com/maps/search/?api=1&query=Universidad+de+Nari%C3%B1o+Pasto",
    },
  },
];

/** Segundo marcador del pin 13, que el mapa oficial dibuja también a la derecha. */
export const PIN_13_DERECHA = { x: 86.05, y: 91.43 };

export const MAPA = {
  src: "/img/mapa-campus.png",
  ancho: 1122,
  alto: 642,
};


export const porId = new Map(LUGARES.map((l) => [l.id, l]));

export const LUGARES_CAMPUS = LUGARES.filter((l) => l.pin !== null && l.id !== "sala-presentaciones");
export const LUGARES_FUERA = LUGARES.filter((l) => l.fuera);

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    // Marcas diacríticas combinantes (U+0300–U+036F), que NFD acaba de separar.
    .replace(/[̀-ͯ]/g, "")
    .replace(/[–—]/g, "-")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

