"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  maxAngle?: number;
}

export default function Card3D({ children, className = "", maxAngle = 14 }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<{
    transform: string;
    glareOpacity: number;
    glarePosition: { x: number; y: number };
    transition: string;
  }>({
    transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    glareOpacity: 0,
    glarePosition: { x: 50, y: 50 },
    transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxAngle;
    const rotateY = ((x - centerX) / centerX) * maxAngle;

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.04, 1.04, 1.04)`,
      glareOpacity: 0.32,
      glarePosition: {
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      },
      transition: "transform 0.08s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      glareOpacity: 0,
      glarePosition: { x: 50, y: 50 },
      transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
    });
  };

  return (
    <div
      ref={cardRef}
      className={`tarjeta-3d-contenedor ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: style.transform,
        transition: style.transition,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      <div
        className="tarjeta-3d-brillo"
        style={{
          opacity: style.glareOpacity,
          background: `radial-gradient(circle at ${style.glarePosition.x}% ${style.glarePosition.y}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
