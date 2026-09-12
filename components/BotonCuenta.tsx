"use client";

import { useEffect, useRef, useState } from "react";
import { clienteAuth, useSession } from "@/lib/auth-cliente";
import { useEntrada } from "./Entrada";
import { IconoCuenta, IconoSalir } from "./Iconos";

/**
 * La cuenta, en la cabecera.
 *
 * Sin sesión no dice «Iniciar sesión»: dice «Entrar», y solo aparece como un
 * icono hasta que hace falta. Empujar a registrarse a quien solo quiere mirar el
 * programa sería exactamente el muro que no queremos.
 */
export default function BotonCuenta() {
  const { data, isPending } = useSession();
  const { pedirEntrada } = useEntrada();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  if (isPending) {
    // Hueco del mismo tamaño: sin esto la cabecera da un salto al resolverse
    // la sesión, que es el mismo defecto que ya teníamos con el reloj.
    return <span className="hueco-cuenta" aria-hidden />;
  }

  if (!data?.user) {
    return (
      <button type="button" className="boton-entrar" onClick={() => pedirEntrada("Entra para guardar")}>
        <IconoCuenta aria-hidden />
        <span>Entrar</span>
      </button>
    );
  }

  const usuario = data.user;
  const inicial = (usuario.name || usuario.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="cuenta" ref={caja}>
      <button
        type="button"
        className="cuenta-avatar"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        aria-label={`Cuenta de ${usuario.name || usuario.email}`}
      >
        {usuario.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={usuario.image} alt="" width={30} height={30} referrerPolicy="no-referrer" />
        ) : (
          <span aria-hidden>{inicial}</span>
        )}
      </button>

      {abierto && (
        <div className="cuenta-menu" role="menu">
          <p className="cuenta-nombre">{usuario.name}</p>
          <p className="cuenta-correo">{usuario.email}</p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false);
              void clienteAuth.signOut();
            }}
          >
            <IconoSalir aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
