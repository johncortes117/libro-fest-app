/**
 * Detecta la posición exacta de los pines dorados sobre el mapa aéreo del campus.
 *
 * El mapa oficial es una imagen: los 16 marcadores están dibujados encima, no hay
 * coordenadas en ninguna parte. En vez de estimarlas a ojo —que es exactamente el
 * error que mandaría a alguien al edificio equivocado— este script decodifica el PNG,
 * agrupa los píxeles dorados y devuelve la punta de cada marcador, que es el punto
 * que realmente señala el edificio.
 *
 *   node scripts/detectar-pines.mjs
 */
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const ARCHIVO = path.join(process.cwd(), "public", "img", "mapa-campus.png");

/* ---------- decodificador PNG mínimo (RGB/RGBA, 8 bits) ---------- */

function leerPng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("No es un PNG");

  let pos = 8;
  let ihdr = null;
  const idat = [];

  while (pos < buffer.length) {
    const largo = buffer.readUInt32BE(pos);
    const tipo = buffer.toString("ascii", pos + 4, pos + 8);
    const datos = buffer.subarray(pos + 8, pos + 8 + largo);

    if (tipo === "IHDR") {
      ihdr = {
        ancho: datos.readUInt32BE(0),
        alto: datos.readUInt32BE(4),
        profundidad: datos[8],
        tipoColor: datos[9],
        entrelazado: datos[12],
      };
    } else if (tipo === "IDAT") {
      idat.push(datos);
    } else if (tipo === "IEND") {
      break;
    }
    pos += 12 + largo;
  }

  if (!ihdr) throw new Error("PNG sin cabecera IHDR");
  if (ihdr.profundidad !== 8) throw new Error(`Profundidad ${ihdr.profundidad} no soportada`);
  if (ihdr.entrelazado !== 0) throw new Error("PNG entrelazado no soportado");

  const canales = { 0: 1, 2: 3, 4: 2, 6: 4 }[ihdr.tipoColor];
  if (!canales) throw new Error(`Tipo de color ${ihdr.tipoColor} no soportado`);

  const crudo = zlib.inflateSync(Buffer.concat(idat));
  const bpp = canales;
  const anchoLinea = ihdr.ancho * bpp;
  const pixeles = Buffer.alloc(ihdr.alto * anchoLinea);

  let origen = 0;
  for (let y = 0; y < ihdr.alto; y++) {
    const filtro = crudo[origen++];
    const linea = crudo.subarray(origen, origen + anchoLinea);
    origen += anchoLinea;

    const destino = y * anchoLinea;
    const anterior = destino - anchoLinea;

    for (let x = 0; x < anchoLinea; x++) {
      const bruto = linea[x];
      const a = x >= bpp ? pixeles[destino + x - bpp] : 0;
      const b = y > 0 ? pixeles[anterior + x] : 0;
      const c = x >= bpp && y > 0 ? pixeles[anterior + x - bpp] : 0;

      let valor;
      switch (filtro) {
        case 0: valor = bruto; break;
        case 1: valor = bruto + a; break;
        case 2: valor = bruto + b; break;
        case 3: valor = bruto + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          valor = bruto + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error(`Filtro ${filtro} desconocido en la fila ${y}`);
      }
      pixeles[destino + x] = valor & 0xff;
    }
  }

  return { ...ihdr, canales, pixeles };
}

/* ---------- detección de los marcadores ---------- */

// El dorado de los pines ronda el #F5D547. El fondo es verde oscuro y los
// edificios gris claro, así que un umbral amplio separa sin ambigüedad.
const esDorado = (r, g, b) => r > 190 && g > 150 && b < 130 && r - b > 80 && g - b > 50;

function detectar(img) {
  const { ancho, alto, canales, pixeles } = img;
  const marcado = new Uint8Array(ancho * alto);

  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const i = (y * ancho + x) * canales;
      if (esDorado(pixeles[i], pixeles[i + 1], pixeles[i + 2])) marcado[y * ancho + x] = 1;
    }
  }

  // Componentes conexas por inundación iterativa (8-vecindad).
  const visto = new Uint8Array(ancho * alto);
  const grupos = [];

  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const inicio = y * ancho + x;
      if (!marcado[inicio] || visto[inicio]) continue;

      const pila = [inicio];
      visto[inicio] = 1;
      const puntos = [];

      while (pila.length) {
        const p = pila.pop();
        const px = p % ancho, py = (p / ancho) | 0;
        puntos.push([px, py]);

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = px + dx, ny = py + dy;
            if (nx < 0 || ny < 0 || nx >= ancho || ny >= alto) continue;
            const n = ny * ancho + nx;
            if (marcado[n] && !visto[n]) { visto[n] = 1; pila.push(n); }
          }
        }
      }

      if (puntos.length < 300) continue; // ruido y antialiasing

      const xs = puntos.map((p) => p[0]);
      const ys = puntos.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      const y0 = Math.min(...ys), y1 = Math.max(...ys);

      grupos.push({
        pixeles: puntos.length,
        x0, x1, y0, y1,
        ancho: x1 - x0 + 1,
        alto: y1 - y0 + 1,
        // La punta del marcador es lo que señala el edificio, no su centro.
        puntaX: (x0 + x1) / 2,
        puntaY: y1,
      });
    }
  }

  return grupos;
}

/* ---------- salida ---------- */

const img = leerPng(fs.readFileSync(ARCHIVO));
console.log(`Mapa: ${img.ancho}×${img.alto}, tipo de color ${img.tipoColor}\n`);

const grupos = detectar(img)
  .filter((g) => g.alto > 15 && g.ancho > 10 && g.alto / g.ancho > 0.9 && g.alto / g.ancho < 2.2)
  .sort((a, b) => a.puntaY - b.puntaY || a.puntaX - b.puntaX);

console.log(`Marcadores encontrados: ${grupos.length} (se esperan 16)\n`);
console.log("  #   punta(px)        punta(%)          tamaño");
console.log("  ──  ───────────────  ────────────────  ─────────");

grupos.forEach((g, i) => {
  const px = ((g.puntaX / img.ancho) * 100).toFixed(2);
  const py = ((g.puntaY / img.alto) * 100).toFixed(2);
  console.log(
    `  ${String(i).padStart(2)}  ${String(Math.round(g.puntaX)).padStart(4)},${String(Math.round(g.puntaY)).padStart(4)}` +
    `        ${px.padStart(6)}%,${py.padStart(6)}%   ${g.ancho}×${g.alto}`
  );
});

console.log("\n--- como tabla, listo para pegar en data/lugares.ts ---");
console.log(JSON.stringify(grupos.map((g) => ({
  x: +((g.puntaX / img.ancho) * 100).toFixed(2),
  y: +((g.puntaY / img.alto) * 100).toFixed(2),
}))));
