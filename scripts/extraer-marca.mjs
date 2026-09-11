/**
 * Extrae la paleta real del material gráfico del festival y de la web de la UPEC,
 * en vez de estimar los colores a ojo desde una captura.
 *
 *   node scripts/extraer-marca.mjs <imagen.png> [más imágenes...]
 */
import fs from "node:fs";
import zlib from "node:zlib";

function leerPng(buffer) {
  let pos = 8, ihdr = null; const idat = [];
  while (pos < buffer.length) {
    const largo = buffer.readUInt32BE(pos);
    const tipo = buffer.toString("ascii", pos + 4, pos + 8);
    const datos = buffer.subarray(pos + 8, pos + 8 + largo);
    if (tipo === "IHDR") ihdr = { ancho: datos.readUInt32BE(0), alto: datos.readUInt32BE(4), profundidad: datos[8], tipoColor: datos[9] };
    else if (tipo === "IDAT") idat.push(datos);
    else if (tipo === "IEND") break;
    pos += 12 + largo;
  }
  const canales = { 0: 1, 2: 3, 4: 2, 6: 4 }[ihdr.tipoColor];
  const crudo = zlib.inflateSync(Buffer.concat(idat));
  const anchoLinea = ihdr.ancho * canales;
  const px = Buffer.alloc(ihdr.alto * anchoLinea);
  let o = 0;
  for (let y = 0; y < ihdr.alto; y++) {
    const f = crudo[o++]; const linea = crudo.subarray(o, o + anchoLinea); o += anchoLinea;
    const d = y * anchoLinea, a2 = d - anchoLinea;
    for (let x = 0; x < anchoLinea; x++) {
      const b = linea[x];
      const A = x >= canales ? px[d + x - canales] : 0;
      const B = y > 0 ? px[a2 + x] : 0;
      const C = x >= canales && y > 0 ? px[a2 + x - canales] : 0;
      let v;
      switch (f) {
        case 0: v = b; break; case 1: v = b + A; break; case 2: v = b + B; break;
        case 3: v = b + ((A + B) >> 1); break;
        case 4: { const p = A + B - C, pa = Math.abs(p - A), pb = Math.abs(p - B), pc = Math.abs(p - C);
                  v = b + (pa <= pb && pa <= pc ? A : pb <= pc ? B : C); break; }
        default: v = b;
      }
      px[d + x] = v & 0xff;
    }
  }
  return { ...ihdr, canales, px };
}

const hex = (r, g, b) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

for (const archivo of process.argv.slice(2)) {
  const img = leerPng(fs.readFileSync(archivo));
  const cubos = new Map();
  const paso = Math.max(1, Math.floor(Math.sqrt((img.ancho * img.alto) / 90000)));

  for (let y = 0; y < img.alto; y += paso) {
    for (let x = 0; x < img.ancho; x += paso) {
      const i = (y * img.ancho + x) * img.canales;
      if (img.canales === 4 && img.px[i + 3] < 200) continue;
      const r = img.px[i], g = img.px[i + 1], b = img.px[i + 2];
      // Cubos de 24 niveles: agrupa tonos casi iguales sin fundir colores distintos.
      const k = `${r >> 4},${g >> 4},${b >> 4}`;
      const c = cubos.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
      c.n++; c.r += r; c.g += g; c.b += b;
      cubos.set(k, c);
    }
  }

  const total = [...cubos.values()].reduce((s, c) => s + c.n, 0);
  const top = [...cubos.values()].sort((a, b) => b.n - a.n).slice(0, 10);

  console.log(`\n── ${archivo.split(/[\/]/).pop()}  (${img.ancho}×${img.alto}) ──`);
  for (const c of top) {
    const r = Math.round(c.r / c.n), g = Math.round(c.g / c.n), b = Math.round(c.b / c.n);
    const [h, s, l] = hsl(r, g, b);
    console.log(`  ${hex(r, g, b)}  ${String(((c.n / total) * 100).toFixed(1)).padStart(5)}%   hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`);
  }
}
