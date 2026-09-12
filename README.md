# UPEC Libro Fest 2026 — qué hay ahora y dónde

Guía en tiempo real del UPEC Libro Fest 2026 (Tulcán, 21–25 de septiembre): **188 actividades
en 17 lugares**, con hasta ocho sesiones en paralelo a la misma hora. La agenda oficial son 75
páginas dentro de un visor de Adobe que no deja descargar nada; esto responde la pregunta que
de verdad se hace quien está parado en la Plaza Roja a las tres de la tarde.

El programa completo viaja dentro del paquete de JavaScript, así que **la agenda, el buscador y
el mapa funcionan sin conexión**. «Mi agenda» sí necesita cuenta: se guarda en el servidor para
que la misma selección aparezca en el móvil, en el ordenador y en las pantallas del campus.

---

## Arrancar

```bash
npm install
cp .env.example .env.local     # y rellenar los cinco valores
npm run datos                  # Markdown de la agenda → data/agenda.json
npm run dev                    # http://localhost:3000
```

La agenda pública funciona sin configurar nada. Lo que necesita `.env.local` es entrar y
guardar: sin `DATABASE_URL` las rutas de API responden `503 sin-base-de-datos` y la interfaz lo
dice en vez de fallar en silencio.

### La base de datos

Una vez, contra la base de Neon:

```bash
psql "$DATABASE_URL" -f db/esquema.sql
```

Crea las cuatro tablas de Better Auth (`user`, `session`, `account`, `verification`) y las dos
nuestras (`sesion_guardada`, `preferencia_usuario`). Usa la cadena **pooled** de Neon: es la que
aguanta funciones serverless.

### Google

En Google Cloud Console, un ID de cliente OAuth de tipo «aplicación web» con estos URI de
redirección:

```
http://localhost:3000/api/auth/callback/google
https://TU-DOMINIO/api/auth/callback/google
```

Y **habilitar Google Calendar API** en el proyecto: sin eso, el interruptor de sincronización
devuelve error aunque el permiso esté concedido.

## Qué hay dentro

| Ruta | Qué hace |
|---|---|
| `/` | **Ahora mismo**: lo que está en curso, ordenado por lo que le queda, y lo que arranca en dos horas |
| `/agenda` | Las 188 actividades, filtrables por día, tipo y lugar, con buscador y marca de lo que se pisa con tu agenda |
| `/sesion/[id]` | Una página por sesión, con etiquetas para compartir y el bloque «al mismo tiempo» |
| `/mapa` | Los 15 puntos del mapa oficial, con zoom; los encendidos tienen algo en marcha |
| `/lugar/[id]` | Los cinco días de un punto del campus. El del centro de convenciones incluye la muestra editorial |
| `/mi-agenda` | Lo guardado, en lista o en horario, con detección de choques y sincronización con Google Calendar |
| `/datos` | De dónde salen los datos y qué no está confirmado |
| `/organizacion` | Las tres herramientas internas, enlazadas desde el pie |
| `/pantalla` | Pantalla completa para el televisor de la entrada. Sin navegación, letra grande, no se toca |
| `/carteles` | Un cartel A4 por edificio con su QR, listo para `Ctrl+P` |

`?kiosko=1` pone el **modo kiosko** para las pantallas táctiles de pared: escala mayor,
objetivos de 64 px, sin «Mi agenda» —es un aparato compartido— y un código QR para llevarse al
móvil la página que se está mirando. Vuelve sola a la portada tras 90 segundos sin que nadie la
toque.

### Probar la vista «ahora» antes del 21 de septiembre

Añade `?t=` a cualquier URL y la aplicación finge esa fecha y hora:

```
/?t=2026-09-23T10:00      el pico: ocho sesiones simultáneas
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
3. Despliega, y **sube `VERSION` en `public/sw.js`** para que las copias en caché se renueven.

---

## Decisiones que hay que confirmar con la organización

Están marcadas en la interfaz y explicadas en `/datos`, no escondidas:

- **«Sala 1» y «Sala 2» — 60 sesiones, el 37 % del programa.** La agenda no dice en qué
  edificio están. Deducimos el Centro de convenciones. Al confirmarlo, edita
  `sala-presentaciones` en `data/lugares.ts` y quita `porConfirmar`.
- **Hora de cierre de las 25 actividades permanentes.** Asumimos las 18:00. Se cambia en
  `PERMANENTE_FIN`, en `scripts/parse-agenda.mjs`.
- **14 títulos vienen cortados con «…»** desde la transcripción del documento original.

---

## Cuentas y agenda personal

Entrar es **solo con Google**, y es una decisión con coste: quien no tenga cuenta de Google no
puede guardar. A cambio, no hace falta infraestructura de correo —verificación, recuperación de
contraseña— que nadie va a mantener durante cinco días, y es la misma cuenta que luego recibe
los eventos en el calendario.

Tres piezas que conviene no tocar sin entender por qué están:

- **El permiso de calendario no se pide al entrar.** Entrar solo pide nombre y correo. El acceso
  al calendario se pide al encender el interruptor en «Mi agenda», que es el único momento en
  que la persona entiende para qué sirve.
- **Guardar no espera a la red.** `lib/guardadas.ts` mantiene un espejo en `localStorage` y una
  cola de escrituras que se vacía al reconectar. Un botón que tarda dos segundos mientras
  alguien está de pie es un botón roto, y el wifi del campus no aguanta.
- **El espejo se borra al cambiar de usuario.** En un teléfono prestado o en la pantalla táctil
  del campus, enseñarle a alguien la agenda de otro sería peor que no tener agenda. Por lo
  mismo, `public/sw.js` no cachea `/mi-agenda/` ni nada bajo `/api/`.

Encender la sincronización crea los eventos de lo ya guardado; apagarla los retira. El id del
evento se guarda en `sesion_guardada.eventoGoogleId` justo para poder retirarlo: dejar eventos
huérfanos en el calendario real de alguien es la clase de cosa por la que se desinstala una
aplicación.

---

## Desplegar

Vercel, con las variables de `.env.example` configuradas en el proyecto. `output: "export"` ya
no está —las rutas de API lo impiden—, pero las 188 fichas de sesión y las 18 de lugar siguen
generándose en compilación con `generateStaticParams`, así que cada charla conserva sus
etiquetas Open Graph propias al pegar el enlace en WhatsApp.

Pon la dirección definitiva **antes de imprimir los carteles**: los códigos QR se generan al
compilar con esa dirección incrustada.

---

## Marca y diseño

El sistema visual tiene **dos registros**, y la diferencia importa:

- **Festival** (el contenido): el cielo ámbar, el marrón del listón y el crema de la agenda
  impresa de 2026 — `#FAF6EF`, `#DAB866`, `#6B2522`, `#A66946`.
- **Institucional** (el armazón): el verde `#336439` y el amarillo `#F1CF49` de la UPEC, en la
  barra superior, los puntos del mapa y allí donde habla la Universidad.

La jerarquía de cada ficha está calcada de la agenda impresa: **la hora es lo más grande**, y
debajo bajan tres niveles de peso — título, quién, dónde. Cada tipo de actividad lleva color
**e icono**: el color solo no sirve para quien no lo distingue.

Los textos de color usan `--muted: #836a56` y `--gold: #8d6523`. No son decorativos: los
anteriores daban 4.03:1 y 3.69:1, por debajo del mínimo AA de 4.5:1, en el color que pinta el
nombre del edificio —el dato por el que existe esta aplicación—. Al sol de Tulcán, en un móvil
al 40 % de brillo, no se leían.

### Movimiento

Transiciones de estado, nunca animaciones de entrada. Con 34 filas por día, un escalonado de
entrada se lee como lentitud. Lo que hay: el rebote al guardar, el destello de la fila, el
contador de la navegación, la barra de avance deslizándose, los pines encendidos respirando, el
reflujo al filtrar y las hojas que suben. Todo entre 180 y 420 ms, y todo bajo el guardián de
`prefers-reduced-motion` que ya existía.

---

## Cómo está hecho

- **`data/agenda.json` se genera**, no se edita a mano. El parser falla ruidosamente ante un
  lugar desconocido: mandar a alguien al edificio equivocado es el peor fallo posible aquí.
- **Las coordenadas de los 16 marcadores del mapa** se detectaron píxel a píxel
  (`node scripts/detectar-pines.mjs`) en vez de estimarse a ojo.
- **Hora anclada a `America/Guayaquil`** con `Intl`, no con el reloj del dispositivo. Lo que
  hay que proteger no es la aritmética de UTC−5: es que un teléfono en otra zona no caiga en
  el día equivocado del festival.
- **Las permanentes no generan choques.** La muestra editorial abre de 08:30 a 18:00 y se
  solaparía con todo; contarla llenaría «Mi agenda» de colisiones falsas.
- **El `.ics` sigue ahí** para quien no use Google Calendar. Se apoya en el recordatorio que la
  gente ya tiene configurado y funciona en todos los teléfonos.

### Estructura

```
app/
  api/auth/[...all]  Better Auth
  api/guardadas      la agenda personal (lotes idempotentes)
  api/calendario     el interruptor de Google Calendar
components/          interfaz; las que dependen de la hora o de la sesión son de cliente
lib/
  auth.ts            Better Auth en el servidor
  auth-cliente.ts    y en el navegador
  db.ts              conexión a Neon
  guardadas.ts       espejo local + cola offline
  guardadas-servidor.ts  la verdad, en la base de datos
  calendario.ts      Google Calendar
  tiempo.ts          zona horaria del evento, formatos, hora simulada
  datos.ts           consultas: ahora, a continuación, búsqueda, choques
  ics.ts             exportación a calendario
data/
  lugares.ts         los 15 puntos + sedes fuera del campus, con coordenadas
  agenda.json        generado — no editar
db/
  esquema.sql        las seis tablas
docs/
  Agenda_..._2026.md fuente de la programación
scripts/
  parse-agenda.mjs   Markdown → JSON, con validación de lugares
```

---

## Aviso

Sitio no oficial, hecho por un estudiante. Toda la programación procede de la agenda oficial de
la Universidad Politécnica Estatal del Carchi. Si la Universidad quiere adoptarlo, el proyecto
se entrega tal cual.
