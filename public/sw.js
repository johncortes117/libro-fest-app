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
 *
 * Al cambiar VERSION se borran las cachés anteriores en la siguiente carga.
 */
const VERSION = "v1";
const ESTATICA = `librofest-estatica-${VERSION}`;
const DINAMICA = `librofest-dinamica-${VERSION}`;

/** Lo mínimo para que la aplicación abra sin red desde el primer momento. */
const BASE = [
  "/",
  "/agenda/",
  "/mapa/",
  "/mi-agenda/",
  "/editoriales/",
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

  // Los avisos de última hora siempre van a la red.
  if (url.pathname === "/avisos.json") {
    evento.respondWith(fetch(peticion).catch(() => new Response('{"avisos":[]}', {
      headers: { "Content-Type": "application/json" },
    })));
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
        if (respuesta.ok) {
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
