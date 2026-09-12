"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { entrarConGoogle } from "@/lib/auth-cliente";
import { IconoCerrar, IconoGoogle, IconoGuardar } from "./Iconos";

/**
 * La hoja de entrada.
 *
 * Aparece cuando alguien toca «guardar» sin haber entrado. No es una página
 * aparte a propósito: mandar a alguien a `/entrar` le hace perder de vista la
 * actividad que estaba intentando guardar, y volver de Google a una pantalla
 * distinta de la que dejó se siente como haber empezado de cero.
 *
 * La actividad que disparó la hoja queda anotada y se guarda sola al volver, así
 * que el gesto original no se pierde ni hay que repetirlo.
 */

interface Contexto {
  pedirEntrada: (motivo?: string) => void;
}

const Ctx = createContext<Contexto>({ pedirEntrada: () => {} });

export function useEntrada() {
  return useContext(Ctx);
}

export function ProveedorEntrada({ children }: { children: React.ReactNode }) {
  const [motivo, setMotivo] = useState<string | null>(null);
  const abierta = motivo !== null;

  const pedirEntrada = useCallback((m?: string) => {
    setMotivo(m ?? "Para guardar actividades");
  }, []);

  const cerrar = useCallback(() => setMotivo(null), []);

  useEffect(() => {
    if (!abierta) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alPulsar);
    // Bloquear el desplazamiento de fondo mientras la hoja está abierta.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = overflow;
    };
  }, [abierta, cerrar]);

  return (
    <Ctx.Provider value={{ pedirEntrada }}>
      {children}

      {abierta && (
        <div className="velo" onClick={cerrar} role="presentation">
          <div
            className="hoja"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-entrada"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="hoja-cerrar" onClick={cerrar} aria-label="Cerrar">
              <IconoCerrar aria-hidden />
            </button>

            <span className="hoja-icono" aria-hidden>
              <IconoGuardar />
            </span>

            <h2 id="titulo-entrada">{motivo}</h2>
            <p>
              Tu agenda te sigue entre el teléfono, el ordenador y las pantallas del campus. Y si
              quieres, cada actividad que guardes se añade a tu Google Calendar.
            </p>

            <button
              type="button"
              className="boton-google"
              onClick={() => {
                void entrarConGoogle();
              }}
            >
              <IconoGoogle aria-hidden />
              Continuar con Google
            </button>

            <p className="hoja-pie">
              Solo pedimos tu nombre y tu correo. El acceso al calendario se pide aparte, y solo si
              lo enciendes.
            </p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
