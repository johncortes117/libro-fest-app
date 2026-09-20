"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { IconoCerrar, IconoCafe, IconoDescargar } from "./Iconos";

interface ContextoApoyo {
  abrirApoyo: () => void;
  cerrarApoyo: () => void;
}

const CtxApoyo = createContext<ContextoApoyo>({
  abrirApoyo: () => {},
  cerrarApoyo: () => {},
});

export function useApoyo() {
  return useContext(CtxApoyo);
}

export function ProveedorApoyo({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  const abrirApoyo = useCallback(() => setAbierto(true), []);
  const cerrarApoyo = useCallback(() => setAbierto(false), []);

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrarApoyo();
    };
    window.addEventListener("keydown", alPulsar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = overflow;
    };
  }, [abierto, cerrarApoyo]);

  // Escuchar evento global 'abrir-apoyo'
  useEffect(() => {
    const handler = () => setAbierto(true);
    window.addEventListener("abrir-apoyo", handler);
    return () => window.removeEventListener("abrir-apoyo", handler);
  }, []);

  return (
    <CtxApoyo.Provider value={{ abrirApoyo, cerrarApoyo }}>
      {children}

      {abierto && (
        <div className="velo" onClick={cerrarApoyo} role="presentation">
          <div
            className="hoja hoja-apoyo"
            role="dialog"
            aria-modal="true"
            aria-label="Invítame un café"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="hoja-cerrar"
              onClick={cerrarApoyo}
              aria-label="Cerrar modal"
            >
              <IconoCerrar aria-hidden />
            </button>

            {/* 1. Icono arriba del café amarillo */}
            <div className="apoyo-icono-caja" aria-hidden="true">
              <IconoCafe />
            </div>

            {/* 2. Invítame un café */}
            <h2 className="apoyo-titulo">Invítame un café</h2>

            {/* 3. Subtítulo */}
            <p className="apoyo-bajada">
              Esta agenda fue creada de manera voluntaria e independiente para que disfrutes al máximo el UPEC Libro Fest 2026.
            </p>

            {/* 4. QR */}
            <div className="apoyo-qr-card">
              <Image
                src="/img/qr-deuna.png"
                alt="Código QR Deuna de John Cortés"
                width={220}
                height={220}
                className="apoyo-qr-img"
                priority
              />
            </div>

            {/* 5. Aporte voluntario de corazón */}
            <p className="apoyo-qr-sub">
              Aporte voluntario de corazón
            </p>

            {/* 6. Botón 'Guardar QR' */}
            <div className="apoyo-acciones">
              <a
                href="/img/qr-deuna.png"
                download="qr-deuna-johncp.png"
                className="boton-descargar-qr"
                title="Guardar código QR en tus fotos"
              >
                <IconoDescargar aria-hidden />
                <span>Guardar QR</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </CtxApoyo.Provider>
  );
}
