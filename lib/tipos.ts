export type TipoSesion = "conferencia" | "taller" | "cultural" | "libro" | "permanente";

export interface DatosTipo {
  id: TipoSesion;
  nombre: string;
  plural: string;
  color: string;
}

export const TIPOS: Record<TipoSesion, DatosTipo> = {
  // `nombre` es la etiqueta corta de la ficha; `plural`, la del filtro. Cortas a
  // propósito: «Presentaciones de libros» como etiqueta repetida 60 veces convierte
  // la página en un muro de texto.
  conferencia: { id: "conferencia", nombre: "Conferencia", plural: "Conferencias", color: "var(--t-conferencia)" },
  taller:      { id: "taller",      nombre: "Taller",      plural: "Talleres",     color: "var(--t-taller)" },
  cultural:    { id: "cultural",    nombre: "Cultura",     plural: "Cultura",      color: "var(--t-cultural)" },
  libro:       { id: "libro",       nombre: "Libro",       plural: "Libros",       color: "var(--t-libro)" },
  permanente:  { id: "permanente",  nombre: "Todo el día", plural: "Todo el día",  color: "var(--t-permanente)" },
};

export const ORDEN_TIPOS: TipoSesion[] = ["conferencia", "taller", "cultural", "libro", "permanente"];

export interface FueraDeCampus {
  ciudad: string;
  pais: string;
  maps: string;
}

export interface Lugar {
  id: string;
  /** Número del marcador en el mapa oficial del campus. `null` si está fuera del campus. */
  pin: number | null;
  nombre: string;
  /** Actividades principales, según la leyenda del mapa oficial. */
  descripcion: string;
  /** Posición de la punta del marcador sobre la imagen del mapa, en % del ancho y alto. */
  x: number | null;
  y: number | null;
  fuera?: FueraDeCampus;
  /**
   * El lugar se dedujo de la leyenda del mapa pero la organización no lo ha confirmado.
   * Se muestra siempre marcado en la interfaz: mandar a alguien al edificio equivocado
   * es peor que admitir que no lo sabemos.
   */
  porConfirmar?: boolean;
  /** Nota visible junto al lugar cuando hace falta explicar la duda. */
  nota?: string;
}

export interface Sesion {
  id: string;
  tipo: TipoSesion;
  titulo: string;
  /** Obra, detalles, artistas: la segunda línea de la ficha. */
  detalle?: string;
  personas: string[];
  lugarId: string;
  /** El texto de lugar tal como aparece en la agenda oficial ("Sala 1", "Aula 110"). */
  lugarTexto: string;
  /** Fecha ISO del día, `2026-09-21`. */
  dia: string;
  /** Minutos desde medianoche, hora de Ecuador. */
  inicio: number;
  fin: number;
  /** Actividad abierta los cinco días, sin hora de cierre oficial. */
  permanente?: boolean;
  /** La hora de fin es una suposición nuestra, no dato de la organización. */
  finSupuesto?: boolean;
  /** El título venía cortado con «…» en la transcripción del documento original. */
  truncado?: boolean;
}

export interface Dia {
  fecha: string;
  nombre: string;
  corto: string;
  numero: number;
}

export const DIAS: Dia[] = [
  { fecha: "2026-09-21", nombre: "Lunes 21",     corto: "Lun 21", numero: 21 },
  { fecha: "2026-09-22", nombre: "Martes 22",    corto: "Mar 22", numero: 22 },
  { fecha: "2026-09-23", nombre: "Miércoles 23", corto: "Mié 23", numero: 23 },
  { fecha: "2026-09-24", nombre: "Jueves 24",    corto: "Jue 24", numero: 24 },
  { fecha: "2026-09-25", nombre: "Viernes 25",   corto: "Vie 25", numero: 25 },
];

export interface Aviso {
  id: string;
  texto: string;
  /** `info` para cambios, `alerta` para cancelaciones. */
  nivel: "info" | "alerta";
  /** Opcional: si apunta a una sesión, la ficha de esa sesión también lo muestra. */
  sesionId?: string;
  /** Opcional: `2026-09-23`, para mostrarlo solo ese día. */
  dia?: string;
}

export interface Agenda {
  sesiones: Sesion[];
  generado: string;
  advertencias: string[];
}
