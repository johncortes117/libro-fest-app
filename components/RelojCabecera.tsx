"use client";

import { diaDe, hhmm } from "@/lib/tiempo";
import { useMomento } from "./Reloj";

/**
 * El reloj del festival. Se pone en amarillo cuando la hora viene de `?t=`.
 *
 * Mientras la hora no se sabe —el HTML estático se sirve antes de que el navegador
 * hidrate— se pinta un hueco del mismo tamaño con «--:--». Antes no se pintaba
 * nada y la cabecera daba un salto en cada carga, que es lo primero que ve todo el
 * mundo cada vez que abre la aplicación.
 */
export default function RelojCabecera() {
  const momento = useMomento();

  if (!momento) {
    return (
      <span className="reloj-cabecera esperando" aria-hidden>
        <span className="punto" />
        --:--
      </span>
    );
  }

  const dia = diaDe(momento.fecha);

  return (
    <span
      className={momento.simulado ? "reloj-cabecera simulado" : "reloj-cabecera"}
      title={momento.simulado ? "Hora simulada con ?t= en la URL" : "Hora de Ecuador"}
    >
      <span className="punto" aria-hidden />
      {dia ? `${dia.corto} ` : ""}
      {hhmm(momento.minutos)}
      {momento.simulado && <span className="solo-lectores"> (hora simulada)</span>}
    </span>
  );
}
