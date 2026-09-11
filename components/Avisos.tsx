"use client";

import { useEffect, useState } from "react";
import type { Aviso } from "@/lib/tipos";
import { useMomento } from "./Reloj";
import { IconoAlerta } from "./Iconos";

/**
 * Cambios de última hora, servidos aparte del paquete.
 *
 * Durante los cinco días del festival algo se cancela o cambia de sala casi cada
 * mañana. Editar `public/avisos.json` y subirlo basta para avisar a todo el mundo,
 * sin tocar el código y sin esperar a que compile nada.
 */
export default function Avisos({ sesionId }: { sesionId?: string }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const momento = useMomento();

  useEffect(() => {
    let vivo = true;
    fetch("/avisos.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { avisos: [] }))
      .then((d) => {
        if (vivo && Array.isArray(d?.avisos)) setAvisos(d.avisos);
      })
      .catch(() => {
        // Sin conexión no hay avisos nuevos, y no pasa nada: el programa
        // completo ya viaja dentro de la aplicación.
      });
    return () => {
      vivo = false;
    };
  }, []);

  const visibles = avisos.filter((a) => {
    if (sesionId) return a.sesionId === sesionId;
    if (a.sesionId) return false;
    if (a.dia && momento && a.dia !== momento.fecha) return false;
    return true;
  });

  if (visibles.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
      {visibles.map((a) => (
        <p key={a.id} className={a.nivel === "alerta" ? "aviso alerta" : "aviso"} role="status">
          <IconoAlerta aria-hidden style={{ width: 16, height: 16, flex: "none", marginTop: 3 }} />
          <span>{a.texto}</span>
        </p>
      ))}
    </div>
  );
}
