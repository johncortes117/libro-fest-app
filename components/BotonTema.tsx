"use client";

import { useEffect, useState } from "react";
import { IconoLuna, IconoSol } from "./Iconos";

const CLAVE = "librofest2026:tema";

/**
 * El icono dice en qué tema estás, no solo a cuál vas.
 *
 * Antes era siempre una luna y solo cambiaba la etiqueta para lectores de
 * pantalla: quien lo miraba no sabía si la luna significaba «estás en oscuro» o
 * «pulsa para oscuro». Ahora el sol sale en tema oscuro —lo que te dan al
 * pulsarlo— y la luna en claro.
 */
export default function BotonTema() {
  const [tema, setTema] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const guardado = (() => {
      try {
        return localStorage.getItem(CLAVE);
      } catch {
        return null;
      }
    })();
    if (guardado === "dark" || guardado === "light") setTema(guardado);
    else setTema(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  function alternar() {
    const siguiente = tema === "dark" ? "light" : "dark";
    setTema(siguiente);
    document.documentElement.dataset.theme = siguiente;
    try {
      localStorage.setItem(CLAVE, siguiente);
    } catch {
      /* almacenamiento bloqueado: el tema dura lo que la pestaña */
    }
  }

  // Hueco del mismo tamaño mientras no se sabe el tema: sin esto la cabecera
  // salta, y pintar un icono al azar sería peor que no pintar ninguno.
  if (tema === null) return <span className="hueco-icono" aria-hidden />;

  return (
    <button
      type="button"
      className="boton-icono"
      onClick={alternar}
      aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {tema === "dark" ? <IconoSol aria-hidden /> : <IconoLuna aria-hidden />}
    </button>
  );
}
