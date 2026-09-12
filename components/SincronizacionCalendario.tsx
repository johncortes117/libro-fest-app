"use client";

import { useCallback, useEffect, useState } from "react";
import { conectarCalendario } from "@/lib/auth-cliente";
import { useBrindis } from "./Brindis";
import { IconoCalendario, IconoGoogle } from "./Iconos";

/**
 * El interruptor de «añadir lo que guarde a mi Google Calendar».
 *
 * Empieza apagado, y es deliberado. Escribir en el calendario real de una persona
 * cada vez que toca un botón es la clase de sorpresa por la que se desinstala una
 * aplicación; y si además se apagara sin limpiar, le dejaríamos veinte eventos
 * fantasma en la semana. Por eso encender crea y apagar retira.
 *
 * El permiso de calendario tampoco se pide al entrar: se pide aquí, que es el
 * único momento en que la persona entiende para qué sirve.
 */
export default function SincronizacionCalendario() {
  const { brindar } = useBrindis();
  const [activo, setActivo] = useState(false);
  const [tienePermiso, setTienePermiso] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState(false);

  const leerEstado = useCallback(async () => {
    try {
      const r = await fetch("/api/guardadas/", { cache: "no-store" });
      if (!r.ok) return;
      const d = (await r.json()) as { calendario?: boolean; permisoCalendario?: boolean };
      setActivo(Boolean(d.calendario));
      setTienePermiso(Boolean(d.permisoCalendario));
    } catch {
      /* sin red: el interruptor se queda como estaba y no se puede tocar */
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void leerEstado();
  }, [leerEstado]);

  async function alternar() {
    const siguiente = !activo;
    setTrabajando(true);

    try {
      const r = await fetch("/api/calendario/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: siguiente }),
      });

      if (r.status === 403) {
        // Falta el permiso de calendario: mandamos a concederlo y al volver la
        // persona aterriza otra vez aquí.
        await conectarCalendario("/mi-agenda/");
        return;
      }

      if (!r.ok) {
        brindar({ texto: "No se pudo cambiar la sincronización. Inténtalo otra vez.", tono: "alerta" });
        return;
      }

      const d = (await r.json()) as { cambiados?: number };
      setActivo(siguiente);
      brindar({
        texto: siguiente
          ? d.cambiados
            ? `${d.cambiados} ${d.cambiados === 1 ? "actividad añadida" : "actividades añadidas"} a tu Google Calendar`
            : "Sincronización activada. Lo que guardes se añadirá a tu calendario."
          : d.cambiados
            ? `${d.cambiados} ${d.cambiados === 1 ? "evento retirado" : "eventos retirados"} de tu calendario`
            : "Sincronización desactivada.",
      });
    } catch {
      brindar({ texto: "Sin conexión. La sincronización necesita red.", tono: "alerta" });
    } finally {
      setTrabajando(false);
    }
  }

  if (cargando) return null;

  return (
    <div className="sync-calendario">
      <span className="sync-icono" aria-hidden>
        <IconoCalendario />
      </span>

      <div className="sync-texto">
        <p className="sync-titulo">Añadir a mi Google Calendar</p>
        <p className="sync-detalle">
          {activo
            ? "Lo que guardes aparece en tu calendario. Al quitarlo de aquí, se retira de allí."
            : tienePermiso
              ? "Apagado. Nada de esto está en tu calendario."
              : "Pediremos permiso a Google la primera vez."}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label="Sincronizar mi agenda con Google Calendar"
        className="interruptor"
        disabled={trabajando}
        onClick={() => void alternar()}
      >
        <span className="bolita" aria-hidden />
      </button>

      {!tienePermiso && !activo && (
        <button
          type="button"
          className="boton-google compacto"
          onClick={() => void conectarCalendario("/mi-agenda/")}
        >
          <IconoGoogle aria-hidden />
          Conectar
        </button>
      )}
    </div>
  );
}
