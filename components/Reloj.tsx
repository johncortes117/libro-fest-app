"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { momentoDe, momentoSimulado, type Momento } from "@/lib/tiempo";

/**
 * El momento actual, en hora de Ecuador.
 *
 * Vale `null` hasta que el navegador hidrata la página. Eso es deliberado: el sitio
 * se genera estático días antes del festival, así que calcular la hora durante el
 * render dejaría la fecha de compilación cocida en el HTML y además rompería la
 * hidratación de React. Las vistas que dependen de la hora enseñan su versión
 * neutra mientras esto sea `null`, y se actualizan en cuanto deja de serlo.
 */
const Contexto = createContext<Momento | null>(null);

export function ProveedorMomento({ children }: { children: React.ReactNode }) {
  const [momento, setMomento] = useState<Momento | null>(null);

  useEffect(() => {
    // `?t=2026-09-24T15:10` congela la hora para poder probar y demostrar
    // la vista «ahora» antes del 21 de septiembre.
    const simulado = momentoSimulado(window.location.search);
    if (simulado) {
      setMomento(simulado);
      return;
    }

    const latido = () => setMomento(momentoDe(new Date()));
    latido();
    const id = window.setInterval(latido, 20_000);
    return () => window.clearInterval(id);
  }, []);

  return <Contexto.Provider value={momento}>{children}</Contexto.Provider>;
}

export function useMomento(): Momento | null {
  return useContext(Contexto);
}
