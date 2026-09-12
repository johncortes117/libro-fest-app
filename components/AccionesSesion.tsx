"use client";

import { useState } from "react";
import { useGuardadas } from "@/lib/guardadas";
import { descargarIcs } from "@/lib/ics";
import type { Sesion } from "@/lib/tipos";
import { useEntrada } from "./Entrada";
import { useBrindis } from "./Brindis";
import { IconoCalendario, IconoCompartir, IconoGuardado, IconoGuardar } from "./Iconos";

export default function AccionesSesion({ sesion }: { sesion: Sesion }) {
  const { contiene, alternar } = useGuardadas();
  const { pedirEntrada } = useEntrada();
  const { brindar } = useBrindis();
  const [copiado, setCopiado] = useState(false);
  const guardada = contiene(sesion.id);

  function alGuardar() {
    const resultado = alternar(sesion.id);
    if (resultado === "necesita-entrar") {
      pedirEntrada("Entra para guardar esta actividad");
      return;
    }
    if (resultado === "guardada") brindar({ texto: "Guardada en tu agenda" });
  }

  async function compartir() {
    const url = window.location.href;
    const datos = { title: sesion.titulo, text: `${sesion.titulo} · UPEC Libro Fest 2026`, url };

    if (navigator.share) {
      try {
        await navigator.share(datos);
        return;
      } catch {
        // El usuario canceló: no es un error, se cae al portapapeles.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2400);
    } catch {
      // Sin permiso de portapapeles queda la barra de direcciones, que ya tiene el enlace.
    }
  }

  return (
    <div className="botonera">
      <button
        type="button"
        className={guardada ? "boton activo" : "boton primario"}
        onClick={alGuardar}
        aria-pressed={guardada}
      >
        {guardada ? <IconoGuardado aria-hidden /> : <IconoGuardar aria-hidden />}
        {guardada ? "En mi agenda" : "Guardar"}
      </button>

      {!sesion.permanente && (
        <button
          type="button"
          className="boton"
          onClick={() => descargarIcs([sesion], `librofest-${sesion.id}`)}
        >
          <IconoCalendario aria-hidden />
          Añadir al calendario
        </button>
      )}

      <button type="button" className="boton" onClick={compartir}>
        <IconoCompartir aria-hidden />
        {copiado ? "Enlace copiado" : "Compartir"}
      </button>
    </div>
  );
}
