"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IconoDeshacer } from "./Iconos";

/**
 * Avisos efímeros.
 *
 * Sustituyen a `window.confirm` para vaciar la agenda y dan la confirmación que
 * faltaba al guardar. La regla es: una acción destructiva no pregunta antes, se
 * hace y se ofrece deshacerla. Preguntar «¿estás seguro?» traslada el trabajo a la
 * persona; deshacer lo asume la aplicación.
 */

export interface Brindis {
  id: number;
  texto: string;
  /** Si viene, se pinta un botón «Deshacer» que lo llama y cierra el aviso. */
  deshacer?: () => void;
  tono?: "normal" | "alerta";
}

interface Contexto {
  brindar: (b: Omit<Brindis, "id">) => void;
}

const Ctx = createContext<Contexto>({ brindar: () => {} });

export function useBrindis() {
  return useContext(Ctx);
}

const DURACION = 6000;

export function ProveedorBrindis({ children }: { children: React.ReactNode }) {
  const [lista, setLista] = useState<Brindis[]>([]);
  const siguienteId = useRef(1);
  const relojes = useRef(new Map<number, number>());

  const cerrar = useCallback((id: number) => {
    setLista((prev) => prev.filter((b) => b.id !== id));
    const reloj = relojes.current.get(id);
    if (reloj) window.clearTimeout(reloj);
    relojes.current.delete(id);
  }, []);

  const brindar = useCallback(
    (b: Omit<Brindis, "id">) => {
      const id = siguienteId.current++;
      // Como mucho tres a la vez: guardar rápido varias actividades no debe
      // tapar la pantalla con su propia confirmación.
      setLista((prev) => [...prev.slice(-2), { ...b, id }]);
      relojes.current.set(
        id,
        window.setTimeout(() => cerrar(id), DURACION)
      );
    },
    [cerrar]
  );

  useEffect(() => {
    const actuales = relojes.current;
    return () => {
      for (const reloj of actuales.values()) window.clearTimeout(reloj);
      actuales.clear();
    };
  }, []);

  return (
    <Ctx.Provider value={{ brindar }}>
      {children}
      <div className="brindis-pila" role="status" aria-live="polite">
        {lista.map((b) => (
          <div key={b.id} className={b.tono === "alerta" ? "brindis alerta" : "brindis"}>
            <span>{b.texto}</span>
            {b.deshacer && (
              <button
                type="button"
                onClick={() => {
                  b.deshacer!();
                  cerrar(b.id);
                }}
              >
                <IconoDeshacer aria-hidden />
                Deshacer
              </button>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export default function Brindis() {
  return null;
}
