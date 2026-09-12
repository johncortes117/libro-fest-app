"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { IconoCerrar } from "./Iconos";

/**
 * «Llévatelo al móvil», solo en las pantallas táctiles del campus.
 *
 * Es la función que hace que un kiosko valga más que un televisor caro. En una
 * pantalla compartida no se puede guardar nada —sería la selección de un
 * desconocido esperando al siguiente—, así que el gesto útil es el contrario:
 * encuentro la charla aquí, escaneo, y sigo en mi teléfono, donde sí tengo cuenta.
 *
 * El código apunta a la página que se está mirando, sin `kiosko=1`, así que el
 * teléfono abre la aplicación normal justo donde estaba el visitante.
 */
export default function QrLlevar() {
  const [esKiosko, setEsKiosko] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    setEsKiosko(document.documentElement.dataset.kiosko === "1");
  }, []);

  const generar = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("kiosko");
    try {
      setSvg(
        await QRCode.toString(url.toString(), {
          type: "svg",
          errorCorrectionLevel: "M",
          margin: 0,
          width: 240,
          color: { dark: "#14261aff", light: "#ffffff00" },
        })
      );
      setAbierto(true);
    } catch {
      /* si el código no se puede generar, no abrimos una hoja vacía */
    }
  }, []);

  useEffect(() => {
    if (!abierto) return;
    // Se cierra sola: nadie va a pulsar «cerrar» antes de irse de la pantalla.
    const reloj = window.setTimeout(() => setAbierto(false), 45_000);
    return () => window.clearTimeout(reloj);
  }, [abierto]);

  if (!esKiosko) return null;

  return (
    <>
      <button type="button" className="boton-llevar" onClick={() => void generar()}>
        Llévatelo al móvil
      </button>

      {abierto && (
        <div className="velo" onClick={() => setAbierto(false)} role="presentation">
          <div className="hoja" role="dialog" aria-label="Código para abrir en el móvil" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="hoja-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar">
              <IconoCerrar aria-hidden />
            </button>
            <h2>Escanea y sigue en tu teléfono</h2>
            <div className="qr-grande" dangerouslySetInnerHTML={{ __html: svg }} />
            <p>Abre esta misma página en tu móvil, donde puedes entrar y guardar lo que quieras ver.</p>
          </div>
        </div>
      )}
    </>
  );
}
