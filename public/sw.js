/**
 * Service worker del UPEC Libro Fest 2026.
 *
 * El wifi de un campus con dos mil visitantes no aguanta, así que la aplicación
 * tiene que abrir igual sin conexión. La estrategia depende de qué se pide:
 *
 *  - `/_next/static/*` lleva el hash del contenido en el nombre, así que nunca
 *    cambia sin cambiar de URL: se sirve desde la caché directamente.
 *  - El HTML y los datos se piden primero a la red, con la caché de respaldo. Durante
 *    el festival se despliega una corrección al día, y servir una página vieja sería
 *    peor que tardar medio segundo más.
 *  - `avisos.json` no se cachea nunca: es justo lo que tiene que llegar fresco.
 *  - `/api/*` no pasa por aquí en absoluto. Desde que hay cuentas, esas respuestas
 *    son de una persona concreta y algunas llevan tokens, y la caché del service
 *    worker la comparte todo el navegador.
 *
 * Al cambiar VERSION se borran las cachés anteriores en la siguiente carga.
 */
const VERSION = "v3-cuentas";
const ESTATICA = `librofest-estatica-${VERSION}`;
const DINAMICA = `librofest-dinamica-${VERSION}`;

/**
 * Lo mínimo para que la aplicación abra sin red desde el primer momento.
 *
 * «/mi-agenda/» sí está: su HTML es un armazón prerenderizado sin datos de nadie
 * —lo que se pinta dentro lo trae el cliente del espejo local y de /api/—, así que
 * cachearlo no filtra nada y permite abrir la agenda propia sin conexión. Lo que
 * nunca se cachea es /api/, que es donde viven las respuestas por usuario.
 *
 * Las fichas de lugar sí van: son el destino de los códigos QR colgados en cada
 * edificio, y ese es exactamente el momento en que el wifi no responde. La lista
 * sale de `data/lugares.ts`; si cambia allí, hay que cambiarla aquí.
 */
const BASE = [
  "/",
  "/agenda/",
  "/mapa/",
  "/mi-agenda/",
  "/datos/",
  "/lugar/edificio-principal/",
  "/lugar/auditorio-principal/",
  "/lugar/plaza-roja/",
  "/lugar/aulas-2/",
  "/lugar/aulas-4/",
  "/lugar/coliseo/",
  "/lugar/parqueadero-julio-robles/",
  "/lugar/cancha-sintetica/",
  "/lugar/agora/",
  "/lugar/aulas-1/",
  "/lugar/aulas-3/",
  "/lugar/posgrados/",
  "/lugar/parqueadero-antisana/",
  "/lugar/centro-convenciones/",
  "/lugar/auditorio-convenciones/",
  "/lugar/sala-presentaciones/",
  "/lugar/banco-republica-ipiales/",
  "/lugar/universidad-narino/",
  "/img/mapa-campus.png",
  "/img/icono-192.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(ESTATICA)
      // `reload` evita que el propio caché HTTP del navegador nos cuele una copia vieja.
      .then((c) => c.addAll(BASE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((k) => k !== ESTATICA && k !== DINAMICA).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.method !== "GET") return;

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;

  // Nada de la API pasa por aquí. Son respuestas de un usuario concreto y algunas
  // llevan tokens: guardarlas en una caché que comparte todo el navegador sería
  // una fuga de sesión, y servirlas desde caché daría los datos de otra persona.
  if (url.pathname.startsWith("/api/")) return;


  // Los avisos de última hora siempre van a la red.
  if (url.pathname === "/avisos.json") {
    evento.respondWith(
      fetch(peticion).catch(
        () =>
          new Response('{"avisos":[]}', {
            headers: { "Content-Type": "application/json" },
          })
      )
    );
    return;
  }

  // Recursos con hash en el nombre: caché primero, sin preguntar a la red.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/img/")) {
    evento.respondWith(
      caches.match(peticion).then(
        (cacheada) =>
          cacheada ??
          fetch(peticion).then((respuesta) => {
            if (respuesta.ok) {
              const copia = respuesta.clone();
              caches.open(ESTATICA).then((c) => c.put(peticion, copia));
            }
            return respuesta;
          })
      )
    );
    return;
  }

  // Todo lo demás: red primero, caché de respaldo.
  evento.respondWith(
    fetch(peticion)
      .then((respuesta) => {
        // Solo se guarda lo que es igual para todo el mundo. `Cache-Control:
        // private` es la marca que ponen las respuestas por usuario.
        const privada = (respuesta.headers.get("Cache-Control") || "").includes("private");
        if (respuesta.ok && !privada) {
          const copia = respuesta.clone();
          caches.open(DINAMICA).then((c) => c.put(peticion, copia));
        }
        return respuesta;
      })
      .catch(async () => {
        const cacheada = await caches.match(peticion);
        if (cacheada) return cacheada;

        // Una ficha que nunca se visitó no está en caché: se devuelve el inicio,
        // que sí lo está, en lugar del error del navegador.
        if (peticion.mode === "navigate") {
          const inicio = await caches.match("/");
          if (inicio) return inicio;
        }

        return new Response("Sin conexión y sin copia guardada de esta página.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
  );
});
