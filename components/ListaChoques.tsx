"use client";

import Link from "next/link";
import type { Choque } from "@/lib/datos";
import { duracion, hhmm } from "@/lib/tiempo";

/** Los pares de sesiones guardadas que se pisan, con cuánto se solapan. */
export default function ListaChoques({ colisiones }: { colisiones: Choque[] }) {
  if (colisiones.length === 0) return null;

  return (
    <ul className="choques">
      {colisiones.map((c) => (
        <li key={`${c.a.id}|${c.b.id}`}>
          <span className="cuanto">{duracion(c.solape)}</span>
          <span className="par">
            <Link href={`/sesion/${c.a.id}/`}>{c.a.titulo}</Link>
            <span className="vs">
              {hhmm(c.a.inicio)}–{hhmm(c.a.fin)} · se pisa con
            </span>
            <Link href={`/sesion/${c.b.id}/`}>{c.b.titulo}</Link>
            <span className="vs">
              {hhmm(c.b.inicio)}–{hhmm(c.b.fin)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
