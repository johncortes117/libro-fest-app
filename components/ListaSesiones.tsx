"use client";

import type { Sesion } from "@/lib/tipos";
import FilaSesion from "./FilaSesion";

interface Props {
  sesiones: Sesion[];
  relativo?: boolean;
  mostrarDia?: boolean;
  idsQueChocan?: Set<string>;
  vacio?: string;
}

export default function ListaSesiones({ sesiones, relativo, mostrarDia, idsQueChocan, vacio }: Props) {
  if (sesiones.length === 0) {
    return <p className="vacio">{vacio ?? "Nada por aquí."}</p>;
  }

  return (
    <div className="lista">
      {sesiones.map((s) => (
        <FilaSesion
          key={`${s.id}-${s.dia}`}
          sesion={s}
          relativo={relativo}
          mostrarDia={mostrarDia}
          choca={idsQueChocan?.has(s.id)}
        />
      ))}
    </div>
  );
}
