"use client";

import { useRef, useState, type ReactNode, type MouseEvent, type TouchEvent } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  maxAngle?: number;
}

export default function Card3D({ children, className = "", maxAngle = 22 }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [interacting, setInteracting] = useState(false);
  const [manualStyle, setManualStyle] = useState<{
    transform: string;
    glareOpacity: number;
    glarePosition: { x: number; y: number };
  }>({
    transform: "",
    glareOpacity: 0.15,
    glarePosition: { x: 30, y: 30 },
  });

  const updateTilt = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    setInteracting(true);
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = Math.max(-maxAngle, Math.min(maxAngle, ((y - centerY) / centerY) * -maxAngle));
    const rotateY = Math.max(-maxAngle, Math.min(maxAngle, ((x - centerX) / centerX) * maxAngle));

    setManualStyle({
      transform: `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.06, 1.06, 1.06)`,
      glareOpacity: 0.38,
      glarePosition: {
        x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
        y: Math.max(0, Math.min(100, (y / rect.height) * 100)),
      },
    });
  };

  const handleEndInteraction = () => {
    setInteracting(false);
  };

  return (
    <div
      ref={cardRef}
      className={`libro-3d-escenario ${interacting ? "interactuando" : "animando-libre"} ${className}`}
      onMouseMove={(e: MouseEvent<HTMLDivElement>) => updateTilt(e.clientX, e.clientY)}
      onMouseLeave={handleEndInteraction}
      onTouchStart={(e: TouchEvent<HTMLDivElement>) => {
        if (e.touches.length > 0) updateTilt(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e: TouchEvent<HTMLDivElement>) => {
        if (e.touches.length > 0) updateTilt(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handleEndInteraction}
    >
      <div
        className="libro-3d-cuerpo"
        style={interacting ? { transform: manualStyle.transform, animation: "none", transition: "transform 0.08s ease-out" } : undefined}
      >
        {/* Lomo del libro (Spine) en el lado izquierdo */}
        <div className="libro-lomo" aria-hidden="true">
          <span className="libro-lomo-texto">ULIF &apos;26</span>
          <span className="libro-lomo-nervio n1" />
          <span className="libro-lomo-nervio n2" />
          <span className="libro-lomo-nervio n3" />
        </div>

        {/* Contraportada (Back cover) */}
        <div className="libro-contraportada" aria-hidden="true" />

        {/* Bloque de páginas: canto derecho con textura de hojas */}
        <div className="libro-paginas-derecha" aria-hidden="true" />

        {/* Bloque de páginas: canto superior */}
        <div className="libro-paginas-arriba" aria-hidden="true" />

        {/* Bloque de páginas: canto inferior */}
        <div className="libro-paginas-abajo" aria-hidden="true" />

        {/* Cinta marcapáginas dorada clásica */}
        <div className="libro-cinta" aria-hidden="true" />

        {/* Portada frontal (Front cover) con imagen */}
        <div className="libro-portada">
          {children}
          {/* Ranura / hendidura de bisagra del lomo */}
          <div className="libro-ranura-lomo" aria-hidden="true" />
          {/* Brillo dinámico de iluminación */}
          <div
            className="tarjeta-3d-brillo"
            style={
              interacting
                ? {
                    opacity: manualStyle.glareOpacity,
                    background: `radial-gradient(circle at ${manualStyle.glarePosition.x}% ${manualStyle.glarePosition.y}%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0) 65%)`,
                    animation: "none",
                  }
                : undefined
            }
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Sombra 3D suave */}
      <div className="libro-sombra" aria-hidden="true" />
    </div>
  );
}
