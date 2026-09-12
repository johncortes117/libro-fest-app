"use client";

import Link from "next/link";
import { useState } from "react";
import type { Sesion } from "@/lib/tipos";
import ListaSesiones from "./ListaSesiones";
import { IconoFlecha } from "./Iconos";

/**
 * El pie de la ficha de sesión: lo que se solapa y lo que hay en el mismo sitio.
 *
 * Antes eran dos listas completas, una detrás de otra, y sumaban doce filas de
 * media —hasta veinte en el peor caso—. Quien llega aquí desde un enlace de
 * WhatsApp viene a leer un título, una hora y un edificio, no a recibir dos
 * listados.
 *
 * Ahora es un solo bloque con dos pestañas y tope de cinco filas. Lo que no cabe
 * se ve en la agenda, ya filtrada por el día y el lugar correctos.
 */

const TOPE = 5;

interface Props {
  alMismoTiempo: Sesion[];
  mismoLugar: Sesion[];
  dia: string;
  lugarId: string;
  nombreLugar: string;
}

export default function BloqueRelacionadas({
  alMismoTiempo,
  mismoLugar,
  dia,
  lugarId,
  nombreLugar,
}: Props) {
  const [pestana, setPestana] = useState<"choque" | "lugar">(
    alMismoTiempo.length > 0 ? "choque" : "lugar"
  );

  if (alMismoTiempo.length === 0 && mismoLugar.length === 0) return null;

  const activa = pestana === "choque" ? alMismoTiempo : mismoLugar;
  const visibles = activa.slice(0, TOPE);
  const restantes = activa.length - visibles.length;

  const enlaceAgenda =
    pestana === "choque" ? `/agenda/?dia=${dia}` : `/agenda/?dia=${dia}&lugar=${lugarId}`;

  return (
    <section className="bloque">
      <div className="pestanas" role="tablist" aria-label="Actividades relacionadas">
        {alMismoTiempo.length > 0 && (
          <button
            type="button"
            role="tab"
            id="pestana-choque"
            aria-selected={pestana === "choque"}
            aria-controls="panel-relacionadas"
            className="pestana"
            onClick={() => setPestana("choque")}
          >
            Al mismo tiempo
            <span className="cuenta">{alMismoTiempo.length}</span>
          </button>
        )}
        {mismoLugar.length > 0 && (
          <button
            type="button"
            role="tab"
            id="pestana-lugar"
            aria-selected={pestana === "lugar"}
            aria-controls="panel-relacionadas"
            className="pestana"
            onClick={() => setPestana("lugar")}
          >
            Aquí mismo
            <span className="cuenta">{mismoLugar.length}</span>
          </button>
        )}
      </div>

      <div
        id="panel-relacionadas"
        role="tabpanel"
        aria-labelledby={pestana === "choque" ? "pestana-choque" : "pestana-lugar"}
      >
        <ListaSesiones sesiones={visibles} />
      </div>

      {restantes > 0 && (
        <Link href={enlaceAgenda} className="boton" style={{ alignSelf: "flex-start" }}>
          {pestana === "choque"
            ? `Ver las ${activa.length} de esa hora`
            : `Ver las ${activa.length} de ${nombreLugar}`}
          <IconoFlecha aria-hidden />
        </Link>
      )}
    </section>
  );
}
