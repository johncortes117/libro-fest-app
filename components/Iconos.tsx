/** Iconos de línea, dibujados a mano para que pesen cero y hereden el color. */

type Props = { className?: string; style?: React.CSSProperties; "aria-hidden"?: boolean };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconoAhora = (p: Props) => (
  <svg {...base} {...p} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 1.9" /></svg>
);

export const IconoAgenda = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4M7.6 13.5h3M7.6 17h6" />
  </svg>
);

export const IconoMapa = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconoGuardar = (p: Props) => (
  <svg {...base} {...p} aria-hidden><path d="M6.5 3.8h11a1 1 0 0 1 1 1v15.4l-6.5-4-6.5 4V4.8a1 1 0 0 1 1-1Z" /></svg>
);

export const IconoGuardado = (p: Props) => (
  <svg {...base} {...p} fill="currentColor" aria-hidden>
    <path d="M6.5 3.8h11a1 1 0 0 1 1 1v15.4l-6.5-4-6.5 4V4.8a1 1 0 0 1 1-1Z" />
  </svg>
);

export const IconoBuscar = (p: Props) => (
  <svg {...base} {...p} aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
);

export const IconoLibros = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M4 5.2A1.2 1.2 0 0 1 5.2 4h3.6A1.2 1.2 0 0 1 10 5.2v13.6A1.2 1.2 0 0 1 8.8 20H5.2A1.2 1.2 0 0 1 4 18.8Z" />
    <path d="M13 6.4 16.5 5.4a1.2 1.2 0 0 1 1.5.85l3 12a1.2 1.2 0 0 1-.87 1.45l-2.4.6" />
    <path d="M4 9h6" />
  </svg>
);

export const IconoCerrar = (p: Props) => (
  <svg {...base} {...p} aria-hidden><path d="m6 6 12 12M18 6 6 18" /></svg>
);

export const IconoAlerta = (p: Props) => (
  <svg {...base} {...p} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.2v.1" /></svg>
);

export const IconoCalendario = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4m-5.3 8.4 1.6 1.7 3.2-3.4" />
  </svg>
);

export const IconoCompartir = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M12 15.5V3.8m0 0L8.2 7.6M12 3.8l3.8 3.8" />
    <path d="M5.5 12.5v6.2a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-6.2" />
  </svg>
);

export const IconoTema = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M20 13.4A8 8 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4Z" />
  </svg>
);

export const IconoPantalla = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="2.8" y="4.5" width="18.4" height="12.5" rx="2" /><path d="M8.5 20.5h7" />
  </svg>
);

export const IconoFlecha = (p: Props) => (
  <svg {...base} {...p} aria-hidden><path d="M5 12h13m0 0-5-5m5 5-5 5" /></svg>
);

export const IconoVolver = (p: Props) => (
  <svg {...base} {...p} aria-hidden><path d="M19 12H6m0 0 5-5m-5 5 5 5" /></svg>
);

/* --- un icono por tipo de actividad: el color nunca va solo --- */

export const IconoConferencia = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="9.2" y="2.8" width="5.6" height="10.4" rx="2.8" />
    <path d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0M12 17.6V21M8.6 21h6.8" />
  </svg>
);

export const IconoTaller = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="m14.8 4.6 4.6 4.6M3.5 20.5l1.1-4.3L16 4.8a1.7 1.7 0 0 1 2.4 0l1.3 1.3a1.7 1.7 0 0 1 0 2.4L8.1 19.9Z" />
  </svg>
);

export const IconoCultural = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M9 17.5V5.2l10-1.7v12" />
    <circle cx="6.6" cy="17.8" r="2.6" />
    <circle cx="16.6" cy="15.8" r="2.6" />
  </svg>
);

export const IconoLibro = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M12 6.6S10 4.4 4.6 4.4v12.4C10 16.8 12 19 12 19s2-2.2 7.4-2.2V4.4C14 4.4 12 6.6 12 6.6Z" />
    <path d="M12 6.6V19" />
  </svg>
);

export const IconoPermanente = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M4.5 20.5h15M6.8 20.5V4.8a1 1 0 0 1 1.2-1l7 1.3a1 1 0 0 1 .8 1v14.4" />
    <path d="M12.6 12.6v.1" />
  </svg>
);

export const IconoReloj = (p: Props) => (
  <svg {...base} {...p} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 1.9" /></svg>
);

export const IconoPersonas = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.8 20.2a6.4 6.4 0 0 1 12.4 0M16.2 5.1a3.4 3.4 0 0 1 0 5.9M18 20.2a6.5 6.5 0 0 0-2-4.4" />
  </svg>
);

export const IconoChoque = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M10.3 3.9 1.9 18.1a1.9 1.9 0 0 0 1.7 2.9h16.8a1.9 1.9 0 0 0 1.7-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17.2v.1" />
  </svg>
);

export const IconoInfo = (p: Props) => (
  <svg {...base} {...p} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 11.2v5M12 7.9v.1" /></svg>
);

/* El logotipo de Google va en sus cuatro colores de marca, con relleno y sin
   trazo: es la única excepción al sistema de iconos de línea, porque las normas
   de marca de Google no permiten recolorearlo. */
export const IconoGoogle = (p: Props) => (
  <svg viewBox="0 0 24 24" {...p} aria-hidden>
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.41 13.92a5.99 5.99 0 0 1 0-3.83V7.5H3.06a10 10 0 0 0 0 9l3.35-2.58Z" />
    <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 2.98 14.7 2 12 2A10 10 0 0 0 3.06 7.5l3.35 2.59C7.2 7.71 9.4 5.95 12 5.95Z" />
  </svg>
);

export const IconoSalir = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M9.5 20.5H5.8a1.8 1.8 0 0 1-1.8-1.8V5.3a1.8 1.8 0 0 1 1.8-1.8h3.7M15.5 16.5l4.5-4.5-4.5-4.5M20 12H9.2" />
  </svg>
);

export const IconoSol = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <circle cx="12" cy="12" r="4.1" />
    <path d="M12 2.6v2.1M12 19.3v2.1M21.4 12h-2.1M4.7 12H2.6M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5M18.6 18.6l-1.5-1.5M6.9 6.9 5.4 5.4" />
  </svg>
);

export const IconoLuna = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M20 13.4A8 8 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4Z" />
  </svg>
);

export const IconoNube = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M17.5 19.5h-11a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.63-1.5A3.75 3.75 0 0 1 17.5 19.5Z" />
  </svg>
);

export const IconoSinNube = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M17.5 19.5h-11a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.63-1.5A3.75 3.75 0 0 1 17.5 19.5Z" />
    <path d="M3 3l18 18" />
  </svg>
);

export const IconoDeshacer = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M3.5 8.5h10a5.5 5.5 0 0 1 0 11H8M3.5 8.5 7.8 4.4M3.5 8.5l4.3 4.1" />
  </svg>
);

export const IconoFiltros = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M4 6.5h16M7 12h10M10.5 17.5h3" />
  </svg>
);

export const IconoLupaMas = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" /><path d="M20.5 20.5 15.2 15.2M10.5 7.8v5.4M7.8 10.5h5.4" />
  </svg>
);

export const IconoCuenta = (p: Props) => (
  <svg {...base} {...p} aria-hidden>
    <circle cx="12" cy="8.3" r="3.8" /><path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0" />
  </svg>
);
