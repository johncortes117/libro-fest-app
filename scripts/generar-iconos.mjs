/**
 * Genera los iconos del PWA sin dependencias: dibuja los píxeles a mano y los
 * codifica en PNG con el zlib de Node.
 *
 *   node scripts/generar-iconos.mjs
 *
 * La marca es el propio marcador dorado del mapa del festival sobre el verde del
 * campus. Quien instale la aplicación en su pantalla de inicio verá lo mismo que
 * lleva viendo en los carteles.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const SALIDA = path.join(process.cwd(), "public", "img");

const VERDE = [29, 58, 36];
const DORADO = [240, 195, 60];
const VERDE_OSCURO = [17, 34, 22];

/* ------------------------------------------------------ codificador PNG --- */

const tablaCrc = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = tablaCrc[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

function codificarPng(ancho, alto, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;   // 8 bits por canal
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0;  // deflate
  ihdr[11] = 0;  // filtro adaptativo
  ihdr[12] = 0;  // sin entrelazado

  // Una línea de filtro 0 (ninguno) delante de cada fila.
  const conFiltro = Buffer.alloc(alto * (ancho * 4 + 1));
  for (let y = 0; y < alto; y++) {
    conFiltro[y * (ancho * 4 + 1)] = 0;
    rgba.copy(conFiltro, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo("IHDR", ihdr),
    trozo("IDAT", zlib.deflateSync(conFiltro, { level: 9 })),
    trozo("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------- dibujo ---- */

/**
 * El marcador: un círculo con una punta hacia abajo, igual que los del mapa.
 * Se evalúa con supermuestreo de 3×3 para que los bordes no queden dentados.
 */
function dibujar(tamano, margen) {
  const px = Buffer.alloc(tamano * tamano * 4);
  const radio = (tamano * (1 - margen * 2)) / 2;
  const cx = tamano / 2;
  const cy = tamano / 2 - radio * 0.16;
  const puntaY = cy + radio * 1.42;
  const rInterior = radio * 0.34;

  const dentroDelPin = (x, y) => {
    // Cabeza circular.
    if ((x - cx) ** 2 + (y - cy) ** 2 <= radio * radio) return true;
    // Punta triangular que se estrecha hacia abajo.
    if (y < cy || y > puntaY) return false;
    const t = (y - cy) / (puntaY - cy);
    const medio = radio * (1 - t) * 0.92;
    return Math.abs(x - cx) <= medio;
  };

  const dentroDelHueco = (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= rInterior * rInterior;

  for (let y = 0; y < tamano; y++) {
    for (let x = 0; x < tamano; x++) {
      let pin = 0;
      let hueco = 0;
      for (let sy = 0; sy < 3; sy++) {
        for (let sx = 0; sx < 3; sx++) {
          const mx = x + (sx + 0.5) / 3;
          const my = y + (sy + 0.5) / 3;
          if (dentroDelPin(mx, my)) pin++;
          if (dentroDelHueco(mx, my)) hueco++;
        }
      }

      const aPin = pin / 9;
      const aHueco = hueco / 9;
      const i = (y * tamano + x) * 4;

      // Fondo verde, marcador dorado encima, hueco verde oscuro dentro.
      let color = VERDE;
      if (aPin > 0) color = mezclar(VERDE, DORADO, aPin);
      if (aHueco > 0) color = mezclar(color, VERDE_OSCURO, aHueco);

      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = 255;
    }
  }
  return px;
}

const mezclar = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/* ------------------------------------------------------------- salida ---- */

fs.mkdirSync(SALIDA, { recursive: true });

const iconos = [
  { archivo: "icono-192.png", tamano: 192, margen: 0.19 },
  { archivo: "icono-512.png", tamano: 512, margen: 0.19 },
  // El recorte adaptativo de Android puede comerse hasta un 20% de cada borde.
  { archivo: "icono-maskable-512.png", tamano: 512, margen: 0.29 },
  { archivo: "apple-touch-icon.png", tamano: 180, margen: 0.17 },
];

for (const { archivo, tamano, margen } of iconos) {
  const png = codificarPng(tamano, tamano, dibujar(tamano, margen));
  fs.writeFileSync(path.join(SALIDA, archivo), png);
  console.log(`  ${archivo.padEnd(26)} ${tamano}×${tamano}  ${(png.length / 1024).toFixed(1)} KB`);
}

console.log("\n  Iconos generados en public/img/\n");
