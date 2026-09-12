"use client";

import { useEffect } from "react";

/**
 * Modo kiosko: las pantallas táctiles de pared del campus.
 *
 * No es lo mismo que `/pantalla`, que es un televisor de vestíbulo de solo
 * lectura. Aquí la aplicación es la de siempre —se navega, se filtra, se toca el
 * mapa— con otra escala y sin las piezas que no tienen sentido en un aparato
 * compartido.
 *
 * Se activa con `?kiosko=1`. El atributo lo pone también el guion en línea del
 * armazón para que la escala esté puesta en el primer fotograma; esto se encarga
 * de mantenerlo al navegar entre páginas y del reinicio por inactividad.
 */

const INACTIVIDAD = 90_000;
const AVISO = 15_000;

export default function ModoKiosko() {
  useEffect(() => {
    const esKiosko =
      new URLSearchParams(window.location.search).get("kiosko") === "1" ||
      document.documentElement.dataset.kiosko === "1" ||
      window.sessionStorage.getItem("librofest2026:kiosko") === "1";

    if (!esKiosko) return;

    document.documentElement.dataset.kiosko = "1";
    // Sobrevive a la navegación interna, que pierde la cadena de consulta.
    try {
      window.sessionStorage.setItem("librofest2026:kiosko", "1");
    } catch {
      /* almacenamiento bloqueado: el modo dura lo que la página */
    }

    let reloj = 0;
    let relojAviso = 0;

    const limpiar = () => {
      window.clearTimeout(reloj);
      window.clearTimeout(relojAviso);
      document.documentElement.removeAttribute("data-kiosko-aviso");
    };

    const programar = () => {
      limpiar();
      relojAviso = window.setTimeout(() => {
        document.documentElement.dataset.kioskoAviso = "1";
      }, INACTIVIDAD - AVISO);
      reloj = window.setTimeout(() => {
        // Volver a la portada, no recargar: una recarga en una pantalla de pared
        // sin teclado puede acabar en la pantalla de error del navegador.
        window.location.href = "/?kiosko=1";
      }, INACTIVIDAD);
    };

    const eventos = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    for (const e of eventos) window.addEventListener(e, programar, { passive: true });
    programar();

    return () => {
      for (const e of eventos) window.removeEventListener(e, programar);
      limpiar();
    };
  }, []);

  return null;
}
