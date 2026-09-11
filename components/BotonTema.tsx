"use client";

import { useEffect, useState } from "react";
import { IconoTema } from "./Iconos";

const CLAVE = "librofest2026:tema";

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

  return (
    <button
      type="button"
      className="boton-icono"
      onClick={alternar}
      aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      <IconoTema aria-hidden />
    </button>
  );
}
