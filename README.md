# UPEC Libro Fest 2026 — qué hay ahora y dónde

Guía en tiempo real del UPEC Libro Fest 2026 (Tulcán, 21–25 de septiembre): **188 actividades
en 17 lugares**, con hasta ocho sesiones en paralelo a la misma hora. La agenda oficial son 75
páginas dentro de un visor de Adobe que no deja descargar nada; esto responde la pregunta que
de verdad se hace quien está parado en la Plaza Roja a las tres de la tarde.

Sitio estático, sin servidor ni base de datos. El programa completo viaja dentro del paquete de
JavaScript, así que **la agenda, el buscador y el mapa funcionan sin conexión**; las fichas
individuales de sesión quedan disponibles sin red una vez que se han abierto alguna vez.

---

## Arrancar

```bash
npm install
npm run datos     # Markdown de la agenda → data/agenda.json
npm run dev       # http://localhost:3000
```

`npm run build` vuelve a generar los datos por su cuenta (`prebuild`) y deja el sitio en `out/`.

## Qué hay dentro

| Ruta | Qué hace |
|---|---|
| `/` | **Ahora mismo**: lo que está en curso, ordenado por lo que le queda, y lo que arranca en dos horas |
| `/agenda` | Las 188 actividades, filtrables por día, tipo y lugar, con buscador |
| `/sesion/[id]` | Una página por sesión, con etiquetas para compartir y el bloque «al mismo tiempo» |
| `/mapa` | Los 15 puntos del mapa oficial, clicables; los encendidos tienen algo en marcha |
| `/lugar/[id]` | Los cinco días de un punto del campus |
| `/mi-agenda` | Lo guardado, con **detección de choques** y exportación a calendario |
| `/editoriales` | Las 29 editoriales y librerías de la muestra |
| `/pantalla` | Pantalla completa para el televisor de la entrada. Sin navegación, letra grande |
| `/carteles` | Un cartel A4 por edificio con su QR, listo para `Ctrl+P` |

### Probar la vista «ahora» antes del 21 de septiembre

Añade `?t=` a cualquier URL y la aplicación finge esa fecha y hora:

```
/?t=2026-09-24T15:10      el jueves a las 15:10, el momento con más cosas en paralelo
/mapa/?t=2026-09-23T10:30
```

El reloj de la cabecera se pone en dorado y dice «simulada» para que nadie se confunda.

---

## Operación durante el festival

### Cambios de última hora

Edita `public/avisos.json` y vuelve a desplegar. No toca el código y llega a todo el mundo en
el siguiente refresco, incluso a quien ya tiene la aplicación instalada:

```json
{
  "avisos": [
    {
      "id": "cambio-sala-martes",
      "nivel": "info",
      "texto": "El taller de dibujo del martes pasa al Aula 112.",
      "dia": "2026-09-22"
    },
    {
      "id": "cancela-cine-foro",
      "nivel": "alerta",
      "texto": "Se cancela el cine foro de las 15:00.",
      "sesionId": "24-1500-cine-foro"
    }
  ]
}
```

`nivel`: `info` para cambios, `alerta` para cancelaciones. `dia` lo muestra solo ese día;
`sesionId` lo muestra solo en esa ficha. Es el único archivo que el service worker nunca
cachea.

### Corregir la programación

1. Edita `docs/Agenda_UPEC_Libro_Fest_2026.md`.
2. `npm run datos` — si aparece un lugar que no conoce, **se detiene y lo dice** en vez de
   adivinar. Añádelo a la tabla `ALIAS` de `scripts/parse-agenda.mjs`.
3. Despliega. Son unos sesenta segundos.

---

## Decisiones que hay que confirmar con la organización

Están marcadas en la interfaz, no escondidas. Cuando lleguen las respuestas, se corrigen aquí:

- **«Sala 1» y «Sala 2» — 60 sesiones, el 38 % del programa.** La agenda no dice en qué
  edificio están. El punto 14 del mapa es el único que menciona «sala de presentaciones de
  libros», así que deducimos el Centro de convenciones — pero es deducción nuestra y viaja
  con la etiqueta «sala por confirmar» a la vista. Al confirmarlo, edita
  `sala-presentaciones` en `data/lugares.ts` y quita `porConfirmar`.
- **Hora de cierre de las 25 actividades permanentes.** La agenda dice «desde las 08:30» y no
  dice hasta cuándo. Asumimos las 18:00 y lo marcamos como estimación. Se cambia en
  `PERMANENTE_FIN`, en `scripts/parse-agenda.mjs`.
- **14 títulos vienen cortados con «…»** desde la transcripción del documento de InDesign. Se
  muestran tal cual, con la marca `[…]`. No se completan por nuestra cuenta.
- **Si hay una versión más reciente de la agenda**, todo se regenera sobre ella.

---

## Desplegar

Cualquier alojamiento estático sirve; `out/` es todo lo que hace falta. En Vercel o Netlify no
hay nada que configurar salvo la dirección pública:

```bash
NEXT_PUBLIC_SITIO=https://la-direccion-definitiva.ec npm run build
```

Ponla **antes de imprimir los carteles**: los códigos QR se generan al compilar con esa
dirección incrustada.

---

## Cómo está hecho

- **Next.js con `output: "export"`** — una página HTML por sesión. Eso da etiquetas Open Graph
  reales: al pegar el enlace de una charla en WhatsApp aparece el título, la hora y el lugar,
  que es como circula todo en este festival.
- **`data/agenda.json` se genera**, no se edita a mano. El parser falla ruidosamente ante un
  lugar desconocido: mandar a alguien al edificio equivocado es el peor fallo posible aquí.
- **Las coordenadas de los 16 marcadores del mapa** se detectaron píxel a píxel
  (`node scripts/detectar-pines.mjs`) en vez de estimarse a ojo. Si cambia la imagen del mapa,
  vuelve a correr ese script.
- **Los iconos del PWA** se dibujan por código (`node scripts/generar-iconos.mjs`): el marcador
  dorado del mapa sobre el verde del campus, sin dependencias.
- **Hora anclada a `America/Guayaquil`** con `Intl`, no con el reloj del dispositivo. Lo que
  hay que proteger no es la aritmética de UTC−5: es que un teléfono en otra zona no caiga en
  el día equivocado del festival.
- **Las permanentes no generan choques.** La muestra editorial abre de 08:30 a 18:00 y se
  solaparía con todo; contarla llenaría «Mi agenda» de colisiones falsas.
- **Sin cuentas ni backend.** «Mi agenda» vive en `localStorage`. En un evento con público
  infantil, no recoger datos personales es la decisión correcta y además no hay nada que
  mantener durante los cinco días.

### Estructura

```
app/                 rutas (App Router)
components/          interfaz; las que dependen de la hora son de cliente
lib/
  tiempo.ts          zona horaria del evento, formatos, hora simulada
  datos.ts           consultas: ahora, a continuación, búsqueda, choques
  guardadas.ts       «Mi agenda» en localStorage
  ics.ts             exportación a calendario
data/
  lugares.ts         los 15 puntos + sedes fuera del campus, con coordenadas
  agenda.json        generado — no editar
docs/
  Agenda_..._2026.md fuente de la programación
  plan.html          análisis y plan de construcción
scripts/
  parse-agenda.mjs   Markdown → JSON, con validación de lugares
  detectar-pines.mjs coordenadas de los marcadores del mapa
  generar-iconos.mjs iconos del PWA
```

---

## Aviso

Sitio no oficial, hecho por un estudiante. Toda la programación procede de la agenda oficial de
la Universidad Politécnica Estatal del Carchi. Si la Universidad quiere adoptarlo, el proyecto
se entrega tal cual.
