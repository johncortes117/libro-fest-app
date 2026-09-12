"use client";

import { TIPOS, type TipoSesion } from "@/lib/tipos";
import { ICONO_TIPO } from "./FilaSesion";

/** La etiqueta de tipo: color e icono siempre juntos. */
export default function EtiquetaTipo({ tipo, grande }: { tipo: TipoSesion; grande?: boolean }) {
  const Icono = ICONO_TIPO[tipo];
  return (
    <span
      className="sesion-tipo"
      style={
        {
          "--color-tipo": `var(--t-${tipo})`,
          fontSize: grande ? "0.78rem" : undefined,
        } as React.CSSProperties
      }
    >
      <Icono />
      {TIPOS[tipo].nombre}
    </span>
  );
}
