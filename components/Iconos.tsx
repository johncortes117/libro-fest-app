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
