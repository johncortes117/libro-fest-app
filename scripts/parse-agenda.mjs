/**
 * Convierte la agenda oficial en Markdown a `data/agenda.json`.
 *
 *   npm run datos
 *
 * Reglas de la casa:
 *
 *  - Si aparece un lugar que no está en la tabla ALIAS, el script se detiene.
 *    Un lugar adivinado en silencio manda a alguien al edificio equivocado, que es
 *    justo el fallo que esta aplicación existe para evitar.
 *  - Si un alias apunta a un id que no existe en `data/lugares.ts`, también se detiene.
 *  - Nada se inventa: los títulos cortados con «…» en el documento original se marcan
 *    como truncados y se muestran tal cual.
 */
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const ORIGEN = path.join(RAIZ, "docs", "Agenda_UPEC_Libro_Fest_2026.md");
const DESTINO = path.join(RAIZ, "data", "agenda.json");
const LUGARES_TS = path.join(RAIZ, "data", "lugares.ts");

/* ------------------------------------------------------------------ *
 * Reconciliación de lugares
 *
 * La agenda y el mapa oficial no usan los mismos nombres: la agenda dice
 * «Auditorio Edificio central» donde el mapa dice «Auditorio Edificio Principal».
 * Son once cadenas en las sesiones con horario y veinte en las permanentes.
 * Esta tabla es toda la reconciliación que hace falta, escrita una vez.
 * ------------------------------------------------------------------ */

const ALIAS = {
  // --- sesiones con horario ---
  "auditorio edificio central": "auditorio-principal",
  "sala 1": "sala-presentaciones",
  "sala 2": "sala-presentaciones",
  "sala": "sala-presentaciones",
  "centro de convenciones - auditorio": "auditorio-convenciones",
  "edificio aulas 2 - aula 110": "aulas-2",
  "agora universitaria": "agora",
  "centro de convenciones (sala de exposiciones)": "centro-convenciones",
  "agencia cultural banco de la republica - ipiales": "banco-republica-ipiales",
  "auditorio gonzalo bravo perez - universidad de narino": "universidad-narino",
  "cancha sintetica - campus universitario": "cancha-sintetica",

  // --- actividades permanentes ---
  "centro de convenciones (salon primer piso)": "centro-convenciones",
  "centro de convenciones (salon principal)": "centro-convenciones",
  "edificio posgrado (hall primer piso)": "posgrados",
  "edificio de aulas 3 (hall de la planta baja)": "aulas-3",
  "edificio de aulas 1 (hall de la planta baja - audiovisuales)": "aulas-1",
  "edificio de aulas 2 (planta baja)": "aulas-2",
  "edificio de aulas 3 (planta baja - laboratorio de innovacion)": "aulas-3",
  "edificio de aulas 1 (planta baja - laboratorio)": "aulas-1",
  "plaza roja y coliseo “5 de abril”": "plaza-roja",
  "coliseo “5 de abril”": "coliseo",
  "edificio de aulas 1 (planta baja - sala graduaciones)": "aulas-1",
  "edificio de aulas 2 (primer piso)": "aulas-2",
  "edificio de aulas 4 (hall de la planta baja)": "aulas-4",
  "edificio de aulas 4 (planta baja)": "aulas-4",
  "edificio aulas 2 (aula 115)": "aulas-2",
  "edificio de aulas 4 (planta baja - observatorio de turismo)": "aulas-4",
  "edificio de aulas 3 (planta baja - adupec)": "aulas-3",
  "edificio de aulas 3 (primer piso - aula 108)": "aulas-3",
  "edificio de aulas 4 (planta baja - aula)": "aulas-4",
  "edificio de aulas 2 (primer piso - aula 111)": "aulas-2",
  "parqueadero cancha sintetica": "parqueadero-julio-robles",
  "parqueaderos campus universitario": "parqueadero-antisana",
  "cancha sintetica": "cancha-sintetica",
};

/** Las permanentes abren a las 08:30 y la agenda no dice cuándo cierran. */
const PERMANENTE_INICIO = 8 * 60 + 30;
const PERMANENTE_FIN = 18 * 60;

const DIAS = {
  LUNES: "2026-09-21",
  MARTES: "2026-09-22",
  "MIÉRCOLES": "2026-09-23",
  JUEVES: "2026-09-24",
  VIERNES: "2026-09-25",
};

const SECCIONES = {
  "Conferencias y Conversatorios": "conferencia",
  "Talleres": "taller",
  "Actividades Culturales": "cultural",
  "Presentación de Libros": "libro",
};

/* ------------------------------------------------------------------ *
 * Utilidades
 * ------------------------------------------------------------------ */

const COMBINANTES = /[̀-ͯ]/g;

const normalizar = (t) =>
  t.normalize("NFD").replace(COMBINANTES, "").replace(/[–—]/g, "-")
   .toLowerCase().replace(/\s+/g, " ").trim();

const limpiar = (t) =>
  t.replace(/<br\s*\/?>/gi, " ").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function slug(t) {
  return t
    .normalize("NFD").replace(COMBINANTES, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52)
    .replace(/-+$/g, "");
}

const aMinutos = (hh, mm) => Number(hh) * 60 + Number(mm);

/** Corta una fila de tabla Markdown en celdas limpias. */
function celdas(linea) {
  return linea.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(limpiar);
}

/**
 * Autores y ponentes: se parte solo por comas.
 *
 * Nunca por « y »: hay nombres compuestos y entidades como «Academia sin fronteras:
 * cooperación universitaria e integración» que quedarían destrozados.
 */
function personas(texto) {
  if (!texto) return [];
  return texto.split(",").map((p) => p.trim()).filter((p) => p.length > 1);
}

const erroresFatales = [];
const advertencias = [];

/* ------------------------------------------------------------------ *
 * Comprobación de integridad: los alias apuntan a lugares que existen
 * ------------------------------------------------------------------ */

const idsValidos = new Set(
  [...fs.readFileSync(LUGARES_TS, "utf8").matchAll(/^\s*id:\s*"([^"]+)"/gm)].map((m) => m[1])
);

if (idsValidos.size === 0) {
  erroresFatales.push("No se pudo leer ningún id de lugar desde data/lugares.ts");
}

for (const [alias, id] of Object.entries(ALIAS)) {
  if (!idsValidos.has(id)) {
    erroresFatales.push(`El alias «${alias}» apunta a «${id}», que no existe en data/lugares.ts`);
  }
}

/* ------------------------------------------------------------------ *
 * Resolución de lugar
 * ------------------------------------------------------------------ */

const lugaresVistos = new Map();

function resolverLugar(texto, contexto) {
  const clave = normalizar(texto);
  lugaresVistos.set(clave, (lugaresVistos.get(clave) ?? 0) + 1);

  const id = ALIAS[clave];
  if (!id) {
    erroresFatales.push(
      `Lugar desconocido: «${texto}»\n      visto en: ${contexto}\n      ` +
      `Añádelo a la tabla ALIAS en scripts/parse-agenda.mjs apuntando a un id de data/lugares.ts.`
    );
    return "desconocido";
  }
  return id;
}

/* ------------------------------------------------------------------ *
 * Identificadores estables y únicos
 * ------------------------------------------------------------------ */

const usados = new Set();

function idUnico(base) {
  let id = base;
  let n = 2;
  while (usados.has(id)) id = `${base}-${n++}`;
  usados.add(id);
  return id;
}

/* ------------------------------------------------------------------ *
 * Parseo
 * ------------------------------------------------------------------ */

const texto = fs.readFileSync(ORIGEN, "utf8");
const lineas = texto.split(/\r?\n/);

const sesiones = [];
const permanentes = [];
const editoriales = [];

let bloque = null;      // "permanentes" | "dia" | "editoriales" | null
let diaActual = null;
let tipoActual = null;
let truncados = 0;

for (const linea of lineas) {
  /* --- cabeceras --- */

  if (/^##\s+.*Actividades Recurrentes/.test(linea)) {
    bloque = "permanentes"; tipoActual = "permanente"; diaActual = null; continue;
  }
  if (/^##\s+.*Editoriales y Librer/.test(linea)) {
    bloque = "editoriales"; tipoActual = null; continue;
  }
  if (/^##\s+.*Mapa del evento/.test(linea) || /^##\s+.*Agenda Diaria/.test(linea)) {
    bloque = null; tipoActual = null; continue;
  }

  const cabeceraDia = linea.match(/^###\s+.*?(LUNES|MARTES|MIÉRCOLES|JUEVES|VIERNES)\s+\d+/);
  if (cabeceraDia) {
    bloque = "dia";
    diaActual = DIAS[cabeceraDia[1]];
    tipoActual = null;
    continue;
  }

  const cabeceraSeccion = linea.match(/^####\s+(.+?)\s*$/);
  if (cabeceraSeccion) {
    tipoActual = SECCIONES[cabeceraSeccion[1]] ?? null;
    if (!tipoActual) advertencias.push(`Sección no reconocida y omitida: «${cabeceraSeccion[1]}»`);
    continue;
  }

  /* --- listado de editoriales --- */

  if (bloque === "editoriales") {
    const m = linea.match(/^\s*\d+\.\s+(.+?)\s*$/);
    if (m) editoriales.push(limpiar(m[1]));
    continue;
  }

  /* --- filas de tabla --- */

  if (!linea.startsWith("|") || !tipoActual) continue;
  if (/^\|\s*:?-+/.test(linea)) continue;                 // separador
  if (!/^\|\s*\*\*/.test(linea)) continue;                // cabecera de tabla

  const c = celdas(linea);
  if (c.length < 3) continue;

  /* ---- actividades permanentes: | Actividad | Detalles | Lugar | ---- */

  if (bloque === "permanentes") {
    const [actividad, detalle, lugarTexto] = c;
    const titulo = actividad;
    const contexto = `permanentes · ${titulo} · ${detalle}`.slice(0, 110);

    permanentes.push({
      id: idUnico(`p-${slug(`${titulo}-${detalle}`)}`),
      tipo: "permanente",
      titulo,
      detalle: detalle || undefined,
      personas: [],
      lugarId: resolverLugar(lugarTexto, contexto),
      lugarTexto,
      inicio: PERMANENTE_INICIO,
      fin: PERMANENTE_FIN,
      permanente: true,
      finSupuesto: true,
    });
    continue;
  }

  /* ---- sesiones con horario: | Horario | Título | Personas/Detalle | Lugar | ---- */

  if (bloque !== "dia" || !diaActual) continue;

  const [horario, titulo, tercera, lugarTexto] = c;
  const franjas = [...horario.matchAll(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g)];

  if (franjas.length === 0) {
    advertencias.push(`Fila sin horario reconocible, omitida: «${horario} · ${titulo}»`);
    continue;
  }

  // Las culturales y permanentes traen en la tercera columna una descripción de la
  // obra, no una lista de personas. Partirla por comas convertiría «Música, danza,
  // percusión» en tres ponentes.
  const esDescripcion = tipoActual === "cultural";
  const truncado = /\.\.\.$|…$/.test(titulo);
  if (truncado) truncados++;

  for (const f of franjas) {
    const inicio = aMinutos(f[1], f[2]);
    const fin = aMinutos(f[3], f[4]);
    const hhmm = String(f[1]).padStart(2, "0") + f[2];
    const contexto = `${diaActual} ${f[1]}:${f[2]} · ${titulo}`.slice(0, 110);

    if (fin <= inicio) {
      advertencias.push(`Horario invertido o nulo en «${titulo}» (${f[0]}), se mantiene tal cual`);
    }

    sesiones.push({
      id: idUnico(`${diaActual.slice(-2)}-${hhmm}-${slug(titulo)}`),
      tipo: tipoActual,
      titulo,
      detalle: esDescripcion ? tercera || undefined : undefined,
      personas: esDescripcion ? [] : personas(tercera),
      lugarId: resolverLugar(lugarTexto, contexto),
      lugarTexto,
      dia: diaActual,
      inicio,
      fin,
      truncado: truncado || undefined,
    });
  }
}

/* ------------------------------------------------------------------ *
 * Resultado
 * ------------------------------------------------------------------ */

if (erroresFatales.length) {
  console.error("\n  No se generó agenda.json. Hay que resolver esto primero:\n");
  for (const e of erroresFatales) console.error(`   ·  ${e}`);
  console.error("");
  process.exit(1);
}

sesiones.sort((a, b) => a.dia.localeCompare(b.dia) || a.inicio - b.inicio || a.titulo.localeCompare(b.titulo, "es"));
permanentes.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));

const salida = {
  generado: new Date().toISOString(),
  fuente: "docs/Agenda_UPEC_Libro_Fest_2026.md",
  sesiones,
  permanentes,
  editoriales,
  advertencias,
};

fs.writeFileSync(DESTINO, JSON.stringify(salida, null, 2) + "\n", "utf8");

/* --- informe --- */

const porTipo = {};
for (const s of sesiones) porTipo[s.tipo] = (porTipo[s.tipo] ?? 0) + 1;

console.log(`\n  data/agenda.json escrito\n`);
console.log(`  ${String(sesiones.length).padStart(4)}  sesiones con horario`);
for (const [t, n] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}    · ${t}`);
}
console.log(`  ${String(permanentes.length).padStart(4)}  actividades permanentes (08:30–18:00, horario supuesto)`);
console.log(`  ${String(editoriales.length).padStart(4)}  editoriales y librerías`);
console.log(`  ${String(lugaresVistos.size).padStart(4)}  cadenas de lugar distintas, todas resueltas`);
console.log(`  ${String(truncados).padStart(4)}  títulos truncados en el documento original\n`);

if (advertencias.length) {
  console.log("  Avisos:");
  for (const a of advertencias) console.log(`   ·  ${a}`);
  console.log("");
}
