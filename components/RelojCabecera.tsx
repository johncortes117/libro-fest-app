"use client";

import { diaDe, hhmm } from "@/lib/tiempo";
import { useMomento } from "./Reloj";

/** El reloj del festival. Avisa cuando la hora está simulada con `?t=`. */
export default function RelojCabecera() {
  const momento = useMomento();
  if (!momento) return null;

  const dia = diaDe(momento.fecha);

  return (
    <span className={momento.simulado ? "reloj simulado" : "reloj"}>
      {momento.simulado && <span title="Hora simulada con ?t= en la URL">simulada ·</span>}
      {dia ? `${dia.corto} · ` : ""}
      {hhmm(momento.minutos)}
    </span>
  );
}
